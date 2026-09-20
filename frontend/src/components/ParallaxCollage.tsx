import React from 'react';
import { motion } from 'motion/react';
import { Play, Check, Lock, HardDrive, FileText, Sparkles } from 'lucide-react';

export const ParallaxCollage: React.FC = () => {
  return (
    <section className="py-24 bg-[#FAFAF8] overflow-hidden border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FBCFE8] border-2 border-black shadow-[2px_2px_0px_#000] font-mono text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4 text-pink-900" />
            <span>Kinetic Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black font-['Space_Grotesk_Variable'] mb-4">
            ENGINEERED FOR RAW SPEED & VISUAL CLARITY
          </h2>
          <p className="text-slate-600 font-medium text-base sm:text-lg">
            High-performance React 19 interface layered over SQLite metadata cache and native stream piping.
          </p>
        </div>

        {/* Floating cards container */}
        <div className="relative max-w-5xl mx-auto min-h-[480px] flex items-center justify-center">
          {/* Card 1: Direct media stream */}
          <motion.div
            whileHover={{ scale: 1.03, rotate: -2 }}
            className="absolute -top-6 left-4 sm:left-12 z-20 w-72 sm:w-80 bg-white border-2 border-black shadow-[8px_8px_0px_#000] p-4"
          >
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="neo-badge bg-[#BAE6FD] text-[10px]">Native Stream Pipeline</span>
              <span className="font-mono text-xs font-bold text-emerald-700">● Live Pipeline</span>
            </div>
            <div className="w-full h-36 bg-[#0F172A] border border-black flex flex-col items-center justify-center text-white relative overflow-hidden group">
              <div className="w-12 h-12 rounded-full bg-[#FEF08A] text-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
                <Play className="w-6 h-6 fill-black ml-0.5" />
              </div>
              <p className="font-mono text-[11px] text-slate-300 mt-2 font-bold">Direct Media Streaming</p>
              <span className="absolute bottom-2 right-2 bg-black/80 font-mono text-[10px] px-1.5 py-0.5 text-yellow-300 border border-black">
                Zero Disk Cache
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-xs text-slate-700 font-bold">
              <span>HTTP/2 Range Streams</span>
              <span>Memory: Direct Pipe</span>
            </div>
          </motion.div>

          {/* Card 2: Centerpiece Quota Core */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="z-10 w-full max-w-md bg-[#DDD6FE] border-2 border-black shadow-[10px_10px_0px_#000] p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-purple-900" />
                <span className="font-['Space_Grotesk_Variable'] font-black text-lg">Multi-Cloud Storage Pool</span>
              </div>
              <span className="neo-badge bg-[#FEF08A] text-[11px]">Federated VFS</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-mono text-xs font-bold mb-1">
                  <span>Dynamic Aggregate Capacity</span>
                  <span className="text-purple-900">5 Smart Routing Modes</span>
                </div>
                <div className="w-full h-4 bg-white border-2 border-black overflow-hidden flex shadow-[2px_2px_0px_#000]">
                  <div style={{ width: '35%' }} className="bg-[#FEF08A] h-full border-r border-black" title="Google Drive" />
                  <div style={{ width: '40%' }} className="bg-[#FED7AA] h-full border-r border-black" title="MEGA Cloud" />
                  <div style={{ width: '25%' }} className="bg-[#BAE6FD] h-full" title="OneDrive" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs font-bold">
                <div className="p-2 bg-white border border-black">
                  <p className="text-slate-500">Allocation Strategy</p>
                  <p className="text-sm text-emerald-700 font-black">Most Free Space</p>
                </div>
                <div className="p-2 bg-white border border-black">
                  <p className="text-slate-500">Namespace Structure</p>
                  <p className="text-sm text-black font-black">Unified Hierarchy</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Security & Encryption */}
          <motion.div
            whileHover={{ scale: 1.03, rotate: 2 }}
            className="absolute -bottom-6 right-4 sm:right-12 z-20 w-72 sm:w-80 bg-white border-2 border-black shadow-[8px_8px_0px_#000] p-4"
          >
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="neo-badge bg-[#A7F3D0] text-[10px]">Vault Security</span>
              <Lock className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>AES-256 GCM Token Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>HttpOnly Auth Session Cookies</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Zero Server File Retention</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Local SQLite WAL Transactions</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
