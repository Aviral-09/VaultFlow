import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HardDrive, Shield, Sparkles, CheckCircle2, Layers, Zap, FolderTree } from 'lucide-react';
import { motion } from 'motion/react';

export const KineticHero: React.FC = () => {
  const [activePillar, setActivePillar] = useState<'vfs' | 'allocation' | 'stream'>('vfs');

  return (
    <section className="relative pt-12 pb-20 overflow-hidden">
      {/* Decorative background grid elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-[#FEF08A] rounded-full border-2 border-black -z-10 blur-xl opacity-60 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-32 h-32 bg-[#DDD6FE] rounded-full border-2 border-black -z-10 blur-xl opacity-60"></div>
      <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-[#A7F3D0] rounded-full border-2 border-black -z-10 blur-2xl opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Kinetic Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FEF08A] border-2 border-black shadow-[3px_3px_0px_#000] text-black font-mono text-xs font-black tracking-wide uppercase mb-8"
          >
            <Sparkles className="w-4 h-4 fill-amber-500" />
            <span>ALL YOUR CLOUDS. ONE UNIFIED COMMAND CENTER.</span>
          </motion.div>

          {/* Massive Display Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black max-w-5xl leading-[1.08] mb-6 font-['Space_Grotesk_Variable']"
          >
            STOP SWITCHING TABS.{' '}
            <span className="bg-[#BAE6FD] px-2 py-0.5 border-2 border-black shadow-[4px_4px_0px_#000] inline-block my-1 rotate-[-1deg]">
              UNIFY
            </span>{' '}
            YOUR SCATTERED CLOUDS.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-700 max-w-3xl font-medium mb-10 leading-relaxed"
          >
            Federate Google Drive, OneDrive, Dropbox, MEGA, pCloud, and AWS S3 into a single sovereign namespace.
            Stream video and preview documents directly from your own cloud tokens without paying intermediate storage tax.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/signup"
              className="neo-btn neo-btn-primary px-8 py-4 text-base font-black shadow-[5px_5px_0px_#000] flex items-center gap-2 group"
            >
              Launch Sovereign Vault
              <ArrowRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#calculator"
              className="neo-btn neo-btn-purple px-7 py-4 text-base font-bold shadow-[5px_5px_0px_#000]"
            >
              Calculate Free Storage
            </a>

            <Link
              to="/dashboard"
              className="neo-btn bg-white hover:bg-slate-50 px-6 py-4 text-base font-bold shadow-[5px_5px_0px_#000] flex items-center gap-2"
            >
              <HardDrive className="w-5 h-5 text-slate-800" />
              Live Dashboard
            </Link>
          </motion.div>

          {/* Interactive Hero Architecture Display (Neo-Brutalist Window) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="w-full max-w-4xl bg-white border-2 border-black shadow-[8px_8px_0px_#000] overflow-hidden text-left"
          >
            {/* Window titlebar */}
            <div className="bg-[#DDD6FE] border-b-2 border-black px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-400 border border-black inline-block"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-black inline-block"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-black inline-block"></span>
                <span className="ml-3 font-mono text-xs font-bold uppercase tracking-wider text-black">
                  omnicloud-core // sovereign_workspace_vfs
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 font-mono text-xs font-bold text-slate-700">
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                <span>Zero Intermediate Disk Storage</span>
              </div>
            </div>

            {/* Architecture Selector Tabs */}
            <div className="p-4 sm:p-6 bg-[#FAFAF8] border-b-2 border-black">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActivePillar('vfs')}
                    className={`px-3 py-2 font-mono text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] transition-transform flex items-center gap-1.5 ${
                      activePillar === 'vfs' ? 'bg-[#FEF08A] translate-x-0.5 translate-y-0.5 shadow-none' : 'bg-white hover:bg-slate-100'
                    }`}
                  >
                    <FolderTree className="w-3.5 h-3.5 text-black" />
                    Unified Virtual Filesystem
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePillar('allocation')}
                    className={`px-3 py-2 font-mono text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] transition-transform flex items-center gap-1.5 ${
                      activePillar === 'allocation' ? 'bg-[#BAE6FD] translate-x-0.5 translate-y-0.5 shadow-none' : 'bg-white hover:bg-slate-100'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-black" />
                    Smart Storage Routing
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePillar('stream')}
                    className={`px-3 py-2 font-mono text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] transition-transform flex items-center gap-1.5 ${
                      activePillar === 'stream' ? 'bg-[#A7F3D0] translate-x-0.5 translate-y-0.5 shadow-none' : 'bg-white hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-black" />
                    Native Stream Piping
                  </button>
                </div>
                <span className="neo-badge bg-[#A7F3D0] text-xs shrink-0 self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
                  6 Provider Adapters Active
                </span>
              </div>
            </div>

            {/* Architecture Details View */}
            <div className="p-5 sm:p-6 bg-white space-y-4">
              {activePillar === 'vfs' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border-2 border-black bg-[#FEF08A]/30 shadow-[3px_3px_0px_#000]">
                    <span className="neo-badge bg-[#FEF08A] text-[10px] mb-2 inline-block">Normalized Hierarchy</span>
                    <h4 className="font-bold text-sm text-black mb-1">Single Namespace</h4>
                    <p className="font-mono text-xs text-slate-600">
                      Files and directories across all connected cloud accounts are structured into one browsable tree.
                    </p>
                  </div>
                  <div className="p-4 border-2 border-black bg-[#BAE6FD]/30 shadow-[3px_3px_0px_#000]">
                    <span className="neo-badge bg-[#BAE6FD] text-[10px] mb-2 inline-block">Sub-millisecond Queries</span>
                    <h4 className="font-bold text-sm text-black mb-1">SQLite Local Mirror</h4>
                    <p className="font-mono text-xs text-slate-600">
                      File metadata is cached in a local transactional database for instant search without rate limits.
                    </p>
                  </div>
                  <div className="p-4 border-2 border-black bg-[#FED7AA]/30 shadow-[3px_3px_0px_#000]">
                    <span className="neo-badge bg-[#FED7AA] text-[10px] mb-2 inline-block">Periodic Delta Sync</span>
                    <h4 className="font-bold text-sm text-black mb-1">Automated Reconcile</h4>
                    <p className="font-mono text-xs text-slate-600">
                      Background cron synchronizes upstream changes, new uploads, and account deletions automatically.
                    </p>
                  </div>
                </div>
              )}

              {activePillar === 'allocation' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border-2 border-black bg-[#BAE6FD]/30 shadow-[3px_3px_0px_#000]">
                    <span className="neo-badge bg-[#BAE6FD] text-[10px] mb-2 inline-block">Strategy 01</span>
                    <h4 className="font-bold text-sm text-black mb-1">Most Free Space</h4>
                    <p className="font-mono text-xs text-slate-600">
                      Directs each upload to whichever account currently has the greatest remaining storage capacity.
                    </p>
                  </div>
                  <div className="p-4 border-2 border-black bg-[#FEF08A]/30 shadow-[3px_3px_0px_#000]">
                    <span className="neo-badge bg-[#FEF08A] text-[10px] mb-2 inline-block">Strategy 02</span>
                    <h4 className="font-bold text-sm text-black mb-1">Weighted Balancing</h4>
                    <p className="font-mono text-xs text-slate-600">
                      Distributes stored data proportionally according to the total quota of each linked cloud drive.
                    </p>
                  </div>
                  <div className="p-4 border-2 border-black bg-[#A7F3D0]/30 shadow-[3px_3px_0px_#000]">
                    <span className="neo-badge bg-[#A7F3D0] text-[10px] mb-2 inline-block">Strategy 03</span>
                    <h4 className="font-bold text-sm text-black mb-1">Round Robin & Manual</h4>
                    <p className="font-mono text-xs text-slate-600">
                      Sequential alternating placement or strict user-configured provider priority hierarchies.
                    </p>
                  </div>
                </div>
              )}

              {activePillar === 'stream' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border-2 border-black bg-[#A7F3D0]/30 shadow-[3px_3px_0px_#000]">
                    <span className="neo-badge bg-[#A7F3D0] text-[10px] mb-2 inline-block">Zero Middleman</span>
                    <h4 className="font-bold text-sm text-black mb-1">Direct Stream Piping</h4>
                    <p className="font-mono text-xs text-slate-600">
                      Files are piped on-the-fly directly between cloud providers and client without saving to disk.
                    </p>
                  </div>
                  <div className="p-4 border-2 border-black bg-[#DDD6FE]/30 shadow-[3px_3px_0px_#000]">
                    <span className="neo-badge bg-[#DDD6FE] text-[10px] mb-2 inline-block">Rich Previews</span>
                    <h4 className="font-bold text-sm text-black mb-1">In-Browser Media</h4>
                    <p className="font-mono text-xs text-slate-600">
                      Stream 4K video, audio, PDFs, and code files natively with HTTP/2 range request support.
                    </p>
                  </div>
                  <div className="p-4 border-2 border-black bg-[#FED7AA]/30 shadow-[3px_3px_0px_#000]">
                    <span className="neo-badge bg-[#FED7AA] text-[10px] mb-2 inline-block">Real-time Progress</span>
                    <h4 className="font-bold text-sm text-black mb-1">WebSocket Broadcast</h4>
                    <p className="font-mono text-xs text-slate-600">
                      Live upload progress, throughput speed, and completion notices stream over dedicated sockets.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom status strip */}
            <div className="bg-slate-100 border-t-2 border-black px-4 py-2 font-mono text-[11px] flex flex-col sm:flex-row items-center justify-between gap-1 text-slate-600 font-semibold">
              <span>Architecture: Sovereign Cloud VFS Engine</span>
              <span>Security: AES-256-GCM • Zero Intermediate Disk Storage</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
