import React, { useEffect, useState } from 'react';
import { ExamService } from '../../../../services/exam.service';
import { api } from '../../../../services/api';
import { Exam, Question } from '../../../../types';
import { Plus, Edit2, Trash2, Calendar, Clock, HelpCircle, Save, X, AlertCircle } from 'lucide-react';

export const AdminExamsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Editor states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [passingPercentage, setPassingPercentage] = useState('50');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'COMPLETED'>('DRAFT');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const fetchExamsAndQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const examsData = await ExamService.getExams();
      setExams(examsData);

      const { data: qData } = await api.get('/questions');
      setQuestions(qData);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError('Failed to retrieve active exams or question bank from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamsAndQuestions();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setDuration('60');
    setPassingPercentage('50');
    
    // Default dates
    const now = new Date();
    const future = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
    setStartDate(now.toISOString().slice(0, 16));
    setEndDate(future.toISOString().slice(0, 16));
    
    setStatus('DRAFT');
    setSelectedQuestions([]);
    setEditorOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingId(exam.id);
    setName(exam.name);
    setDescription(exam.description || '');
    setDuration(exam.duration.toString());
    setPassingPercentage(exam.passingPercentage.toString());
    setStartDate(new Date(exam.startDate).toISOString().slice(0, 16));
    setEndDate(new Date(exam.endDate).toISOString().slice(0, 16));
    setStatus(exam.status);
    
    // Gather question IDs linked to this exam
    const linkedIds = exam.examQuestions?.map((eq: any) => eq.questionId) || [];
    setSelectedQuestions(linkedIds);
    setEditorOpen(true);
  };

  const handleToggleQuestion = (qId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleDelete = async (id: string) => {
    const confirmDel = window.confirm('Are you sure you want to delete this exam configuration?');
    if (!confirmDel) return;

    try {
      await ExamService.deleteExam(id);
      fetchExamsAndQuestions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete exam.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedQuestions.length === 0) {
      alert('You must select at least one question to link to this exam.');
      return;
    }

    const payload = {
      name,
      description,
      duration: Number(duration),
      totalQuestions: selectedQuestions.length,
      passingPercentage: Number(passingPercentage),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status,
      questionIds: selectedQuestions,
    };

    try {
      if (editingId) {
        await ExamService.updateExam(editingId, payload);
      } else {
        await ExamService.createExam(payload);
      }
      setEditorOpen(false);
      fetchExamsAndQuestions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save exam configurations.');
    }
  };

  if (loading && exams.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-xs text-muted-foreground">Fetching exams summary...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Manage Examinations</h1>
          <p className="text-xs text-[#8e919e] mt-1">
            Configure, publish, and assign questions to examination sessions.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
        >
          <Plus size={16} /> Create New Exam
        </button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Modal Drawer overlay */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#13131a] border border-card-border rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative flex flex-col gap-6">
            <button
              onClick={() => setEditorOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold text-foreground">
              {editingId ? 'Edit Exam configurations' : 'Create New Examination'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-[#8e919e]">Exam Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Java OOP Foundation Assessment"
                    className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-[#8e919e]">Exam Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed syllabus or evaluation criteria..."
                    className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none resize-none"
                  />
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#8e919e]">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="60"
                    className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none"
                  />
                </div>

                {/* Passing percentage */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#8e919e]">Passing Threshold (%)</label>
                  <input
                    type="number"
                    required
                    value={passingPercentage}
                    onChange={(e) => setPassingPercentage(e.target.value)}
                    placeholder="50"
                    className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none"
                  />
                </div>

                {/* Start Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#8e919e]">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none"
                  />
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#8e919e]">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none"
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-[#8e919e]">Publication Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED' | 'COMPLETED')}
                    className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none"
                  >
                    <option value="DRAFT">DRAFT (Hidden from candidates)</option>
                    <option value="PUBLISHED">PUBLISHED (Open for attempts)</option>
                  </select>
                </div>
              </div>

              {/* Questions checkboxes selection bank */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#8e919e] uppercase tracking-wider block">
                  Assign Questions ({selectedQuestions.length} Selected)
                </label>
                <div className="border border-card-border rounded-2xl bg-[#0a0a0c] p-4 max-h-48 overflow-y-auto space-y-2">
                  {questions.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                      No questions configured in bank. Create questions first.
                    </div>
                  ) : (
                    questions.map((q) => {
                      const checked = selectedQuestions.includes(q.id);
                      return (
                        <label
                          key={q.id}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.02] cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleQuestion(q.id)}
                            className="mt-0.5 accent-primary"
                          />
                          <div className="flex-1">
                            <span className="font-semibold text-foreground block">{q.text}</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              Category: {q.category} | Difficulty: {q.difficulty} | Marks: {q.marks}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-white/[0.03] border border-border text-foreground hover:bg-white/[0.07]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 flex items-center gap-1.5"
                >
                  <Save size={14} /> Save Configurations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid listing */}
      {exams.length === 0 ? (
        <div className="py-16 text-center text-xs text-muted-foreground">
          No exams configured yet. Click "Create New Exam" to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-card border border-card-border p-6 rounded-2xl flex flex-col gap-4 shadow-md group hover:border-indigo-500/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-bold text-base text-foreground line-clamp-1">{exam.name}</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    exam.status === 'PUBLISHED'
                      ? 'bg-success/10 text-success border-success/20'
                      : 'bg-white/5 text-[#8e919e] border-white/10'
                  }`}
                >
                  {exam.status}
                </span>
              </div>

              <p className="text-xs text-[#8e919e] line-clamp-2 h-8">
                {exam.description || 'No description configured.'}
              </p>

              <div className="grid grid-cols-2 gap-3 py-2.5 border-t border-b border-white/[0.03] text-[11px] text-[#8e919e]">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} className="text-indigo-400" />
                  <span>{exam.duration} mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-indigo-400" />
                  <span>{exam.totalQuestions} MCQs</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Calendar size={13} className="text-indigo-400" />
                  <span>
                    {new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleOpenEdit(exam)}
                  className="flex-1 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 text-xs font-semibold text-indigo-400 flex items-center justify-center gap-1 transition-colors"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="p-2 rounded-xl bg-destructive/5 hover:bg-destructive/15 border border-destructive/10 text-destructive flex items-center justify-center transition-colors"
                  title="Delete Exam"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AdminExamsPage;
