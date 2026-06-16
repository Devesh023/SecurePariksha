import React, { useEffect, useState } from 'react';
import { api } from '../../../../services/api';
import { User } from '../../../../types';
import { useAuthStore } from '../../../../store/auth.store';
import { Plus, Trash2, ShieldAlert, User as UserIcon, Save, X, AlertCircle } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch user directory. Please confirm Super Admin rights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDel = window.confirm('Are you sure you want to delete this user? This will also remove any profiles, attempts, and violations associated with them.');
    if (!confirmDel) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post('/users/admin', {
        name,
        email,
        password,
      });
      setCreateOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create Exam Admin account.');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-xs text-muted-foreground font-medium">Syncing user directory...</span>
        </div>
      </div>
    );
  }

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'EXAM_ADMIN':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Create Button */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">User Directories</h1>
          <p className="text-xs text-[#8e919e] mt-1">
            Super Admin user controller panel. Review student indices and add Exam Administrators.
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
        >
          <Plus size={16} /> Create Exam Admin
        </button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#13131a] border border-card-border rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative flex flex-col gap-5">
            <button
              onClick={() => setCreateOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <UserIcon className="text-indigo-400" /> New Exam Admin
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8e919e]">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8e919e]">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@securepariksha.com"
                  className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8e919e]">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-xs rounded-xl p-3 focus:border-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-white/[0.03] border border-border text-foreground hover:bg-white/[0.07]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 flex items-center gap-1.5"
                >
                  <Save size={14} /> Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Directory Table */}
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.04] text-xs font-bold uppercase text-[#8e919e]">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4 text-center">System Role</th>
                <th className="px-6 py-4 text-center">Registration Info</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {users.map((item) => {
                const isSelf = item.id === user?.id;
                const isSystemOwner = item.email === 'superadmin@securepariksha.com';
                const profileName = item.role === 'STUDENT' ? item.student?.name : item.admin?.name;
                const rollNum = item.role === 'STUDENT' ? item.student?.rollNumber : 'N/A';

                return (
                  <tr key={item.id} className="hover:bg-white/[0.01] transition-colors text-sm">
                    <td className="px-6 py-4.5 font-semibold text-foreground">{profileName || 'No profile'}</td>
                    <td className="px-6 py-4.5 text-[#8e919e]">{item.email}</td>
                    <td className="px-6 py-4.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${getRoleColor(item.role)}`}>
                        {item.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center text-[#8e919e] font-mono text-xs">
                      {rollNum}
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      {isSelf || isSystemOwner ? (
                        <span className="text-[10px] text-muted-foreground italic">Protected</span>
                      ) : (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-xl bg-destructive/5 hover:bg-destructive/15 border border-destructive/10 text-destructive transition-colors inline-flex items-center justify-center"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminUsersPage;
