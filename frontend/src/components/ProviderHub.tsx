import React from 'react';
import type { Account } from '../types';
import { api } from '../lib/api';
import { formatBytes, getProviderMeta } from '../lib/utils';
import { Plus, Trash2, Cloud, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ProviderHubProps {
  accounts: Account[];
  onOpenConnectModal: () => void;
  onRefresh: () => void;
}

export const ProviderHub: React.FC<ProviderHubProps> = ({ accounts, onOpenConnectModal, onRefresh }) => {
  const handleDeleteAccount = async (id: number | string, providerName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${providerName}? Local indexes for this drive will be cleared.`)) {
      return;
    }

    try {
      await api.accounts.delete(id);
      toast.success(`${providerName} disconnected`);
      onRefresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to disconnect account');
    }
  };

  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-black pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-['Space_Grotesk_Variable'] text-xl font-black text-black">
              Connected Cloud Adapters
            </h3>
            <span className="neo-badge bg-[#A7F3D0] text-[10px]">
              {accounts.length} Active
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 font-bold uppercase mt-0.5">
            Decentralized Adapter Matrix
          </p>
        </div>

        <button
          onClick={onOpenConnectModal}
          className="neo-btn neo-btn-primary px-4 py-2 text-xs font-bold shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Link Cloud Drive
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-black/30 text-center bg-[#FAFAF8]">
          <p className="font-['Space_Grotesk_Variable'] font-bold text-base text-slate-700 mb-1">
            No Cloud Accounts Configured
          </p>
          <p className="text-xs font-mono text-slate-500 mb-4">
            Link Google Drive, OneDrive, MEGA, pCloud, or S3 to populate your file catalog.
          </p>
          <button
            onClick={onOpenConnectModal}
            className="neo-btn neo-btn-mint px-4 py-2 text-xs font-bold shadow-[2px_2px_0px_#000]"
          >
            + Link Drive Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
            const meta = getProviderMeta(acc.provider);
            const total = Number(acc.total_space) || 0;
            const used = Number(acc.used_space) || 0;
            const percentage = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
            const isActive = acc.status === 'active' || !acc.status;

            return (
              <div
                key={acc.id}
                className="bg-[#FAFAF8] border-2 border-black shadow-[3px_3px_0px_#000] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`neo-badge ${meta.badgeBg} text-black text-[10px]`}>
                      {meta.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {isActive ? (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 border border-black">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                          Online
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 border border-black">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          {acc.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="font-bold text-xs text-black truncate mb-3" title={acc.email}>
                    {acc.email || `${meta.name} Account`}
                  </p>

                  {/* Quota Progress */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between font-mono text-[10px] font-bold text-slate-600">
                      <span>{formatBytes(used)} used</span>
                      <span>{formatBytes(total)}</span>
                    </div>
                    <div className="w-full h-3 bg-white border border-black overflow-hidden flex">
                      <div
                        style={{ width: `${percentage}%`, backgroundColor: meta.color }}
                        className="h-full border-r border-black transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/10 flex items-center justify-between font-mono text-xs">
                  <span className="text-[10px] text-slate-500 font-bold">
                    {percentage}% Quota
                  </span>
                  <button
                    onClick={() => handleDeleteAccount(acc.id, meta.name)}
                    className="neo-btn bg-rose-100 hover:bg-rose-200 text-rose-900 px-2 py-1 text-[10px] font-bold shadow-[1px_1px_0px_#000] flex items-center gap-1"
                    title="Disconnect Account"
                  >
                    <Trash2 className="w-3 h-3" />
                    Unlink
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
