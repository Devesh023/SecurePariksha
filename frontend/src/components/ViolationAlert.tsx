import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ViolationAlertProps {
  isOpen: boolean;
  type: string;
  onClose: () => void;
  warningCount: number;
}

export const ViolationAlert: React.FC<ViolationAlertProps> = ({ isOpen, type, onClose, warningCount }) => {
  if (!isOpen) return null;

  const getFriendlyMessage = (vType: string) => {
    switch (vType) {
      case 'FACE_MISSING':
        return 'No face detected in front of the camera. Please make sure your face is clearly visible in the camera view.';
      case 'MULTIPLE_FACES':
        return 'Multiple faces detected in camera view. Ensure you are alone and no one else is visible.';
      case 'LOOKING_AWAY':
        return 'Gaze anomaly detected. Please look directly at the computer screen during the examination.';
      case 'TAB_SWITCH':
        return 'Browser tab switch detected. Navigating away from the exam window violates examination policy.';
      case 'FULLSCREEN_EXIT':
        return 'Fullscreen mode exited. You must remain in full screen for the duration of the test.';
      case 'COPY_ATTEMPT':
        return 'Clipboard copy attempt detected. Copying content is strictly forbidden.';
      case 'PASTE_ATTEMPT':
        return 'Clipboard paste attempt detected. Pasting content is strictly forbidden.';
      case 'DEVTOOLS_OPEN':
        return 'Developer Tools detected. Inspecting console elements violates test security policies.';
      default:
        return 'An environmental or browser distraction has been flagged by the AI proctor.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#13131a] border border-destructive/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-scale-up">
        {/* Warning Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive border border-destructive/20 mx-auto mb-4 animate-bounce">
          <AlertTriangle size={28} />
        </div>

        {/* Text */}
        <h3 className="text-center font-bold text-lg text-foreground mb-1">
          Proctoring Violation Flagged!
        </h3>
        <p className="text-center text-xs text-destructive font-semibold mb-4 bg-destructive/5 border border-destructive/10 py-1 px-3 rounded-full inline-block mx-auto w-max">
          Warning #{warningCount} Logged
        </p>

        <div className="bg-[#0a0a0c] border border-card-border p-4 rounded-xl mb-6">
          <h4 className="font-bold text-xs text-[#8e919e] uppercase mb-1.5">Violation Triggered:</h4>
          <p className="text-sm font-semibold text-foreground mb-2">
            {type.replace('_', ' ')}
          </p>
          <p className="text-xs text-[#8e919e] leading-relaxed">
            {getFriendlyMessage(type)}
          </p>
        </div>

        {/* Policy Notice */}
        <p className="text-[10px] text-muted-foreground text-center mb-6 leading-relaxed">
          * Warning: Continued violations will result in automatic examination termination and score invalidation.
        </p>

        {/* Acknowledge Button */}
        <button
          onClick={onClose}
          className="w-full py-3 text-sm font-bold rounded-xl bg-destructive hover:bg-destructive/95 text-white transition-colors shadow-lg shadow-destructive/20"
        >
          Acknowledge & Resume Exam
        </button>
      </div>
    </div>
  );
};
export default ViolationAlert;
