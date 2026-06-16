import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamService } from '../../../../services/exam.service';
import { Exam } from '../../../../types';
import ExamCard from '../../../../components/ExamCard';
import { AlertCircle, HelpCircle } from 'lucide-react';

export const StudentExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await ExamService.getExams();
        setExams(data);
      } catch (err: any) {
        console.error('Error fetching exams:', err);
        setError('Failed to fetch available examinations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleAction = (id: string) => {
    const exam = exams.find((e) => e.id === id);
    if (exam) {
      if (exam.attemptStatus === 'ATTEMPTED') {
        navigate(`/dashboard/student/results/${exam.attemptId}`);
      } else {
        // Direct to test taking view
        navigate(`/dashboard/student/exams/attempt?examId=${id}`);
      }
    } else {
      // Direct view results by attempt ID
      navigate(`/dashboard/student/results/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-xs text-muted-foreground">Loading active evaluations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Active Examinations</h1>
        <p className="text-xs text-[#8e919e] mt-1">
          Select an available assessment to start your test. AI proctoring will be initialized automatically.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {exams.length === 0 ? (
        <div className="py-16 border border-dashed border-card-border rounded-3xl flex flex-col items-center gap-3 text-center bg-card">
          <HelpCircle size={32} className="text-muted-foreground" />
          <h3 className="font-bold text-sm text-foreground">No Exams Found</h3>
          <p className="text-xs text-[#8e919e]">There are no examinations published at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
};
export default StudentExamsPage;
