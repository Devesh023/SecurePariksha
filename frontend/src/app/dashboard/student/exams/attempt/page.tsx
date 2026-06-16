import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../../store/auth.store';
import { ExamService } from '../../../../../services/exam.service';
import { ProctorService } from '../../../../../services/proctor.service';
import { Question } from '../../../../../types';
import QuestionCard from '../../../../../components/QuestionCard';
import Timer from '../../../../../components/Timer';
import ViolationAlert from '../../../../../components/ViolationAlert';
import WebcamMonitor from '../../../../../components/WebcamMonitor';
import { io, Socket } from 'socket.io-client';
import { AlertCircle, ShieldAlert, Monitor, Maximize2, Loader2 } from 'lucide-react';

export const ExamAttemptPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const queryParams = new URLSearchParams(location.search);
  const examId = queryParams.get('examId');

  // Attempt States
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [examName, setExamName] = useState('');
  const [duration, setDuration] = useState(0);
  const [startedAt, setStartedAt] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> selectedOptionId
  
  // Proctor / Fullscreen states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [violationAlertOpen, setViolationAlertOpen] = useState(false);
  const [currentViolationType, setCurrentViolationType] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const warningCountRef = useRef(0);

  // 1. Initialize Exam attempt
  useEffect(() => {
    if (!examId) {
      setError('Exam ID is missing in query.');
      setLoading(false);
      return;
    }

    const initAttempt = async () => {
      try {
        const data = await ExamService.startAttempt(examId);
        setAttemptId(data.attemptId);
        setExamName(data.examName);
        setDuration(data.duration);
        setStartedAt(data.startedAt);
        setQuestions(data.questions);

        // Connect Socket.io
        const socketUrl = import.meta.env.VITE_API_URL 
          ? import.meta.env.VITE_API_URL.replace('/api', '') 
          : 'http://localhost:5000';
        
        const socket = io(socketUrl);
        socketRef.current = socket;

        socket.emit('start-session', {
          attemptId: data.attemptId,
          studentId: user?.student?.id,
          examId,
          studentName: user?.student?.name,
        });

      } catch (err: any) {
        console.error('Error starting attempt:', err);
        setError(err.response?.data?.message || 'Failed to initialize exam session.');
      } finally {
        setLoading(false);
      }
    };

    initAttempt();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [examId, user]);

  // 2. Fullscreen Force trigger
  const enterFullscreen = () => {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => alert('Fullscreen is required to proceed. Please enable permissions.'));
    }
  };

  // 3. Monitor Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      
      // If we initialized successfully, and student exits fullscreen, record violation!
      if (!isFull && attemptId && !loading && !error) {
        handleViolation('FULLSCREEN_EXIT');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [attemptId, loading, error]);

  // Rate-limited Violation logger
  const handleViolation = async (type: string, screenshotUrl?: string) => {
    if (!attemptId) return;

    try {
      // 1. Post to DB
      await ProctorService.recordViolation({
        attemptId,
        type,
        screenshotUrl,
      });

      // 2. Track Warning count locally
      warningCountRef.current++;
      setWarningCount(warningCountRef.current);
      
      // 3. Display Warning overlay popup
      setCurrentViolationType(type);
      setViolationAlertOpen(true);

    } catch (dbErr) {
      console.error('Failed to log violation to server:', dbErr);
    }
  };

  // 4. Keyboard locks, Copy/Paste Locks, Tab change listeners
  useEffect(() => {
    if (!attemptId || !isFullscreen) return;

    // A. Tab switch / Blur detectors
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('TAB_SWITCH');
      }
    };

    const handleWindowBlur = () => {
      // Small timeout to avoid triggering blur on system window actions or webcam authorization alerts
      setTimeout(() => {
        if (!document.hasFocus() && document.hidden) {
          handleViolation('TAB_SWITCH');
        }
      }, 500);
    };

    // B. Copy/Cut/Paste locks
    const handleCopyCutPaste = (e: Event) => {
      e.preventDefault();
      if (e.type === 'copy') handleViolation('COPY_ATTEMPT');
      if (e.type === 'paste') handleViolation('PASTE_ATTEMPT');
    };

    // C. Right Click lock
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // D. Developer tools shortcut locks
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === 'F12') {
        e.preventDefault();
        handleViolation('DEVTOOLS_OPEN');
      }
      
      // Ctrl+Shift+I / C / J (DevTools)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) {
        e.preventDefault();
        handleViolation('DEVTOOLS_OPEN');
      }

      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        handleViolation('DEVTOOLS_OPEN');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopyCutPaste);
    document.addEventListener('cut', handleCopyCutPaste);
    document.addEventListener('paste', handleCopyCutPaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopyCutPaste);
      document.removeEventListener('cut', handleCopyCutPaste);
      document.removeEventListener('paste', handleCopyCutPaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [attemptId, isFullscreen]);

  // 5. Submit Exam Flow
  const handleSubmitExam = async () => {
    if (!attemptId) return;
    
    // Confirm dialogue
    const confirmSubmit = window.confirm('Are you sure you want to submit your examination answers?');
    if (!confirmSubmit) return;

    submitExamForcefully();
  };

  const submitExamForcefully = async () => {
    if (!attemptId) return;
    setLoading(true);

    const formattedAnswers = Object.entries(answers).map(([qId, oId]) => ({
      questionId: qId,
      selectedOptionId: oId,
    }));

    try {
      const result = await ExamService.submitAttempt({
        attemptId,
        answers: formattedAnswers,
      });

      // Exit Fullscreen mode if active
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }

      // Route to scorecard review
      navigate(`/dashboard/student/results/${result.id}`);
    } catch (submitErr) {
      console.error('Error submitting exam:', submitErr);
      setError('An error occurred during submission evaluation. Please contact administrator.');
      setLoading(false);
    }
  };

  const handleSelectOption = (optionId: string) => {
    const currentQuestion = questions[currentIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  if (loading && !attemptId) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#0a0a0c]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <span className="text-sm text-[#8e919e]">Securing exam workspace...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-[#0a0a0c] min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="p-5 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center gap-3 max-w-lg">
          <AlertCircle className="shrink-0" />
          <div>
            <h4 className="font-bold text-sm">Failed to Load Exam</h4>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/student/exams')}
          className="px-5 py-2 text-xs font-semibold rounded-xl bg-white/[0.04] border border-border text-foreground hover:bg-white/[0.08]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // FORCE FULLSCREEN DIALOGUE WINDOW
  if (!isFullscreen) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[#0a0a0c]">
        <div className="bg-card border border-indigo-500/20 max-w-lg w-full p-8 rounded-3xl text-center space-y-6 shadow-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 mx-auto">
            <Monitor size={30} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-foreground">Fullscreen Lock Required</h2>
            <p className="text-xs text-[#8e919e] leading-relaxed">
              To guarantee the integrity of evaluation, the examination panel is strictly locked under full screen constraints. Navigating out of full screen registers immediate cheating risk flags.
            </p>
          </div>

          <div className="p-4 bg-white/[0.02] border border-card-border rounded-2xl text-[11px] text-left text-[#8e919e] space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <ShieldAlert size={14} className="text-indigo-400" />
              Pre-Examination Checklist:
            </div>
            <p>1. Grant camera access permission when prompted.</p>
            <p>2. Ensure adequate lighting so that the AI can track eye boundaries.</p>
            <p>3. Do not switch tabs or open development tools.</p>
          </div>

          <button
            onClick={enterFullscreen}
            className="w-full py-3.5 text-sm font-bold bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
          >
            <Maximize2 size={16} /> Enter Full Screen & Start
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#0a0a0c] p-6 flex flex-col gap-6">
      {/* Top Header */}
      <div className="bg-card border border-card-border px-6 py-4 rounded-2xl flex items-center justify-between flex-wrap gap-4 shadow-md">
        <div>
          <h1 className="text-lg font-bold text-foreground">{examName}</h1>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block mt-0.5">
            🛡️ AI Proctoring Enabled
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Synchronized Countdown Timer */}
          {startedAt && (
            <Timer
              durationMinutes={duration}
              startedAt={startedAt}
              onTimeout={submitExamForcefully}
            />
          )}
          
          <div className="px-3.5 py-2 bg-destructive/5 border border-destructive/20 text-destructive text-xs font-semibold rounded-xl flex items-center gap-1.5">
            <span>Violations:</span>
            <span className="font-bold">{warningCount}</span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Question Attempt */}
        <div className="lg:col-span-2">
          {!questions || questions.length === 0 ? (
            <div className="bg-card border border-card-border rounded-2xl p-8 text-center text-sm text-[#8e919e]">
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loader2 className="animate-spin text-primary" size={24} />
                  <span>Loading Questions...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-8 text-destructive">
                  <AlertCircle size={24} />
                  <span>Failed to load exam questions. Please verify connection and retry.</span>
                </div>
              )}
            </div>
          ) : (
            currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                selectedOptionId={answers[currentQuestion.id] || null}
                onSelectOption={handleSelectOption}
                onNext={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                onSubmit={handleSubmitExam}
              />
            )
          )}
        </div>

        {/* Right Side: Webcam feed overlay */}
        <div className="space-y-6">
          {attemptId && socketRef.current && (
            <WebcamMonitor
              attemptId={attemptId}
              onViolation={handleViolation}
              socket={socketRef.current}
            />
          )}

          {/* Quick Question Navigator Grid */}
          <div className="bg-card border border-card-border p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase text-[#8e919e]">Question Grid</h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isSelected = idx === currentIndex;
                const isAnswered = !!answers[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 w-full rounded-lg text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-primary border-primary text-white'
                        : isAnswered
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        : 'bg-white/[0.01] border-card-border hover:border-white/10 text-[#8e919e]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Warnings Popup modal overlay */}
      <ViolationAlert
        isOpen={violationAlertOpen}
        type={currentViolationType}
        warningCount={warningCount}
        onClose={() => setViolationAlertOpen(false)}
      />
    </div>
  );
};
export default ExamAttemptPage;
