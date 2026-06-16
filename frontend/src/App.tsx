import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';

// Layouts
import DashboardLayout from './app/dashboard/layout';

// Auth Pages
import LoginPage from './app/(auth)/login/page';
import RegisterPage from './app/(auth)/register/page';
import ForgotPasswordPage from './app/(auth)/forgot-password/page';

// Core Dashboard
import DashboardPage from './app/dashboard/page';

// Student Pages
import StudentExamsPage from './app/dashboard/student/exams/page';
import ExamAttemptPage from './app/dashboard/student/exams/attempt/page';
import StudentResultsPage from './app/dashboard/student/results/page';
import StudentResultDetailsPage from './app/dashboard/student/results/details';

// Admin Pages
import AdminExamsPage from './app/dashboard/admin/exams/page';
import AdminQuestionsPage from './app/dashboard/admin/questions/page';
import AdminProctoringPage from './app/dashboard/admin/proctoring/page';
import AdminAnalyticsPage from './app/dashboard/admin/analytics/page';
import AdminUsersPage from './app/dashboard/admin/users/page';

// Guards
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center gap-4 bg-[#0a0a0c]">
        <span className="text-4xl">🛑</span>
        <h2 className="text-lg font-bold text-foreground">403 Forbidden Access</h2>
        <p className="text-xs text-[#8e919e] max-w-sm leading-relaxed">
          Your account role '{user.role}' does not possess permissions to view this resource.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const { initAuth, isLoading } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Dashboard Shell Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Home Landing */}
          <Route index element={<DashboardPage />} />

          {/* Student routes */}
          <Route
            path="student/exams"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentExamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/results"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="student/results/:id"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentResultDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Shared Admin Routes */}
          <Route
            path="admin/exams"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'EXAM_ADMIN']}>
                <AdminExamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/questions"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'EXAM_ADMIN']}>
                <AdminQuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/proctoring"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'EXAM_ADMIN']}>
                <AdminProctoringPage />
              </ProtectedRoute>
            }
          />

          {/* Super Admin specific routes */}
          <Route
            path="admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Standalone Attempt Route (Forces Distraction-Free Layout without sidebar shell) */}
        <Route
          path="/dashboard/student/exams/attempt"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <ExamAttemptPage />
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
