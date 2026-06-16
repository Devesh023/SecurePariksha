import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, CameraOff, Loader2 } from 'lucide-react';

interface WebcamMonitorProps {
  attemptId: string;
  onViolation: (type: string, screenshotUrl?: string) => void;
  socket: any; // Socket.io instance
}

export const WebcamMonitor: React.FC<WebcamMonitorProps> = ({ attemptId, onViolation, socket }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [proctoringActive, setProctoringActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Buffer counters to avoid false positives on transient frames
  const missingFaceBuffer = useRef(0);
  const multipleFacesBuffer = useRef(0);
  const lookingAwayBuffer = useRef(0);
  const lastViolationTime = useRef<Record<string, number>>({});

  // 1. Load Models from static folder /models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Loading face-api.js models...');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        console.log('Face models loaded successfully.');
        setModelsLoaded(true);
      } catch (err: any) {
        console.error('Error loading face-api models:', err);
        setErrorMsg('Failed to load AI proctoring neural networks. Please check static file hosting.');
      }
    };
    loadModels();
  }, []);

  // 2. Start Webcam Feed
  const startWebcam = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, frameRate: { max: 15 } }, // lightweight resolutions for performance
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err: any) {
      console.error('Error accessing webcam:', err);
      setErrorMsg('Camera access denied. Webcam permissions are required to take this exam.');
    }
  };

  // 3. Stop Webcam Feed
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
      setProctoringActive(false);
    }
  };

  useEffect(() => {
    if (modelsLoaded) {
      startWebcam();
    }
    return () => stopWebcam();
  }, [modelsLoaded]);

  // Capture frame as Base64 JPEG
  const captureScreenshot = (): string => {
    const video = videoRef.current;
    if (!video || !streamActive) return '';

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Output compressed base64 jpeg
    return canvas.toDataURL('image/jpeg', 0.5);
  };

  // Rate-limited violation logger to prevent flooding database with 30 violations per second
  const triggerViolation = (type: string) => {
    const now = Date.now();
    const cooldown = 8000; // 8 seconds cooldown per violation type
    const lastTime = lastViolationTime.current[type] || 0;

    if (now - lastTime > cooldown) {
      lastViolationTime.current[type] = now;
      const screenshot = captureScreenshot();
      onViolation(type, screenshot);
    }
  };

  // 4. Proctoring loop (analyzes feed every 800ms)
  useEffect(() => {
    let intervalId: any = null;

    if (streamActive && modelsLoaded) {
      setProctoringActive(true);

      intervalId = setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.paused || video.ended) return;

        try {
          // Detect faces with landmarks
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

          const count = detections.length;

          // -- A. Face Missing Check --
          if (count === 0) {
            missingFaceBuffer.current++;
            if (missingFaceBuffer.current >= 3) { // 3 consecutive frames (~2.4s)
              triggerViolation('FACE_MISSING');
            }
          } else {
            missingFaceBuffer.current = 0;
          }

          // -- B. Multiple Faces Check --
          if (count > 1) {
            multipleFacesBuffer.current++;
            if (multipleFacesBuffer.current >= 2) {
              triggerViolation('MULTIPLE_FACES');
            }
          } else {
            multipleFacesBuffer.current = 0;
          }

          // -- C. Looking Away Check (Gaze / Pose Estimation) --
          if (count === 1) {
            const landmarks = detections[0].landmarks;
            
            // MATH MODEL FOR GAZE DETECTOR:
            // Get positions of left jaw edge (point 0), right jaw edge (point 16), and nose tip (point 30)
            const leftJaw = landmarks.positions[0];
            const rightJaw = landmarks.positions[16];
            const noseTip = landmarks.positions[30];

            // Horizontal distance from nose to jaw borders
            const distLeft = noseTip.x - leftJaw.x;
            const distRight = rightJaw.x - noseTip.x;
            const totalWidth = distLeft + distRight;

            // Ratio of horizontal position
            const ratioX = distLeft / totalWidth;

            // If ratio is < 0.35 (turned far left) or > 0.65 (turned far right)
            const isLookingAwayX = ratioX < 0.33 || ratioX > 0.67;

            // Vertical pose estimate (nose vs eye lines)
            const leftEye = landmarks.positions[36];
            const rightEye = landmarks.positions[45];
            const eyeCenterY = (leftEye.y + rightEye.y) / 2;
            const noseHeightY = noseTip.y - eyeCenterY;

            // Average nose length is proportional to face width
            const normalNoseRatio = noseHeightY / totalWidth;
            const isLookingAwayY = normalNoseRatio < 0.12 || normalNoseRatio > 0.28; // tilted too high or low

            if (isLookingAwayX || isLookingAwayY) {
              lookingAwayBuffer.current++;
              if (lookingAwayBuffer.current >= 3) {
                triggerViolation('LOOKING_AWAY');
              }
            } else {
              lookingAwayBuffer.current = 0;
            }
          } else {
            lookingAwayBuffer.current = 0;
          }

          // -- D. Broadcast live snapshot feed via Socket to dashboard --
          const base64Snapshot = captureScreenshot();
          if (base64Snapshot && socket) {
            socket.emit('webcam-snapshot', {
              attemptId,
              image: base64Snapshot,
            });
          }

        } catch (loopErr) {
          console.error('Error in face proctoring loop:', loopErr);
        }
      }, 900);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [streamActive, modelsLoaded, attemptId, socket]);

  return (
    <div className="bg-[#13131a] border border-card-border p-4 rounded-2xl flex flex-col gap-3 shadow-md w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase text-[#8e919e] flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${proctoringActive ? 'bg-success animate-pulse' : 'bg-destructive'}`}></span>
          AI Proctoring Feed
        </h4>
        <span className="text-[10px] bg-white/[0.03] border border-white/5 px-2 py-0.5 rounded text-muted-foreground">
          320x240 @ 15fps
        </span>
      </div>

      {/* Video Window */}
      <div className="relative aspect-video rounded-xl bg-black overflow-hidden border border-white/[0.04] flex items-center justify-center">
        {!modelsLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="animate-spin text-primary" size={24} />
            <span>Loading Neural Models...</span>
          </div>
        )}

        {modelsLoaded && !streamActive && !errorMsg && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
            <CameraOff size={24} />
            <span>Webcam Inactive</span>
            <button
              onClick={startWebcam}
              className="mt-2 px-3 py-1 bg-primary text-white rounded text-[10px] font-semibold"
            >
              Enable Camera
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center gap-2 text-xs text-destructive bg-destructive/5">
            <CameraOff size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover scale-x-[-1] ${streamActive ? 'block' : 'hidden'}`} // Mirrored layout
        />

        {/* AI Overlay indicator */}
        {proctoringActive && (
          <div className="absolute bottom-2 left-2 bg-black/60 border border-white/10 px-2 py-0.5 rounded text-[9px] font-mono text-success flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-success"></span>
            GAZE ACTIVE
          </div>
        )}
      </div>

      <div className="text-[10px] text-muted-foreground leading-relaxed flex items-start gap-1">
        <span className="text-indigo-400">ℹ️</span>
        Keep your face centered and look directly at the screen. Turning away or exiting the view will log violations.
      </div>
    </div>
  );
};
export default WebcamMonitor;
