import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExamService } from '../../../../services/exam.service';
import { Result, Violation } from '../../../../types';
import { generateScorecardPDF } from '../../../../utils/pdf';
import {
  Download,
  AlertTriangle,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  Calendar,
  User as UserIcon,
  ChevronLeft,
} from 'lucide-react';

export const StudentResultDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchResult = async () => {
      try {
        const data = await ExamService.getResultById(id);
        setResult(data);
      } catch (err: any) {
        console.error('Error fetching result details:', err);
        setError('Failed to fetch detailed scorecard. Verify credentials and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  const handleDownloadPDF = () => {
    if (result) {
      generateScorecardPDF(result);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-xs text-muted-foreground font-medium">Extracting performance details...</span>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center space-y-4">
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs">
          {error || 'Scorecard details could not be found.'}
        </div>
        <button
          onClick={() => navigate('/dashboard/student/results')}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/[0.04] border border-border text-foreground hover:bg-white/[0.08]"
        >
          Return to History
        </button>
      </div>
    );
  }

  const exam = result.attempt.exam!;
  const student = result.attempt.student!;
  const passingThreshold = exam.passingPercentage;
  const isPassed = result.isPassed;

  // Format date
  const examDate = new Date(result.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Format Time Taken
  const timeSeconds = result.timeTaken;
  const mins = Math.floor(timeSeconds / 60);
  const secs = timeSeconds % 60;
  const durationStr = `${mins}m ${secs}s`;

  // Calculate risk summary
  const getCheatingRisk = (vCount: number) => {
    if (vCount === 0) return { label: 'Low Risk', color: 'text-success bg-success/10 border-success/20' };
    if (vCount <= 3) return { label: 'Medium Risk', color: 'text-warning bg-warning/10 border-warning/20' };
    return { label: 'High Risk', color: 'text-destructive bg-destructive/10 border-destructive/20' };
  };
  const risk = getCheatingRisk(result.violationCount);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back CTA & Action button */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} /> Back to History
        </button>

        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
        >
          <Download size={14} /> Download PDF Scorecard
        </button>
      </div>

      {/* Outcome Banner */}
      <div
        className={`p-6 md:p-8 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden ${
          isPassed
            ? 'bg-gradient-to-br from-success/10 to-transparent border-success/30'
            : 'bg-gradient-to-br from-destructive/10 to-transparent border-destructive/30'
        }`}
      >
        <div className="space-y-1.5 relative z-10">
          <span
            className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              isPassed
                ? 'bg-success/25 text-success border-success/40'
                : 'bg-destructive/25 text-destructive border-destructive/40'
            }`}
          >
            {isPassed ? 'Passed' : 'Failed'}
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold text-foreground">{exam.name}</h1>
          <p className="text-xs text-[#8e919e]">Submitted successfully on {examDate}</p>
        </div>

        {/* Score display */}
        <div className="shrink-0 flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl">
          <div className="text-right">
            <span className="text-[10px] font-bold text-[#8e919e] uppercase block">Final Percentage</span>
            <span className={`text-2xl font-black ${isPassed ? 'text-success' : 'text-destructive'}`}>
              {result.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-10 w-[1px] bg-white/[0.06]"></div>
          <div>
            <span className="text-[10px] font-bold text-[#8e919e] uppercase block">Total Marks</span>
            <span className="text-lg font-bold text-foreground">
              {result.score} / {exam.totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Parameters grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Param: Time Taken */}
        <div className="p-5 bg-card border border-card-border rounded-2xl space-y-1">
          <span className="text-[10px] font-semibold text-[#8e919e] uppercase tracking-wider block">Time Taken</span>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-indigo-400" />
            <span className="text-base font-bold text-foreground">{durationStr}</span>
          </div>
          <span className="text-[9px] text-muted-foreground block">Allowed: {exam.duration}m</span>
        </div>

        {/* Param: Rank */}
        <div className="p-5 bg-card border border-card-border rounded-2xl space-y-1">
          <span className="text-[10px] font-semibold text-[#8e919e] uppercase tracking-wider block">Class Rank</span>
          <div className="flex items-center gap-2">
            <Award size={16} className="text-indigo-400" />
            <span className="text-base font-bold text-foreground">#{result.rank || 'N/A'}</span>
          </div>
          <span className="text-[9px] text-muted-foreground block">Of total submitted attempts</span>
        </div>

        {/* Param: Warning Count */}
        <div className="p-5 bg-card border border-card-border rounded-2xl space-y-1">
          <span className="text-[10px] font-semibold text-[#8e919e] uppercase tracking-wider block">Proctor Warnings</span>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" />
            <span className="text-base font-bold text-foreground">{result.violationCount} Flags</span>
          </div>
          <span className="text-[9px] text-muted-foreground block">Flagged during evaluation</span>
        </div>

        {/* Param: Cheating Risk Profile */}
        <div className="p-5 bg-card border border-card-border rounded-2xl space-y-1">
          <span className="text-[10px] font-semibold text-[#8e919e] uppercase tracking-wider block">Cheating Risk</span>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${risk.color}`}>{risk.label}</span>
          </div>
          <span className="text-[9px] text-muted-foreground block">Evaluated by AI proctor</span>
        </div>
      </div>

      {/* Candidate Profile summary details */}
      <div className="bg-card border border-card-border p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-[#8e919e] uppercase tracking-wider flex items-center gap-2">
          <UserIcon size={16} className="text-indigo-400" /> Candidate Verification details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block mb-0.5">Candidate Name:</span>
            <span className="font-semibold text-foreground">{student.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-0.5">Roll Number:</span>
            <span className="font-semibold text-foreground font-mono">{student.rollNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-0.5">Passing Score required:</span>
            <span className="font-semibold text-foreground">{passingThreshold}%</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-0.5">Verified Verification stamp:</span>
            <span className="font-semibold text-indigo-400 font-mono">
              {btoa(`${student.name}:${result.score}`).substring(0, 10)}
            </span>
          </div>
        </div>
      </div>

      {/* Proctoring Violations Log details (if any) */}
      {result.violationCount > 0 && result.attempt.violations && result.attempt.violations.length > 0 && (
        <div className="bg-card border border-card-border p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-destructive uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle size={16} /> Proctoring Violation Incidents
          </h3>
          <div className="divide-y divide-white/[0.03] space-y-3 max-h-60 overflow-y-auto">
            {result.attempt.violations.map((violation: Violation) => {
              const vTime = new Date(violation.timestamp).toLocaleTimeString();
              return (
                <div key={violation.id} className="pt-3 flex items-center justify-between gap-4 first:pt-0">
                  <div>
                    <span className="text-xs font-semibold text-foreground">{violation.type.replace('_', ' ')}</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">Logged at {vTime}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-red-400 px-2 py-0.5 rounded bg-red-500/5 border border-red-500/10">
                      Risk +{violation.riskScore}
                    </span>
                    {violation.screenshotUrl && (
                      <a
                        href={violation.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-400 hover:underline font-semibold"
                      >
                        Evidence screenshot
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Answer key / Question review */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-[#8e919e] uppercase tracking-wider">Question Review Panel</h3>

        <div className="space-y-4">
          {exam.examQuestions?.map((eq: any, qIdx: number) => {
            const question = eq.question;
            
            // Find student's answer record for this question
            const studentAnsRecord = result.attempt.studentAnswers?.find((sa: any) => sa.questionId === question.id);
            const selectedOptId = studentAnsRecord?.selectedOptionId;
            const isAnswerCorrect = studentAnsRecord?.isCorrect || false;

            return (
              <div key={question.id} className="bg-card border border-card-border p-6 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-4 pb-2.5 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-indigo-400">Question {qIdx + 1}</span>
                    <span className="text-[10px] text-muted-foreground">({question.marks} {question.marks === 1 ? 'Mark' : 'Marks'})</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${
                      isAnswerCorrect ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {isAnswerCorrect ? (
                      <>
                        <CheckCircle2 size={12} /> Correct (+{question.marks})
                      </>
                    ) : (
                      <>
                        <XCircle size={12} /> Incorrect (+0)
                      </>
                    )}
                  </span>
                </div>

                <h4 className="font-medium text-foreground text-sm leading-relaxed">{question.text}</h4>

                {/* Option grid display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {question.questionOptions?.map((option: any) => {
                    const isUserSelected = selectedOptId === option.id;
                    const isCorrectOption = option.isCorrect;

                    let cardStyles = 'bg-white/[0.01] border-card-border text-[#8e919e]';
                    if (isUserSelected) {
                      cardStyles = isAnswerCorrect
                        ? 'bg-success/5 border-success text-success'
                        : 'bg-destructive/5 border-destructive text-destructive';
                    } else if (isCorrectOption) {
                      cardStyles = 'bg-success/5 border-success/40 text-success';
                    }

                    return (
                      <div
                        key={option.id}
                        className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 ${cardStyles}`}
                      >
                        <span className="flex-1">{option.text}</span>
                        {isCorrectOption && (
                          <span className="text-[9px] bg-success/20 text-success border border-success/30 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                            Correct Answer
                          </span>
                        )}
                        {!isCorrectOption && isUserSelected && (
                          <span className="text-[9px] bg-destructive/20 text-destructive border border-destructive/30 px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default StudentResultDetailsPage;
