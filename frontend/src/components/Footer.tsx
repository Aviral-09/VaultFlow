import React from 'react';
import { Cloud, ShieldCheck, Terminal, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#FAFAF8] border-t-2 border-black mt-20">
      {/* Ticker banner */}
      <div className="bg-[#FDE047] border-b-2 border-black py-2.5 overflow-hidden whitespace-nowrap select-none">
        <div className="inline-block animate-[marquee_20s_linear_infinite] font-mono text-xs font-black uppercase tracking-widest text-black">
          <span>● ZERO VENDOR LOCK-IN &nbsp; ● &nbsp; UNIFIED SINGLE NAMESPACE &nbsp; ● &nbsp; DIRECT ADAPTER STREAMING &nbsp; ● &nbsp; AES-256 ENCRYPTED TOKENS &nbsp; ● &nbsp; SQLITE POWERED PERSISTENCE &nbsp; ● &nbsp; MULTI-TENANT ARCHITECTURE &nbsp; ● &nbsp;</span>
          <span>● ZERO VENDOR LOCK-IN &nbsp; ● &nbsp; UNIFIED SINGLE NAMESPACE &nbsp; ● &nbsp; DIRECT ADAPTER STREAMING &nbsp; ● &nbsp; AES-256 ENCRYPTED TOKENS &nbsp; ● &nbsp; SQLITE POWERED PERSISTENCE &nbsp; ● &nbsp; MULTI-TENANT ARCHITECTURE &nbsp; ● &nbsp;</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#DDD6FE] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black">
                <Cloud className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black font-['Space_Grotesk_Variable'] tracking-tight">
                VaultFlow
              </span>
              <span className="neo-badge bg-[#A7F3D0] text-xs">
                v2.4 Core
              </span>
            </div>
            <p className="text-sm text-slate-700 max-w-md font-medium leading-relaxed">
              VaultFlow bridges disparate cloud silos—Google Drive, OneDrive, Dropbox, MEGA, pCloud, and AWS S3—into one coherent, high-speed sovereign file vault with instant cross-cloud streaming.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="neo-badge bg-emerald-100 text-emerald-900 border-black">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Adapters Online
              </div>
              <div className="neo-badge bg-blue-100 text-blue-900 border-black">
                <Cpu className="w-3.5 h-3.5" />
                SQLite Engine
              </div>
            </div>
          </div>

          {/* Protocols */}
          <div>
            <h4 className="font-mono text-xs font-black uppercase tracking-wider text-slate-500 mb-4">
              Supported Protocols
            </h4>
            <ul className="space-y-2 text-sm font-bold">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 border border-black"></span> Google Drive API v3
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 border border-black"></span> Microsoft Graph (OneDrive)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 border border-black"></span> Dropbox Platform v2
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-400 border border-black"></span> MEGA End-to-End API
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 border border-black"></span> pCloud Swiss Storage
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-400 border border-black"></span> AWS S3 & Compatible
              </li>
            </ul>
          </div>

          {/* System */}
          <div>
            <h4 className="font-mono text-xs font-black uppercase tracking-wider text-slate-500 mb-4">
              Architecture
            </h4>
            <ul className="space-y-2 text-sm font-bold">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> AES-256 Token Vault
              </li>
              <li className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-700" /> Express 5 Pipeline
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 border border-black"></span> Direct Stream Pipeline
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 border border-black"></span> SQLite WAL Journal
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs font-semibold text-slate-600">
          <p>© {new Date().getFullYear()} VaultFlow. Built by Aviral. Designed with Pastel Neo-Brutalism.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-black cursor-pointer">Privacy & Encryption</span>
            <span>•</span>
            <span className="hover:text-black cursor-pointer">Terms</span>
            <span>•</span>
            <span className="hover:text-black cursor-pointer">Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
