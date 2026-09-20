import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Cloud, HardDrive, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAFAF8]/90 backdrop-blur-md border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-[#FDE047] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center font-black text-xl tracking-tighter group-hover:rotate-6 transition-transform">
            <Cloud className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-black font-['Space_Grotesk_Variable']">
                VaultFlow
              </span>
              <span className="neo-badge bg-[#DDD6FE] text-black text-[10px] py-0.5 px-2">
                Cloud OS
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 font-semibold uppercase tracking-wider">
              Multi-Cloud Unified OS
            </p>
          </div>
        </Link>

        {/* Navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold tracking-tight">
          <a href="/#providers" className="hover:text-blue-600 transition-colors">
            Providers
          </a>
          <a href="/#calculator" className="hover:text-blue-600 transition-colors">
            Calculator
          </a>
          <a href="/#manifesto" className="hover:text-blue-600 transition-colors">
            Manifesto
          </a>
          <Link to="/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
            <HardDrive className="w-4 h-4" />
            File Vault
          </Link>
        </nav>

        {/* Auth / Action */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-[#A7F3D0] px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000]">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span className="text-xs font-mono font-bold truncate max-w-[140px]">
                  {user?.email}
                </span>
                {user?.isAdmin && (
                  <span className="bg-black text-white text-[9px] px-1 py-0.5 font-bold uppercase rounded-xs">
                    Admin
                  </span>
                )}
              </div>
              <Link
                to="/dashboard"
                className="neo-btn neo-btn-primary px-4 py-2 text-sm font-bold shadow-[3px_3px_0px_#000]"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="neo-btn bg-rose-100 hover:bg-rose-200 text-black p-2 shadow-[2px_2px_0px_#000]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="neo-btn bg-white hover:bg-slate-50 px-4 py-2 text-sm font-bold shadow-[3px_3px_0px_#000]"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="neo-btn neo-btn-primary px-5 py-2 text-sm font-bold shadow-[3px_3px_0px_#000] flex items-center gap-1.5"
              >
                Launch Vault
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
