import React from 'react';
import { useAuthStore } from '../store/auth.store';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'EXAM_ADMIN':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-[#0d0d12]/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <span className="text-2xl">🛡️</span>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
            SecurePariksha
          </span>
        </Link>

        {/* User Actions */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-foreground">
                {user.role === 'STUDENT' ? user.student?.name : user.admin?.name}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getRoleBadgeColor(user.role)}`}>
                {formatRole(user.role)}
              </span>
            </div>

            <div className="h-8 w-[1px] bg-border hidden md:block"></div>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <UserIcon size={16} />
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center h-9 w-9 rounded-full text-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
export default Navbar;
