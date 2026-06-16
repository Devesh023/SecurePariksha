import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../../../services/auth.service';
import { Mail, Lock, Key, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Flow control states
  const [showResetForm, setShowResetForm] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const data = await AuthService.forgotPassword(email);
      setSuccess('If the email is registered, a reset link will be sent.');
      if (data.resetToken) {
        setDevToken(data.resetToken);
        setToken(data.resetToken); // autofill for testing convenience
        setSuccess('Reset token generated successfully! (Dev Mode: see below)');
      }
      setShowResetForm(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error requesting reset token.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await AuthService.resetPassword({ token, password: newPassword });
      setSuccess('Password changed successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Check if the token has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] px-4 py-12">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-card border border-card-border p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl mb-3">🔒</span>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
            Reset Credentials
          </h1>
          <p className="text-xs text-[#8e919e] mt-1.5 text-center">
            Recover access to your SecurePariksha dashboard
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3.5 rounded-xl mb-5 animate-shake">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2.5 bg-success/10 border border-success/20 text-success text-xs p-3.5 rounded-xl mb-5">
            <CheckCircle size={16} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {!showResetForm ? (
          /* Step 1: Request Token */
          <form onSubmit={handleRequestToken} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#8e919e] uppercase tracking-wider">
                Account Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-muted-foreground" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-sm rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-sm font-bold bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg shadow-primary/25 transition-all mt-4 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Send Reset Credentials'}
            </button>
          </form>
        ) : (
          /* Step 2: Reset Password Form */
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            {/* Dev Mode token hint banner */}
            {devToken && (
              <div className="p-3 bg-white/[0.02] border border-indigo-500/20 rounded-xl mb-2">
                <span className="text-[9px] font-bold text-indigo-400 block mb-1 uppercase tracking-widest">
                  🔒 Developer Reset Token:
                </span>
                <code className="text-[10px] text-foreground font-mono block break-all select-all p-2 bg-black rounded border border-white/5">
                  {devToken}
                </code>
              </div>
            )}

            {/* Token input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#8e919e] uppercase tracking-wider">
                Reset Token
              </label>
              <div className="relative flex items-center">
                <Key className="absolute left-3.5 text-muted-foreground" size={16} />
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste reset token here"
                  className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-sm rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#8e919e] uppercase tracking-wider">
                New Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-muted-foreground" size={16} />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#0a0a0c] border border-card-border text-foreground text-sm rounded-xl pl-11 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-sm font-bold bg-success hover:bg-success/95 text-foreground rounded-xl shadow-lg shadow-success/10 transition-all mt-4 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Save New Password'}
            </button>
          </form>
        )}

        <p className="text-xs text-center text-[#8e919e] mt-6">
          Remembered credentials?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
