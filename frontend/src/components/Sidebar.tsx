import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import {
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  Eye,
  BarChart3,
  Users,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/dashboard/student/exams', label: 'Browse Exams', icon: <BookOpen size={18} /> },
    { to: '/dashboard/student/results', label: 'My Results', icon: <FileSpreadsheet size={18} /> },
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/dashboard/admin/exams', label: 'Manage Exams', icon: <BookOpen size={18} /> },
    { to: '/dashboard/admin/questions', label: 'Question Bank', icon: <HelpCircle size={18} /> },
    { to: '/dashboard/admin/proctoring', label: 'Live Proctoring', icon: <Eye size={18} /> },
  ];

  const superAdminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/dashboard/admin/exams', label: 'Manage Exams', icon: <BookOpen size={18} /> },
    { to: '/dashboard/admin/questions', label: 'Question Bank', icon: <HelpCircle size={18} /> },
    { to: '/dashboard/admin/proctoring', label: 'Live Proctoring', icon: <Eye size={18} /> },
    { to: '/dashboard/admin/analytics', label: 'System Analytics', icon: <BarChart3 size={18} /> },
    { to: '/dashboard/admin/users', label: 'Manage Users', icon: <Users size={18} /> },
  ];

  const getLinks = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return superAdminLinks;
      case 'EXAM_ADMIN':
        return adminLinks;
      default:
        return studentLinks;
    }
  };

  const activeStyle = 'flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5 transition-all';
  const inactiveStyle = 'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-muted hover:text-foreground hover:bg-white/[0.03] border border-transparent transition-all';

  return (
    <aside className="w-64 border-r border-border bg-[#0d0d12] flex flex-col shrink-0 min-h-[calc(100vh-64px)]">
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <div className="px-4 mb-4 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Navigation Menu
        </div>
        {getLinks().map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Proctoring Banner in Sidebar */}
      <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
          <AlertTriangle size={14} />
          AI Shield Active
        </div>
        <p className="text-[10px] text-[#8e919e] leading-relaxed">
          Biometric monitoring and screen security modules are engaged. WebRTC camera feed streaming is encrypted.
        </p>
      </div>
    </aside>
  );
};
export default Sidebar;
