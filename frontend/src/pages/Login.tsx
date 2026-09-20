import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Cloud, Lock, Mail, ArrowRight, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.message || 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('aviral.ashu09@gmail.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col md:flex-row">
      {/* Left decorative branding panel */}
      <div className="md:w-1/2 bg-[#DDD6FE] border-b-2 md:border-b-0 md:border-r-2 border-black p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Background decorative dots */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FEF08A] rounded-full border-2 border-black -z-0 blur-xl opacity-60"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#A7F3D0] rounded-full border-2 border-black -z-0 blur-xl opacity-60"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-[#FDE047] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center font-black">
                <Cloud className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-black font-['Space_Grotesk_Variable']">
                  VaultFlow
                </span>
                <p className="text-xs font-mono text-slate-700 font-bold uppercase">
                  OmniCloud OS
                </p>
              </div>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border-2 border-black shadow-[3px_3px_0px_#000] font-mono text-xs font-bold text-black hover:bg-[#FEF08A] transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="max-w-md space-y-4">
            <span className="neo-badge bg-[#FEF08A] text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
              Sovereign Storage Architecture
            </span>
            <h1 className="font-['Space_Grotesk_Variable'] text-3xl sm:text-4xl font-black text-black leading-tight">
              Sign in to your unified cloud command center.
            </h1>
            <p className="text-slate-700 font-medium text-sm leading-relaxed">
              Connect Google Drive, OneDrive, Dropbox, MEGA, pCloud, and AWS S3 in one high-speed dashboard.
            </p>
          </div>
        </div>

        {/* Demo Quick-Fill Box */}
        <div className="relative z-10 mt-8 p-4 bg-white border-2 border-black shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-slate-600">
              ⚡ Quick Fill Saved User
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="neo-badge bg-[#A7F3D0] hover:bg-[#6EE7B7] text-black text-[11px] cursor-pointer"
            >
              Fill Credentials
            </button>
          </div>
          <p className="font-mono text-xs text-slate-800 truncate">
            <strong>Email:</strong> aviral.ashu09@gmail.com
          </p>
        </div>

        <div className="relative z-10 pt-6 flex items-center gap-2 font-mono text-xs font-bold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Local SQLite Session • AES-256 Storage</span>
        </div>
      </div>

      {/* Right sign-in form panel */}
      <div className="md:w-1/2 p-6 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Back to home button above login card */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border-2 border-black shadow-[3px_3px_0px_#000] font-mono text-xs font-bold text-black hover:bg-[#FEF08A] transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <span className="font-mono text-xs text-slate-500 font-bold">OmniCloud Vault</span>
          </div>

          <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-8">
            <h2 className="font-['Space_Grotesk_Variable'] text-2xl sm:text-3xl font-black text-black mb-2">
              Welcome Back
            </h2>
            <p className="text-slate-600 text-sm font-medium mb-6">
              Enter your credentials to access your aggregated file vault.
            </p>

            {error && (
              <div className="mb-6 p-3 bg-rose-100 border-2 border-black shadow-[2px_2px_0px_#000] font-mono text-xs font-bold text-rose-900">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-sm text-black mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF8] border-2 border-black font-mono text-sm focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#000]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-sm text-black mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF8] border-2 border-black font-mono text-sm focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#000]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="neo-btn neo-btn-primary w-full py-3 text-base font-bold shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Vault'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t-2 border-black flex items-center justify-between text-xs font-bold font-mono">
              <span className="text-slate-600">No account yet?</span>
              <Link to="/signup" className="text-blue-700 hover:underline">
                Create new account →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
