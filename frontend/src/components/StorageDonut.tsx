import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Account } from '../types';
import { formatBytes, getProviderMeta } from '../lib/utils';
import { HardDrive, Sparkles } from 'lucide-react';

interface StorageDonutProps {
  accounts: Account[];
  onConnectClick?: () => void;
}

export const StorageDonut: React.FC<StorageDonutProps> = ({ accounts, onConnectClick }) => {
  const totalSpace = accounts.reduce((acc, a) => acc + (Number(a.total_space) || 0), 0);
  const usedSpace = accounts.reduce((acc, a) => acc + (Number(a.used_space) || 0), 0);
  const freeSpace = Math.max(0, totalSpace - usedSpace);
  const usedPercentage = totalSpace > 0 ? Math.round((usedSpace / totalSpace) * 100) : 0;

  // Prepare chart data: group by provider
  const providerDataMap: { [key: string]: { name: string; value: number; color: string } } = {};

  accounts.forEach((acc) => {
    const meta = getProviderMeta(acc.provider);
    const used = Number(acc.used_space) || 0;
    if (providerDataMap[meta.id]) {
      providerDataMap[meta.id].value += used;
    } else {
      providerDataMap[meta.id] = {
        name: meta.name,
        value: used,
        color: meta.color,
      };
    }
  });

  const chartData = Object.values(providerDataMap);
  // If there is free space, add a slice for unallocated free capacity
  if (freeSpace > 0) {
    chartData.push({
      name: 'Available Free Space',
      value: freeSpace,
      color: '#FAFAF8',
    });
  }

  // Fallback if no accounts connected
  if (accounts.length === 0) {
    return (
      <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-6 flex flex-col items-center justify-center text-center min-h-[340px]">
        <div className="w-14 h-14 bg-[#FEF08A] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mb-4">
          <HardDrive className="w-7 h-7 text-black stroke-[2.5]" />
        </div>
        <h3 className="font-['Space_Grotesk_Variable'] text-xl font-black text-black mb-2">
          No Cloud Drives Linked Yet
        </h3>
        <p className="text-slate-600 text-sm max-w-xs mb-6 font-medium">
          Connect your Google Drive, OneDrive, MEGA, or S3 bucket to activate your unified storage pool.
        </p>
        <button
          onClick={onConnectClick}
          className="neo-btn neo-btn-primary px-5 py-2.5 text-sm font-bold shadow-[3px_3px_0px_#000]"
        >
          + Connect First Cloud
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-['Space_Grotesk_Variable'] text-xl font-black text-black">
              Aggregated Pool
            </span>
            <span className="neo-badge bg-[#FEF08A] text-[10px]">
              {accounts.length} {accounts.length === 1 ? 'Drive' : 'Drives'}
            </span>
          </div>
          <p className="text-xs font-mono text-slate-500 font-bold uppercase mt-0.5">
            Real-Time Capacity Allocation
          </p>
        </div>
        <div className="text-right">
          <span className="font-mono text-2xl font-black text-black">
            {formatBytes(totalSpace)}
          </span>
          <p className="font-mono text-[10px] text-slate-500 font-bold uppercase">Total Pool</p>
        </div>
      </div>

      {/* Donut Chart and Central Stat */}
      <div className="relative w-full h-52 flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  return (
                    <div className="bg-white border-2 border-black shadow-[3px_3px_0px_#000] p-2.5 font-mono text-xs">
                      <p className="font-bold text-black">{data.name}</p>
                      <p className="text-slate-600 font-extrabold">{formatBytes(Number(data.value))}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={3}
              dataKey="value"
              stroke="#000000"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Central percentage stat inside donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-['Space_Grotesk_Variable'] text-3xl font-black text-black leading-none">
            {usedPercentage}%
          </span>
          <span className="font-mono text-[10px] font-bold text-slate-500 uppercase mt-1">
            Utilized
          </span>
        </div>
      </div>

      {/* Progress and bottom legend */}
      <div className="space-y-3 pt-3 border-t-2 border-black">
        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
          <div className="p-2.5 bg-[#FAFAF8] border border-black shadow-[2px_2px_0px_#000]">
            <p className="text-slate-500 font-bold">Used Space</p>
            <p className="text-sm font-black text-black">{formatBytes(usedSpace)}</p>
          </div>
          <div className="p-2.5 bg-[#A7F3D0]/40 border border-black shadow-[2px_2px_0px_#000]">
            <p className="text-emerald-900 font-bold">Available Free</p>
            <p className="text-sm font-black text-emerald-800">{formatBytes(freeSpace)}</p>
          </div>
        </div>

        {/* Mini tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {accounts.map((acc) => {
            const meta = getProviderMeta(acc.provider);
            return (
              <span
                key={acc.id}
                className={`neo-badge ${meta.badgeBg} text-black text-[10px] py-0.5 px-2`}
              >
                {meta.name}: {formatBytes(Number(acc.used_space) || 0)}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
