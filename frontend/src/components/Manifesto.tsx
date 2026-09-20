import React from 'react';
import { BookOpen, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export const Manifesto: React.FC = () => {
  return (
    <section id="manifesto" className="py-20 bg-[#FAFAF8] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FED7AA] border-2 border-black shadow-[2px_2px_0px_#000] font-mono text-xs font-bold uppercase tracking-wider mb-4">
            <BookOpen className="w-4 h-4 text-orange-900" />
            <span>Architecture & Principles</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black font-['Space_Grotesk_Variable'] mb-4">
            THE VAULTFLOW MANIFESTO
          </h2>
          <p className="text-slate-600 font-medium text-base sm:text-lg">
            Why we engineered a unified multi-cloud operating system instead of another commercial storage silo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Chapter 01 */}
          <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-black bg-[#FBCFE8] px-2.5 py-1 border border-black shadow-[2px_2px_0px_#000]">
                  CHAPTER 01
                </span>
                <AlertTriangle className="w-6 h-6 text-rose-600 stroke-[2.5]" />
              </div>
              <h3 className="font-['Space_Grotesk_Variable'] text-2xl font-black text-black mb-4">
                The Fragmentation Trap
              </h3>
              <p className="text-slate-700 text-sm font-medium leading-relaxed mb-6">
                Every big tech company tries to trap you inside their walled garden. You end up with 15GB in Google Drive, 5GB in OneDrive, 20GB in MEGA, and files scattered everywhere. You forget where important PDFs are, and you get billed every month for duplicate 100GB tiers.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-black font-mono text-xs font-bold text-slate-500">
              VaultFlow Solution: Virtual Namespace Federation
            </div>
          </div>

          {/* Chapter 02 */}
          <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-black bg-[#A7F3D0] px-2.5 py-1 border border-black shadow-[2px_2px_0px_#000]">
                  CHAPTER 02
                </span>
                <Zap className="w-6 h-6 text-emerald-600 stroke-[2.5]" />
              </div>
              <h3 className="font-['Space_Grotesk_Variable'] text-2xl font-black text-black mb-4">
                Zero Storage Markup
              </h3>
              <p className="text-slate-700 text-sm font-medium leading-relaxed mb-6">
                Other unified cloud tools copy your files to their own paid servers, doubling your latency and charging you a steep markup. VaultFlow uses on-the-fly streaming pipelines. When you stream a 4K video or preview a photo, bytes pass directly from the provider through high-speed streams with zero intermediate disk persistence.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-black font-mono text-xs font-bold text-slate-500">
              VaultFlow Solution: Direct Stream Engine
            </div>
          </div>

          {/* Chapter 03 */}
          <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs font-black bg-[#DDD6FE] px-2.5 py-1 border border-black shadow-[2px_2px_0px_#000]">
                  CHAPTER 03
                </span>
                <ShieldCheck className="w-6 h-6 text-purple-600 stroke-[2.5]" />
              </div>
              <h3 className="font-['Space_Grotesk_Variable'] text-2xl font-black text-black mb-4">
                Total Sovereign Control
              </h3>
              <p className="text-slate-700 text-sm font-medium leading-relaxed mb-6">
                Your credentials and encrypted tokens reside strictly within your self-hosted SQLite instance. No telemetry, no selling your analytics, no vendor lock-in. You hold the master key to all your cloud accounts in one beautiful, neo-brutalist interface.
              </p>
            </div>
            <div className="pt-4 border-t-2 border-black font-mono text-xs font-bold text-slate-500">
              VaultFlow Solution: Local-First AES Encryption
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
