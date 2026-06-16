import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamService } from '../../../../services/exam.service';
import { Result } from '../../../../types';
import { Award, Calendar, ChevronRight, AlertTriangle, AlertCircle } from 'lucide-react';

export const StudentResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await ExamService.getResults();
        setResults(data);
      } catch (err: any) {
        console.error('Error fetching results:', err);
        setError('Failed to fetch result history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-xs text-muted-foreground">Loading performance scorecards...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Examination History</h1>
        <p className="text-xs text-[#8e919e] mt-1">
          Review score metrics, pass margins, and PDF certificates for completed tests.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {results.length === 0 ? (
        <div className="py-16 border border-dashed border-card-border rounded-3xl flex flex-col items-center gap-3 text-center bg-card">
          <Award size={32} className="text-muted-foreground" />
          <h3 className="font-bold text-sm text-foreground">No Results Found</h3>
          <p className="text-xs text-[#8e919e]">You have not completed any examination attempts yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] text-xs font-bold uppercase text-[#8e919e]">
                  <th className="px-6 py-4">Examination Title</th>
                  <th className="px-6 py-4">Date Submitted</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-center">Percentage</th>
                  <th className="px-6 py-4 text-center">Violations</th>
                  <th className="px-6 py-4 text-center">Outcome</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {results.map((res) => {
                  const examDate = new Date(res.generatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={res.id} className="hover:bg-white/[0.01] transition-colors text-sm">
                      <td className="px-6 py-4.5 font-semibold text-foreground">
                        {res.attempt.exam?.name}
                      </td>
                      <td className="px-6 py-4.5 text-[#8e919e] flex items-center gap-1.5 mt-1 border-none">
                        <Calendar size={14} className="text-indigo-400" /> {examDate}
                      </td>
                      <td className="px-6 py-4.5 text-center font-medium">
                        {res.score} / {res.attempt.exam?.totalQuestions}
                      </td>
                      <td className="px-6 py-4.5 text-center font-bold text-foreground">
                        {res.percentage.toFixed(0)}%
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold ${
                            res.violationCount > 3 ? 'text-destructive font-bold' : 'text-[#8e919e]'
                          }`}
                        >
                          {res.violationCount > 0 && <AlertTriangle size={12} className="text-warning" />}
                          {res.violationCount}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                            res.isPassed
                              ? 'bg-success/10 text-success border-success/30'
                              : 'bg-destructive/10 text-destructive border-destructive/30'
                          }`}
                        >
                          {res.isPassed ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <button
                          onClick={() => navigate(`/dashboard/student/results/${res.id}`)}
                          className="px-3.5 py-1.5 bg-white/[0.02] border border-border hover:bg-white/[0.06] text-xs font-semibold text-indigo-400 hover:text-indigo-300 rounded-xl transition-all inline-flex items-center gap-0.5"
                        >
                          View Scorecard <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudentResultsPage;
