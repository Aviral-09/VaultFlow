import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, DollarSign, Database, Sparkles } from 'lucide-react';

export const StorageCalculator: React.FC = () => {
  const [googleDrives, setGoogleDrives] = useState(2);
  const [oneDrives, setOneDrives] = useState(1);
  const [megaDrives, setMegaDrives] = useState(1);
  const [pCloudDrives, setPCloudDrives] = useState(1);
  const [dropboxDrives, setDropboxDrives] = useState(1);

  // Storage amounts in GB
  const googleSpace = googleDrives * 15;
  const oneDriveSpace = oneDrives * 5;
  const megaSpace = megaDrives * 20;
  const pCloudSpace = pCloudDrives * 10;
  const dropboxSpace = dropboxDrives * 2;

  const totalAggregatedGB = googleSpace + oneDriveSpace + megaSpace + pCloudSpace + dropboxSpace;
  // Average annual cloud cost saved based on 100GB+ commercial tiers (~$2.99/mo -> ~$35.88/yr per 100GB)
  const annualSavings = Math.round((totalAggregatedGB / 100) * 36 + 18);

  return (
    <section id="calculator" className="py-20 bg-[#FAFAF8] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#A7F3D0] border-2 border-black shadow-[2px_2px_0px_#000] font-mono text-xs font-bold uppercase tracking-wider mb-4">
            <Calculator className="w-4 h-4 text-emerald-800" />
            <span>Interactive Storage Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-black font-['Space_Grotesk_Variable'] mb-4">
            HOW MUCH FREE STORAGE DO YOU ALREADY OWN?
          </h2>
          <p className="text-slate-600 font-medium text-base sm:text-lg">
            Most people have multiple free personal & work accounts across Google, Microsoft, and MEGA.
            Plug in your accounts below to see your combined sovereign vault.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Controls column */}
          <div className="lg:col-span-7 bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-6 sm:p-8 space-y-6">
            <h3 className="font-['Space_Grotesk_Variable'] text-xl font-black text-black border-b-2 border-black pb-3">
              Configure Your Connected Accounts
            </h3>

            {/* Google Drive slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FEF08A] border border-black inline-block"></span>
                  Google Drive Accounts (15 GB each)
                </span>
                <span className="font-mono text-xs font-bold bg-[#FEF08A] px-2 py-0.5 border border-black">
                  {googleDrives} accounts = {googleSpace} GB
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={googleDrives}
                onChange={(e) => setGoogleDrives(Number(e.target.value))}
                className="w-full accent-black cursor-pointer h-2 bg-slate-200 rounded-none border border-black"
              />
            </div>

            {/* MEGA slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#FED7AA] border border-black inline-block"></span>
                  MEGA Accounts (20 GB each)
                </span>
                <span className="font-mono text-xs font-bold bg-[#FED7AA] px-2 py-0.5 border border-black">
                  {megaDrives} accounts = {megaSpace} GB
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                value={megaDrives}
                onChange={(e) => setMegaDrives(Number(e.target.value))}
                className="w-full accent-black cursor-pointer h-2 bg-slate-200 rounded-none border border-black"
              />
            </div>

            {/* OneDrive slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#BAE6FD] border border-black inline-block"></span>
                  OneDrive Accounts (5 GB each)
                </span>
                <span className="font-mono text-xs font-bold bg-[#BAE6FD] px-2 py-0.5 border border-black">
                  {oneDrives} accounts = {oneDriveSpace} GB
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={oneDrives}
                onChange={(e) => setOneDrives(Number(e.target.value))}
                className="w-full accent-black cursor-pointer h-2 bg-slate-200 rounded-none border border-black"
              />
            </div>

            {/* pCloud slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#A7F3D0] border border-black inline-block"></span>
                  pCloud Accounts (10 GB each)
                </span>
                <span className="font-mono text-xs font-bold bg-[#A7F3D0] px-2 py-0.5 border border-black">
                  {pCloudDrives} accounts = {pCloudSpace} GB
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                value={pCloudDrives}
                onChange={(e) => setPCloudDrives(Number(e.target.value))}
                className="w-full accent-black cursor-pointer h-2 bg-slate-200 rounded-none border border-black"
              />
            </div>

            {/* Dropbox slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm flex items-center gap-2">
                  <span className="w-3 h-3 bg-[#DDD6FE] border border-black inline-block"></span>
                  Dropbox Accounts (2 GB each)
                </span>
                <span className="font-mono text-xs font-bold bg-[#DDD6FE] px-2 py-0.5 border border-black">
                  {dropboxDrives} accounts = {dropboxSpace} GB
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                value={dropboxDrives}
                onChange={(e) => setDropboxDrives(Number(e.target.value))}
                className="w-full accent-black cursor-pointer h-2 bg-slate-200 rounded-none border border-black"
              />
            </div>

            {/* Visual breakdown progress bar */}
            <div className="pt-4 border-t-2 border-black">
              <p className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Unified Virtual Allocation Distribution
              </p>
              <div className="w-full h-8 border-2 border-black flex overflow-hidden shadow-[2px_2px_0px_#000]">
                {googleSpace > 0 && (
                  <div
                    style={{ width: `${(googleSpace / (totalAggregatedGB || 1)) * 100}%` }}
                    className="bg-[#FEF08A] h-full border-r border-black"
                    title={`Google Drive: ${googleSpace} GB`}
                  />
                )}
                {megaSpace > 0 && (
                  <div
                    style={{ width: `${(megaSpace / (totalAggregatedGB || 1)) * 100}%` }}
                    className="bg-[#FED7AA] h-full border-r border-black"
                    title={`MEGA: ${megaSpace} GB`}
                  />
                )}
                {oneDriveSpace > 0 && (
                  <div
                    style={{ width: `${(oneDriveSpace / (totalAggregatedGB || 1)) * 100}%` }}
                    className="bg-[#BAE6FD] h-full border-r border-black"
                    title={`OneDrive: ${oneDriveSpace} GB`}
                  />
                )}
                {pCloudSpace > 0 && (
                  <div
                    style={{ width: `${(pCloudSpace / (totalAggregatedGB || 1)) * 100}%` }}
                    className="bg-[#A7F3D0] h-full border-r border-black"
                    title={`pCloud: ${pCloudSpace} GB`}
                  />
                )}
                {dropboxSpace > 0 && (
                  <div
                    style={{ width: `${(dropboxSpace / (totalAggregatedGB || 1)) * 100}%` }}
                    className="bg-[#DDD6FE] h-full"
                    title={`Dropbox: ${dropboxSpace} GB`}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Result Card Column */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#FDE047] border-2 border-black shadow-[6px_6px_0px_#000] p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="neo-badge bg-black text-white text-xs py-1 px-3">
                  TOTAL UNIFIED POOL
                </span>
                <Sparkles className="w-6 h-6 text-black" />
              </div>

              <div className="mb-8">
                <span className="font-['Space_Grotesk_Variable'] text-6xl sm:text-7xl font-black text-black tracking-tight">
                  {totalAggregatedGB}
                </span>
                <span className="font-['Space_Grotesk_Variable'] text-3xl sm:text-4xl font-black text-black ml-2">
                  GB
                </span>
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 mt-2">
                  Zero Subscription Fees Required
                </p>
              </div>

              <div className="space-y-4 bg-white border-2 border-black p-5 shadow-[3px_3px_0px_#000] mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                    <span className="font-bold text-sm text-black">Annual Savings</span>
                  </div>
                  <span className="font-mono text-base font-black text-emerald-700">
                    ~${annualSavings} / year
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-black/10 pt-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-sm text-black">Connected Accounts</span>
                  </div>
                  <span className="font-mono text-base font-bold text-black">
                    {googleDrives + oneDrives + megaDrives + pCloudDrives + dropboxDrives} Drives
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/signup"
              className="neo-btn bg-black text-white hover:bg-slate-900 py-4 px-6 text-base font-bold shadow-[4px_4px_0px_#000] flex items-center justify-center gap-2 group"
            >
              Aggregate Your Drives Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
