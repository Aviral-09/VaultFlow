import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Check, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';

interface ProviderCardProps {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  color: string;
  protocol: string;
  freeTier: string;
  features: string[];
}

const providers: ProviderCardProps[] = [
  {
    id: 'google',
    name: 'Google Drive',
    badge: 'OAuth 2.0 Live',
    badgeColor: 'bg-[#FEF08A]',
    color: 'bg-white hover:bg-[#FEF08A]/10',
    protocol: 'Google Drive REST API v3',
    freeTier: '15 GB Free',
    features: ['Direct media streaming', 'Native star & favorite sync', 'Folder recursive traversal', 'OAuth token auto-refresh'],
  },
  {
    id: 'onedrive',
    name: 'Microsoft OneDrive',
    badge: 'Graph API Live',
    badgeColor: 'bg-[#BAE6FD]',
    color: 'bg-white hover:bg-[#BAE6FD]/10',
    protocol: 'Microsoft Graph v1.0',
    freeTier: '5 GB Free',
    features: ['Enterprise & personal accounts', 'Live byte-range stream', 'Office & PDF preview support', 'OAuth authorization code flow'],
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    badge: 'PKCE Live',
    badgeColor: 'bg-[#DDD6FE]',
    color: 'bg-white hover:bg-[#DDD6FE]/10',
    protocol: 'Dropbox Platform API v2',
    freeTier: '2 GB Free',
    features: ['Chunked large file downloads', 'Direct content streaming', 'Instant file rename & delete', 'AES token encryption'],
  },
  {
    id: 'mega',
    name: 'MEGA NZ',
    badge: 'E2E Encryption',
    badgeColor: 'bg-[#FED7AA]',
    color: 'bg-white hover:bg-[#FED7AA]/10',
    protocol: 'MEGA Node C++ Engine',
    freeTier: '20 GB Free',
    features: ['Zero-knowledge client encryption', 'High capacity 20GB free quota', 'In-app credential connect', 'Complete folder sync'],
  },
  {
    id: 'pcloud',
    name: 'pCloud',
    badge: 'Swiss Privacy',
    badgeColor: 'bg-[#A7F3D0]',
    color: 'bg-white hover:bg-[#A7F3D0]/10',
    protocol: 'pCloud Binary API',
    freeTier: '10 GB Free',
    features: ['Swiss data protection jurisdiction', 'High-speed streaming endpoints', 'In-app credential connect', 'Zero file size limits'],
  },
  {
    id: 's3',
    name: 'AWS S3 & Compatible',
    badge: 'Object Storage',
    badgeColor: 'bg-[#FBCFE8]',
    color: 'bg-white hover:bg-[#FBCFE8]/10',
    protocol: 'AWS S3 SDK v3',
    freeTier: 'Scalable / Custom',
    features: ['Standard S3, Cloudflare R2, MinIO', 'Custom endpoint & region support', 'IAM access key isolation', 'Unlimited petabyte capacity'],
  },
];

export const ProviderGrid: React.FC = () => {
  return (
    <section id="providers" className="py-20 bg-[#FAFAF8] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DDD6FE] border-2 border-black shadow-[2px_2px_0px_#000] font-mono text-xs font-bold uppercase tracking-wider mb-4">
            <Cpu className="w-4 h-4 text-purple-900" />
            <span>Multi-Cloud Adapter Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black font-['Space_Grotesk_Variable'] mb-4">
            SUPPORTED CLOUD ADAPTERS
          </h2>
          <p className="text-slate-600 font-medium text-base sm:text-lg">
            OmniCloud connects directly to each provider using their native developer APIs.
            Your credentials and tokens remain encrypted in your local SQLite store.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.map((p) => (
            <div
              key={p.id}
              className={`border-2 border-black shadow-[6px_6px_0px_#000] p-6 flex flex-col justify-between transition-all duration-150 ${p.color}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000]">
                    <Cloud className="w-6 h-6 text-white" />
                  </div>
                  <span className={`neo-badge ${p.badgeColor} text-black font-mono text-xs`}>
                    {p.badge}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="font-['Space_Grotesk_Variable'] text-2xl font-black text-black">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-slate-500 font-bold">{p.protocol}</span>
                    <span className="text-xs font-black">•</span>
                    <span className="font-mono text-xs font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 border border-black">
                      {p.freeTier}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6 pt-3 border-t border-black/10">
                  {p.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm font-medium text-slate-800">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 stroke-[2.5]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/dashboard"
                className="neo-btn bg-white hover:bg-slate-100 w-full py-2.5 text-sm font-bold shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2"
              >
                Connect {p.name}
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
