import React from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  selectedOptionId,
  onSelectOption,
  onNext,
  onPrev,
  onSubmit,
}) => {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  const difficultyColors = {
    EASY: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    HARD: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
      {/* Header Info */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-xs text-[#8e919e]">({question.marks} {question.marks === 1 ? 'Mark' : 'Marks'})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
            {question.category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${difficultyColors[question.difficulty]}`}>
            {question.difficulty}
          </span>
        </div>
      </div>

      {/* Question Text */}
      <h2 className="text-lg md:text-xl font-semibold leading-relaxed text-foreground">
        {question.text}
      </h2>

      {/* Options */}
      <div className="flex flex-col gap-3.5 my-2">
        {(question?.options || question?.questionOptions || []).map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const letter = String.fromCharCode(65 + index); // A, B, C, D

          return (
            <button
              key={option.id}
              onClick={() => onSelectOption(option.id)}
              className={`flex items-center gap-4 w-full text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-indigo-500/10 border-primary text-foreground shadow-lg shadow-indigo-500/[0.03] ring-1 ring-primary'
                  : 'bg-white/[0.01] border-card-border hover:border-white/10 hover:bg-white/[0.03] text-[#8e919e]'
              }`}
            >
              <span
                className={`flex items-center justify-center font-bold text-xs h-6 w-6 rounded-md border ${
                  isSelected
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white/[0.03] border-white/10 text-muted-foreground'
                }`}
              >
                {letter}
              </span>
              <span className="text-sm md:text-base font-medium flex-1">{option.text}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-white/[0.04] mt-4">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className={`px-5 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
            isFirst
              ? 'bg-white/[0.02] border-white/[0.03] text-muted-foreground cursor-not-allowed'
              : 'bg-white/[0.03] border-border text-foreground hover:bg-white/[0.07]'
          }`}
        >
          Previous Question
        </button>

        {isLast ? (
          <button
            onClick={onSubmit}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-success hover:bg-success/95 text-foreground shadow-lg shadow-success/20 transition-all"
          >
            Submit Examination
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 transition-all"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
};
export default QuestionCard;
