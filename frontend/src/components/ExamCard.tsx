import React from 'react';
import { Exam } from '../types';
import { Calendar, Clock, HelpCircle, CheckCircle, AlertCircle, Play } from 'lucide-react';

interface ExamCardProps {
  exam: Exam;
  onAction: (examId: string) => void;
  isAdmin?: boolean;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, onAction, isAdmin = false }) => {
  const isStarted = new Date() >= new Date(exam.startDate);
  const isEnded = new Date() > new Date(exam.endDate);

  const getStatusBadge = () => {
    if (isAdmin) {
      if (exam.status === 'PUBLISHED') {
        return <span className="bg-success/10 text-success border border-success/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">Active</span>;
      }
      return <span className="bg-white/10 text-[#8e919e] border border-white/20 text-[10px] px-2 py-0.5 rounded-full font-semibold">Draft</span>;
    }

    // Student status badges
    switch (exam.attemptStatus) {
      case 'ATTEMPTED':
        return <span className="bg-success/10 text-success border border-success/30 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><CheckCircle size={10} /> Attempted</span>;
      case 'IN_PROGRESS':
        return <span className="bg-warning/10 text-warning border border-warning/30 text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><AlertCircle size={10} /> In Progress</span>;
      default:
        if (isEnded) {
          return <span className="bg-destructive/10 text-destructive border border-destructive/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">Expired</span>;
        }
        if (!isStarted) {
          return <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">Upcoming</span>;
        }
        return <span className="bg-success/10 text-success border border-success/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">Available</span>;
    }
  };

  const getActionButton = () => {
    if (isAdmin) {
      return (
        <button
          onClick={() => onAction(exam.id)}
          className="w-full text-center py-2.5 text-xs font-semibold rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-border text-[#f4f4f7] transition-all"
        >
          Edit Configurations
        </button>
      );
    }

    if (exam.attemptStatus === 'ATTEMPTED') {
      return (
        <button
          onClick={() => onAction(exam.attemptId || '')}
          className="w-full py-2.5 text-xs font-semibold rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 transition-all flex items-center justify-center gap-1.5"
        >
          View Scorecard
        </button>
      );
    }

    if (exam.attemptStatus === 'IN_PROGRESS') {
      return (
        <button
          onClick={() => onAction(exam.id)}
          className="w-full py-2.5 text-xs font-semibold rounded-xl bg-warning hover:bg-warning/95 text-black transition-all flex items-center justify-center gap-1.5"
        >
          Resume Exam <Play size={14} />
        </button>
      );
    }

    if (isEnded) {
      return (
        <button
          disabled
          className="w-full py-2.5 text-xs font-semibold rounded-xl bg-white/[0.02] border border-white/[0.03] text-[#8e919e] cursor-not-allowed"
        >
          Exam Ended
        </button>
      );
    }

    if (!isStarted) {
      return (
        <button
          disabled
          className="w-full py-2.5 text-xs font-semibold rounded-xl bg-white/[0.02] border border-white/[0.03] text-[#8e919e] cursor-not-allowed"
        >
          Starts {new Date(exam.startDate).toLocaleDateString()}
        </button>
      );
    }

    return (
      <button
        onClick={() => onAction(exam.id)}
        className="w-full py-2.5 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/95 text-white transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/25"
      >
        Start Exam <Play size={14} />
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-card-border bg-card p-6 flex flex-col gap-4 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/[0.02] transition-all group duration-300">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-bold text-lg text-foreground group-hover:text-indigo-400 transition-colors line-clamp-1">
          {exam.name}
        </h3>
        {getStatusBadge()}
      </div>

      <p className="text-sm text-[#8e919e] line-clamp-2 h-10">
        {exam.description || 'No description provided for this evaluation.'}
      </p>

      {/* Meta parameters */}
      <div className="grid grid-cols-2 gap-3.5 py-2 border-t border-b border-white/[0.04] text-xs text-[#8e919e]">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-indigo-400" />
          <span>{exam.duration} Minutes</span>
        </div>
        <div className="flex items-center gap-2">
          <HelpCircle size={15} className="text-indigo-400" />
          <span>{exam.totalQuestions} Questions</span>
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <Calendar size={15} className="text-indigo-400" />
          <span>
            {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground bg-white/[0.02] px-3.5 py-2 rounded-lg border border-white/[0.02]">
        <span>Passing Score:</span>
        <span className="text-[#f4f4f7]">{exam.passingPercentage}%</span>
      </div>

      {getActionButton()}
    </div>
  );
};
export default ExamCard;
