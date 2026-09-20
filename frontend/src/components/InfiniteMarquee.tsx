import React from 'react';

const providers = [
  { name: 'Google Drive', quota: '15 GB Tier', color: 'bg-[#FEF08A]' },
  { name: 'OneDrive', quota: '5 GB Tier', color: 'bg-[#BAE6FD]' },
  { name: 'Dropbox', quota: '2 GB Tier', color: 'bg-[#DDD6FE]' },
  { name: 'MEGA NZ', quota: '20 GB Tier', color: 'bg-[#FED7AA]' },
  { name: 'pCloud', quota: '10 GB Tier', color: 'bg-[#A7F3D0]' },
  { name: 'AWS S3', quota: 'Unlimited Buckets', color: 'bg-[#FBCFE8]' },
];

export const InfiniteMarquee: React.FC = () => {
  return (
    <div className="w-full bg-[#FAFAF8] py-8 border-y-2 border-black overflow-hidden relative select-none">
      <div className="flex w-[200%] animate-[marquee_28s_linear_infinite] hover:[animation-play-state:paused]">
        {/* Sequence 1 */}
        <div className="flex items-center justify-around min-w-full shrink-0 gap-6 px-4">
          {providers.map((p, i) => (
            <div
              key={`p1-${i}`}
              className={`flex items-center gap-3 px-5 py-2.5 ${p.color} border-2 border-black shadow-[3px_3px_0px_#000]`}
            >
              <span className="font-extrabold text-sm tracking-tight text-black">{p.name}</span>
              <span className="font-mono text-xs font-bold text-slate-700 bg-white/70 px-2 py-0.5 border border-black">
                {p.quota}
              </span>
              <span className="text-black font-black">✦</span>
            </div>
          ))}
        </div>

        {/* Sequence 2 (Duplicate for continuous loop) */}
        <div className="flex items-center justify-around min-w-full shrink-0 gap-6 px-4">
          {providers.map((p, i) => (
            <div
              key={`p2-${i}`}
              className={`flex items-center gap-3 px-5 py-2.5 ${p.color} border-2 border-black shadow-[3px_3px_0px_#000]`}
            >
              <span className="font-extrabold text-sm tracking-tight text-black">{p.name}</span>
              <span className="font-mono text-xs font-bold text-slate-700 bg-white/70 px-2 py-0.5 border border-black">
                {p.quota}
              </span>
              <span className="text-black font-black">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
