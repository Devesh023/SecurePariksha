import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  durationMinutes: number;
  startedAt: string;
  onTimeout: () => void;
}

export const Timer: React.FC<TimerProps> = ({ durationMinutes, startedAt, onTimeout }) => {
  const calculateRemaining = () => {
    const totalSeconds = durationMinutes * 60;
    const startMs = new Date(startedAt).getTime();
    const elapsedSeconds = Math.floor((Date.now() - startMs) / 1000);
    const remaining = totalSeconds - elapsedSeconds;
    return Math.max(0, remaining);
  };

  const [timeLeft, setTimeLeft] = useState(calculateRemaining());

  useEffect(() => {
    // Check initially
    setTimeLeft(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [durationMinutes, startedAt]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.toString().padStart(2, '0');

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${formattedMins}:${formattedSecs}`;
    }
    return `${formattedMins}:${formattedSecs}`;
  };

  const isLowTime = timeLeft <= 5 * 60; // 5 minutes or less

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border font-mono font-bold text-sm shadow-md transition-colors ${
        isLowTime
          ? 'bg-destructive/10 border-destructive text-destructive animate-pulse'
          : 'bg-white/[0.02] border-card-border text-foreground'
      }`}
    >
      <Clock size={16} className={isLowTime ? 'text-destructive' : 'text-indigo-400'} />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};
export default Timer;
