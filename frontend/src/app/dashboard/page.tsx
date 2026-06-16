import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { AnalyticsService } from '../../services/analytics.service';
import { ExamService } from '../../services/exam.service';
import { DashboardStats, Exam } from '../../types';
import {
  PassFailChart,
  StudentGrowthChart,
  ViolationTrendsChart,
  CategoryPerformanceChart,
} from '../../components/AnalyticsCharts';
import {
  Users,
  BookOpen,
  FileText,
  Percent,
  Award,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  History,
  Info,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
  const [studentExams, setStudentExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user?.role === 'SUPER_ADMIN' || user?.role === 'EXAM_ADMIN') {
          const stats = await AnalyticsService.getDashboardStats();
          setAdminStats(stats);
        } else if (user?.role === 'STUDENT') {
          const exams = await ExamService.getExams();
          setStudentExams(exams);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Failed to fetch dashboard metrics. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-sm text-muted-foreground font-medium">Aggregating analytical models...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center gap-3 max-w-xl mx-auto my-12">
        <AlertTriangle />
        <div>
          <h4 className="font-bold text-sm">Dashboard Error</h4>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  const renderAdminDashboard = () => {
    if (!adminStats) return null;

    const cards = adminStats.cards;
    const charts = adminStats.charts;

    const statItems = [
      { label: 'Total Students', value: cards.totalStudents, icon: <Users className="text-indigo-400" />, desc: 'Registered candidates' },
      { label: 'Total Exams', value: cards.totalExams, icon: <BookOpen className="text-indigo-400" />, desc: 'Configured exams' },
      { label: 'Total Attempts', value: cards.totalAttempts, icon: <FileText className="text-indigo-400" />, desc: 'Submitted assessments' },
      { label: 'Avg Passing Rate', value: `${cards.passPercentage}%`, icon: <Percent className="text-success" />, desc: 'Evaluated scores pass rate' },
      { label: 'Average Score', value: `${cards.averageScore}%`, icon: <Award className="text-success" />, desc: 'Average participant percentage' },
      {
        label: 'Violations Flagged Today',
        value: cards.violationsToday,
        icon: <AlertTriangle className={cards.violationsToday > 0 ? 'text-destructive animate-pulse' : 'text-[#8e919e]'} />,
        desc: 'Incidents in last 24h',
        highlight: cards.violationsToday > 0,
      },
    ];

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, {user?.admin?.name}
          </h1>
          <p className="text-sm text-[#8e919e] mt-1.5">
            Monitoring SecurePariksha systems. Integrity models are fully engaged.
          </p>
        </div>

        {/* Aggregate Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border bg-card ${
                item.highlight ? 'border-destructive/30 shadow-lg shadow-destructive/[0.02]' : 'border-card-border shadow-md'
              } flex items-center justify-between group hover:border-indigo-500/20 transition-all duration-300`}
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#8e919e] uppercase tracking-wider block">{item.label}</span>
                <span className="text-3xl font-bold text-foreground block group-hover:text-indigo-400 transition-colors">
                  {item.value}
                </span>
                <span className="text-[10px] text-muted-foreground block">{item.desc}</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pass vs Fail Ratio */}
          <div className="bg-card border border-card-border p-6 rounded-2xl">
            <h3 className="font-bold text-sm text-[#8e919e] uppercase tracking-wider mb-4">Pass vs Fail Ratio</h3>
            <PassFailChart labels={charts.passFail.labels} datasets={charts.passFail.datasets} />
          </div>

          {/* Student Growth curve */}
          <div className="bg-card border border-card-border p-6 rounded-2xl">
            <h3 className="font-bold text-sm text-[#8e919e] uppercase tracking-wider mb-4">Student Growth</h3>
            <StudentGrowthChart labels={charts.studentGrowth.labels} datasets={charts.studentGrowth.datasets} />
          </div>

          {/* Violation trends */}
          <div className="bg-card border border-card-border p-6 rounded-2xl">
            <h3 className="font-bold text-sm text-[#8e919e] uppercase tracking-wider mb-4">Violation Volume Trend</h3>
            <ViolationTrendsChart labels={charts.violationTrends.labels} datasets={charts.violationTrends.datasets} />
          </div>

          {/* Category Performance bar */}
          <div className="bg-card border border-card-border p-6 rounded-2xl">
            <h3 className="font-bold text-sm text-[#8e919e] uppercase tracking-wider mb-4">Average Score by Category</h3>
            <CategoryPerformanceChart
              labels={charts.categoryPerformance.labels}
              datasets={charts.categoryPerformance.datasets}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderStudentDashboard = () => {
    const attemptedExams = studentExams.filter((e) => e.attemptStatus === 'ATTEMPTED');
    const availableExams = studentExams.filter((e) => e.attemptStatus === 'NOT_ATTEMPTED' || e.attemptStatus === 'IN_PROGRESS');

    // Calculate Average Score
    let avgScore = 0;
    if (attemptedExams.length > 0) {
      const sum = attemptedExams.reduce((acc, e) => acc + (e.percentage || 0), 0);
      avgScore = Math.round(sum / attemptedExams.length);
    }

    const cards = [
      { label: 'Available Tests', value: availableExams.length, icon: <BookOpen className="text-indigo-400" />, desc: 'Assessments to attempt' },
      { label: 'Completed Tests', value: attemptedExams.length, icon: <FileText className="text-success" />, desc: 'Submitted exams' },
      { label: 'Average Score', value: `${avgScore}%`, icon: <Award className="text-indigo-400" />, desc: 'Across finished exams' },
    ];

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/20 via-indigo-950/10 to-transparent border border-indigo-500/10 relative overflow-hidden">
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-48 h-48 rounded-full bg-indigo-500/10 blur-[60px] pointer-events-none"></div>
          <div className="max-w-xl relative z-10 space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Hello, {user?.student?.name}
            </h1>
            <p className="text-sm text-[#8e919e] leading-relaxed">
              Welcome to your assessment panel. All tests are proctored in real time using webcam verification and screen layout integrity checking.
            </p>
            <div className="pt-2">
              <Link
                to="/dashboard/student/exams"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all hover:translate-x-1"
              >
                Browse Available Exams <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-card-border bg-card flex items-center justify-between hover:border-indigo-500/15 transition-all shadow-md duration-300"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#8e919e] uppercase tracking-wider block">{card.label}</span>
                <span className="text-3xl font-bold text-foreground block">{card.value}</span>
                <span className="text-[10px] text-muted-foreground block">{card.desc}</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Right Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent attempts */}
          <div className="bg-card border border-card-border p-6 rounded-2xl lg:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-[#8e919e] uppercase tracking-wider flex items-center gap-2">
              <History size={16} className="text-indigo-400" /> Recent Activity
            </h3>

            {attemptedExams.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                You haven't completed any assessments yet.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.03] max-h-80 overflow-y-auto">
                {attemptedExams.slice(0, 5).map((ex) => (
                  <div key={ex.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground line-clamp-1">{ex.name}</h4>
                      <p className="text-[10px] text-[#8e919e] mt-0.5">
                        Duration: {ex.duration}m | Passing threshold: {ex.passingPercentage}%
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-bold block text-foreground">{ex.percentage?.toFixed(0)}%</span>
                        <span
                          className={`text-[9px] font-bold uppercase ${ex.isPassed ? 'text-success' : 'text-destructive'}`}
                        >
                          {ex.isPassed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/dashboard/student/results/${ex.attemptId}`)}
                        className="p-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] text-indigo-400"
                        title="View Scorecard"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guidelines Box */}
          <div className="bg-card border border-card-border p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-[#8e919e] uppercase tracking-wider flex items-center gap-2">
              <Info size={16} className="text-indigo-400" /> Proctoring Rules
            </h3>
            <ul className="space-y-3.5 text-xs text-[#8e919e] leading-relaxed">
              <li className="flex gap-2">
                <span>📷</span>
                <span>Webcam must remain enabled and face clearly visible at all times.</span>
              </li>
              <li className="flex gap-2">
                <span>🖥️</span>
                <span>You must remain in Full Screen mode. Exiting Full Screen logs a violation.</span>
              </li>
              <li className="flex gap-2">
                <span>🔲</span>
                <span>Do not switch tabs, minimize windows, or use split-screen layouts.</span>
              </li>
              <li className="flex gap-2">
                <span>🛑</span>
                <span>Inspecting developer tools or right-clicking is disabled.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return user?.role === 'SUPER_ADMIN' || user?.role === 'EXAM_ADMIN'
    ? renderAdminDashboard()
    : renderStudentDashboard();
};
export default DashboardPage;
