import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Cloud, Lock, Mail, ArrowRight, ArrowLeft, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const Signup: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.message || 'Failed to register account';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col md:flex-row">
      {/* Left branding panel */}
      <div className="md:w-1/2 bg-[#FEF08A] border-b-2 md:border-b-0 md:border-r-2 border-black p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-white border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center font-black">
                <Cloud className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-black font-['Space_Grotesk_Variable']">
                  VaultFlow
                </span>
                <p className="text-xs font-mono text-slate-800 font-bold uppercase">
                  VaultFlow OS
                </p>
              </div>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border-2 border-black shadow-[3px_3px_0px_#000] font-mono text-xs font-bold text-black hover:bg-[#DDD6FE] transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="max-w-md space-y-4">
            <span className="neo-badge bg-[#BAE6FD] text-xs font-mono">
              ⚡ Instant Setup
            </span>
            <h1 className="font-['Space_Grotesk_Variable'] text-3xl sm:text-4xl font-black text-black leading-tight">
              Create your sovereign multi-cloud namespace.
            </h1>
            <p className="text-slate-800 font-medium text-sm leading-relaxed">
              Aggregate your free tiers into a massive virtual storage pool. Direct stream pipeline with 0% cloud storage markup.
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-3 bg-white border-2 border-black p-6 shadow-[4px_4px_0px_#000] my-8">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            <span>Connect up to 6 distinct cloud providers</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            <span>Encrypted local SQLite storage engine</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            <span>Full streaming media player & document previews</span>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 font-mono text-xs font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-800" />
          <span>No credit card • Self-hostable • Open architecture</span>
        </div>
      </div>

      {/* Right sign-up form panel */}
      <div className="md:w-1/2 p-6 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Back to home button above signup card */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border-2 border-black shadow-[3px_3px_0px_#000] font-mono text-xs font-bold text-black hover:bg-[#DDD6FE] transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <span className="font-mono text-xs text-slate-500 font-bold">VaultFlow Vault</span>
          </div>

          <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-8">
            <h2 className="font-['Space_Grotesk_Variable'] text-2xl sm:text-3xl font-black text-black mb-2">
              Get Started Free
            </h2>
            <p className="text-slate-600 text-sm font-medium mb-6">
              Create your local account to begin linking cloud adapters.
            </p>

            {error && (
              <div className="mb-6 p-3 bg-rose-100 border-2 border-black shadow-[2px_2px_0px_#000] font-mono text-xs font-bold text-rose-900">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-sm text-black mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAF8] border-2 border-black font-mono text-sm focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_#000]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="neo-btn neo-btn-mint w-full py-3 text-base font-bold shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Master Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 pt-6 border-t-2 border-black flex items-center justify-between text-xs font-bold font-mono">
              <span className="text-slate-600">Already registered?</span>
              <Link to="/login" className="text-blue-700 hover:underline">
                Sign in to existing vault →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
