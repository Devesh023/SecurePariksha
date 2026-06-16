import React, { useEffect, useState } from 'react';
import { api } from '../../../../services/api';
import { Question } from '../../../../types';
import { Plus, Edit2, Trash2, HelpCircle, Save, X, AlertCircle } from 'lucide-react';

export const AdminQuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [text, setText] = useState('');
  const [category, setCategory] = useState('Java');
  const [difficulty, setDifficulty] = useState('EASY');
  const [marks, setMarks] = useState('1');
  
  // 4 options states
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/questions');
      setQuestions(data);
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      setError('Failed to fetch question bank. Please verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setText('');
    setCategory('Java');
    setDifficulty('EASY');
    setMarks('1');
    setOptions([
      { text: '', isCorrect: true }, // Default first correct
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]);
    setEditorOpen(true);
  };

  const handleOpenEdit = (q: Question) => {
    setEditingId(q.id);
    setText(q.text);
    setCategory(q.category);
    setDifficulty(q.difficulty);
    setMarks(q.marks.toString());
    
    // Map existing options
    const mapped = q.questionOptions.map((o) => ({
      text: o.text,
      isCorrect: !!o.isCorrect,
    }));
    setOptions(mapped);
    setEditorOpen(true);
  };

  const handleOptionTextChange = (idx: number, val: string) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[idx].text = val;
      return copy;
    });
  };

  const handleSelectCorrect = (idx: number) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({
        ...opt,
        isCorrect: i === idx,
      }))
    );
  };

  const handleDelete = async (id: string) => {
    const confirmDel = window.confirm('Are you sure you want to delete this question? This will also remove it from any linked exams.');
    if (!confirmDel) return;

    try {
      await api.delete(`/questions/${id}`);
      fetchQuestions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete question.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (options.some((o) => !o.text.trim())) {
      alert('All 4 option fields must be filled.');
      return;
    }

    const payload = {
      text,
      category,
      difficulty,
      marks: Number(marks),
      options,
    };

    try {
      if (editingId) {
        await api.put(`/questions/${editingId}`, payload);
      } else {
        await api.post('/questions', payload);
      }
      setEditorOpen(false);
      fetchQuestions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save question.');
    }
  };

  if (loading && questions.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-xs text-muted-foreground">Syncing question banks...</span>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    EASY: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    HARD: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Header and Create CTA */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Question Bank Management</h1>
          <p className="text-xs text-[#8e919e] mt-1">
            Create MCQs, assign categorizations, difficulties, scoring weightages, and configure correct choices.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
        >
          <Plus size={16} /> Create Question
        </button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Question Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#13131a] border border-card-border rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative flex flex-col gap-5">
            <button
              onClick={() => setEditorOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold text-foreground">
              {editingId ? 'Edit Question Item' : 'New Question Bank Item'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Question Text */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8e919e]">Question Text</label>
                <textarea
                  required
                  rows={2}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Which of the following describes..."
                  className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#8e919e]">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none"
                  >
                    {['Java', 'Python', 'JavaScript', 'React', 'Node.js', 'DBMS', 'Operating System', 'Computer Networks', 'Aptitude', 'SQL'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#8e919e]">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>

                {/* Marks */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#8e919e]">Marks Weightage</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    placeholder="1"
                    className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Options Fields */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#8e919e] uppercase tracking-wider block">
                  Multiple Choice Options (Select Correct Choice)
                </label>
                
                {options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectCorrect(idx)}
                        className={`h-9 w-9 rounded-xl border font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                          opt.isCorrect
                            ? 'bg-success border-success text-white shadow-lg shadow-success/15'
                            : 'bg-[#0a0a0c] border-card-border text-[#8e919e] hover:border-white/10'
                        }`}
                        title="Mark as Correct Option"
                      >
                        {letter}
                      </button>
                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                        placeholder={`Option ${letter} Text`}
                        className="flex-1 bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
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
                  <Save size={14} /> Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid listing */}
      {questions.length === 0 ? (
        <div className="py-16 text-center text-xs text-muted-foreground">
          No questions configured in bank yet. Click "Create Question" to add database MCQs.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-card border border-card-border p-6 rounded-2xl flex flex-col gap-4 shadow-md group hover:border-indigo-500/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/[0.03] border border-white/5 text-[#8e919e]">
                    {q.category}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${difficultyColors[q.difficulty]}`}>
                    {q.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-semibold">({q.marks} {q.marks === 1 ? 'Mark' : 'Marks'})</span>
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-1 rounded bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] text-indigo-400"
                    title="Edit Question"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1 rounded bg-destructive/5 border border-destructive/10 hover:bg-destructive/15 text-destructive"
                    title="Delete Question"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <h4 className="font-semibold text-foreground text-sm leading-relaxed line-clamp-2 h-10">
                {q.text}
              </h4>

              {/* Choices details */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                {q.questionOptions.map((o) => (
                  <div
                    key={o.id}
                    className={`p-2.5 rounded-lg border text-[11px] font-medium leading-relaxed truncate ${
                      o.isCorrect
                        ? 'bg-success/5 border-success/30 text-success'
                        : 'bg-white/[0.01] border-card-border text-muted-foreground'
                    }`}
                  >
                    {o.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AdminQuestionsPage;
