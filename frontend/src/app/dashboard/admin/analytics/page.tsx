import React, { useEffect, useState } from 'react';
import { AnalyticsService } from '../../../../services/analytics.service';
import { AlertTriangle, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';

interface ExamStat {
  id: string;
  name: string;
  totalAttempts: number;
  passPercentage: number;
  averagePercentage: number;
  totalViolations: number;
}

interface ViolationStat {
  type: string;
  count: number;
}

export const AdminAnalyticsPage: React.FC = () => {
  const [examStats, setExamStats] = useState<ExamStat[]>([]);
  const [violationStats, setViolationStats] = useState<ViolationStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const eStats = await AnalyticsService.getExamsStats();
        setExamStats(eStats);

        const vStats = await AnalyticsService.getViolationsStats();
        setViolationStats(vStats);
      } catch (err: any) {
        console.error('Error fetching analytics stats:', err);
        setError('Failed to aggregate system statistics from database logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-xs text-muted-foreground">Synthesizing platform logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Detailed System Analytics</h1>
        <p className="text-xs text-[#8e919e] mt-1">
          Perform audit reviews of overall exam difficulty, success metrics, and AI compliance trends.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of details */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Exams Stats details table (cols span 2) */}
        <div className="xl:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-[#8e919e] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" /> Exam Performance Summary
          </h3>

          <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.04] text-xs font-bold uppercase text-[#8e919e]">
                    <th className="px-6 py-4">Exam Name</th>
                    <th className="px-6 py-4 text-center">Attempts</th>
                    <th className="px-6 py-4 text-center">Passing Rate</th>
                    <th className="px-6 py-4 text-center">Average Score</th>
                    <th className="px-6 py-4 text-center">Total Violations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {examStats.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                        No exam statistics compiled.
                      </td>
                    </tr>
                  ) : (
                    examStats.map((exam) => (
                      <tr key={exam.id} className="hover:bg-white/[0.01] transition-colors text-sm">
                        <td className="px-6 py-4.5 font-semibold text-foreground">{exam.name}</td>
                        <td className="px-6 py-4.5 text-center">{exam.totalAttempts}</td>
                        <td className="px-6 py-4.5 text-center font-bold text-success">{exam.passPercentage}%</td>
                        <td className="px-6 py-4.5 text-center font-bold">{exam.averagePercentage}%</td>
                        <td className="px-6 py-4.5 text-center text-red-400 font-medium">{exam.totalViolations}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Violations Stats breakdown */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-[#8e919e] uppercase tracking-wider flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-400" /> Violation Types Breakdown
          </h3>

          <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] text-xs font-bold uppercase text-[#8e919e]">
                  <th className="px-6 py-4">Incident Category</th>
                  <th className="px-6 py-4 text-center">Occurrences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {violationStats.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-8 text-xs text-muted-foreground">
                      No violations logged.
                    </td>
                  </tr>
                ) : (
                  violationStats.map((stat) => (
                    <tr key={stat.type} className="hover:bg-white/[0.01] transition-colors text-sm">
                      <td className="px-6 py-4 font-semibold text-foreground">{stat.type.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-center font-bold text-red-400">{stat.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminAnalyticsPage;
