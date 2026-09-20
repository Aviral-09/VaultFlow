import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { Account, FileItem } from '../types';
import { Navbar } from '../components/Navbar';
import { StorageDonut } from '../components/StorageDonut';
import { ProviderHub } from '../components/ProviderHub';
import { FileBrowser } from '../components/FileBrowser';
import { ConnectModal } from '../components/ConnectModal';
import { FilePreviewModal } from '../components/FilePreviewModal';
import { Footer } from '../components/Footer';
import { formatBytes } from '../lib/utils';
import { HardDrive, Cloud, ShieldCheck, Database, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');

  // Modal states
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Authentication guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Handle OAuth callback parameters (e.g. from Google, OneDrive, Dropbox redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleStatus = params.get('google');
    const onedriveStatus = params.get('onedrive');
    const dropboxStatus = params.get('dropbox');
    const message = params.get('message');

    if (googleStatus === 'connected') {
      toast.success('Google Drive linked successfully!');
    } else if (googleStatus === 'error') {
      toast.error(message || 'Failed to connect Google Drive');
    }

    if (onedriveStatus === 'connected') {
      toast.success('OneDrive linked successfully!');
    } else if (onedriveStatus === 'error') {
      toast.error(message || 'Failed to connect OneDrive');
    }

    if (dropboxStatus === 'connected') {
      toast.success('Dropbox linked successfully!');
    } else if (dropboxStatus === 'error') {
      toast.error(message || 'Failed to connect Dropbox');
    }

    if (googleStatus || onedriveStatus || dropboxStatus) {
      // Clear query params from browser URL without page reload
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location.search]);

  // Fetch Accounts
  const loadAccounts = useCallback(async () => {
    try {
      setLoadingAccounts(true);
      const data = await api.accounts.list();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  // Fetch Files
  const loadFiles = useCallback(async () => {
    try {
      setLoadingFiles(true);
      const data = await api.files.list({
        search: searchQuery || undefined,
        starred: activeCategory === 'starred',
      });
      setFiles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load files:', err);
    } finally {
      setLoadingFiles(false);
    }
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAccounts();
    }
  }, [isAuthenticated, loadAccounts]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    }
  }, [isAuthenticated, loadFiles]);

  // Storage calculations
  const totalCapacity = accounts.reduce((sum, a) => sum + (Number(a.total_space) || 0), 0);
  const totalUsed = accounts.reduce((sum, a) => sum + (Number(a.used_space) || 0), 0);
  const totalFree = Math.max(0, totalCapacity - totalUsed);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center font-mono text-sm font-bold">
        Loading Sovereign Vault...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-4 flex flex-col justify-between">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase">
              Total Storage Pool
            </span>
            <div className="mt-2">
              <span className="font-mono text-2xl sm:text-3xl font-black text-black">
                {formatBytes(totalCapacity)}
              </span>
              <p className="text-[10px] font-mono text-slate-500 font-bold mt-0.5">
                Aggregated Multi-Cloud
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-4 flex flex-col justify-between">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase">
              Free Capacity
            </span>
            <div className="mt-2">
              <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-700">
                {formatBytes(totalFree)}
              </span>
              <p className="text-[10px] font-mono text-slate-500 font-bold mt-0.5">
                Available for Allocation
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-4 flex flex-col justify-between">
            <span className="font-mono text-xs font-bold text-slate-500 uppercase">
              Used Storage
            </span>
            <div className="mt-2">
              <span className="font-mono text-2xl sm:text-3xl font-black text-black">
                {formatBytes(totalUsed)}
              </span>
              <p className="text-[10px] font-mono text-slate-500 font-bold mt-0.5">
                Active Cached Files
              </p>
            </div>
          </div>

          <div className="bg-[#FEF08A] border-2 border-black shadow-[4px_4px_0px_#000] p-4 flex flex-col justify-between">
            <span className="font-mono text-xs font-bold text-black uppercase">
              Connected Clouds
            </span>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-2xl sm:text-3xl font-black text-black">
                {accounts.length}
              </span>
              <button
                onClick={() => setIsConnectModalOpen(true)}
                className="neo-badge bg-black text-white text-[10px] cursor-pointer hover:bg-slate-800"
              >
                + Connect Drive
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Top Row: Donut Chart + Cloud Adapters Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <StorageDonut
              accounts={accounts}
              onConnectClick={() => setIsConnectModalOpen(true)}
            />
          </div>

          <div className="lg:col-span-7">
            <ProviderHub
              accounts={accounts}
              onOpenConnectModal={() => setIsConnectModalOpen(true)}
              onRefresh={loadAccounts}
            />
          </div>
        </div>

        {/* File Browser Row */}
        <div>
          <FileBrowser
            files={files}
            loading={loadingFiles}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedProvider={selectedProvider}
            onProviderChange={setSelectedProvider}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onRefresh={loadFiles}
            onPreviewFile={(f) => setPreviewFile(f)}
          />
        </div>
      </main>

      {/* Modals */}
      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onAccountConnected={() => {
          loadAccounts();
          loadFiles();
        }}
      />

      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      <Footer />
    </div>
  );
};
