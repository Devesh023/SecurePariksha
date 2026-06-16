import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { AuthService } from '../../../services/auth.service';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await AuthService.login({ email, password });
      setAuth(data.user, data.token, data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] px-4 py-12">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-card border border-card-border p-8 rounded-3xl shadow-2xl relative z-10">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl mb-3">🛡️</span>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
            SecurePariksha
          </h1>
          <p className="text-xs text-[#8e919e] mt-1.5 text-center">
            Sign in to access secure online examinations
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3.5 rounded-xl mb-5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#8e919e] uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-muted-foreground" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@securepariksha.com"
                className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-sm rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#8e919e] uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 text-muted-foreground" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-sm rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-sm font-bold bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg shadow-primary/25 transition-all mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-xs text-center text-[#8e919e] mt-6">
          Don't have a student account?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Register Now
          </Link>
        </p>

        {/* Demo Credentials Drawer helper */}
        <div className="mt-8 pt-6 border-t border-white/[0.04] text-[10px] text-[#8e919e] leading-relaxed">
          <span className="font-bold text-foreground block mb-1">Demo Credentials:</span>
          <ul className="space-y-1">
            <li>🔑 <span className="font-semibold text-foreground">Student:</span> student@securepariksha.com / Student@123</li>
            <li>🔑 <span className="font-semibold text-foreground">Exam Admin:</span> admin@securepariksha.com / Admin@123</li>
            <li>🔑 <span className="font-semibold text-foreground">Super Admin:</span> superadmin@securepariksha.com / Admin@123</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
