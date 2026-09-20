import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import {
  X,
  Cloud,
  ArrowRight,
  ShieldCheck,
  Settings,
  Copy,
  Check,
  ExternalLink,
  Info,
  KeyRound,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountConnected: () => void;
}

type ModalTab =
  | 'select'
  | 'google_setup'
  | 'onedrive_setup'
  | 'mega'
  | 'pcloud'
  | 's3';

export const ConnectModal: React.FC<ConnectModalProps> = ({ isOpen, onClose, onAccountConnected }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('select');
  const [loading, setLoading] = useState(false);
  const [copiedGoogleUri, setCopiedGoogleUri] = useState(false);
  const [copiedOneDriveUri, setCopiedOneDriveUri] = useState(false);

  // Google OAuth Config State
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [googleRedirectUri, setGoogleRedirectUri] = useState('http://localhost:8787/api/accounts/google/callback');
  const [googleIsConfigured, setGoogleIsConfigured] = useState(false);

  // OneDrive OAuth Config State
  const [onedriveClientId, setOnedriveClientId] = useState('');
  const [onedriveClientSecret, setOnedriveClientSecret] = useState('');
  const [onedriveRedirectUri, setOnedriveRedirectUri] = useState('http://localhost:8787/api/accounts/onedrive/callback');
  const [onedriveIsConfigured, setOnedriveIsConfigured] = useState(false);

  // Credentials State for MEGA, pCloud, S3
  const [megaEmail, setMegaEmail] = useState('');
  const [megaPassword, setMegaPassword] = useState('');

  const [pcloudEmail, setPcloudEmail] = useState('');
  const [pcloudPassword, setPcloudPassword] = useState('');

  const [s3AccessKey, setS3AccessKey] = useState('');
  const [s3SecretKey, setS3SecretKey] = useState('');
  const [s3Bucket, setS3Bucket] = useState('');
  const [s3Region, setS3Region] = useState('us-east-1');
  const [s3Endpoint, setS3Endpoint] = useState('');

  // Fetch provider config status on modal open
  useEffect(() => {
    if (isOpen) {
      setActiveTab('select');
      // Check Google config
      api.admin.getGoogleConfig()
        .then((res) => {
          if (res) {
            setGoogleIsConfigured(Boolean(res.configured));
            if (res.clientId) setGoogleClientId(res.clientId);
            if (res.redirectUri) setGoogleRedirectUri(res.redirectUri);
          }
        })
        .catch(() => {});

      // Check OneDrive config
      api.admin.getOneDriveConfig()
        .then((res) => {
          if (res) {
            setOnedriveIsConfigured(Boolean(res.configured));
            if (res.clientId) setOnedriveClientId(res.clientId);
            if (res.redirectUri) setOnedriveRedirectUri(res.redirectUri);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Google Connect button click
  // Handle Google Connect button click
  const handleGoogleClick = async () => {
    try {
      setLoading(true);
      // Check if configured first
      const cfg = await api.admin.getGoogleConfig().catch(() => null);
      if (!cfg || !cfg.configured) {
        // Not configured yet -> smoothly open Setup screen directly!
        setActiveTab('google_setup');
        return;
      }

      // If configured, fetch OAuth URL and redirect
      const res = await api.accounts.getGoogleConnectUrl();
      const redirectUrl = res?.authorizationUrl || res?.url;
      if (redirectUrl) {
        toast.info('Redirecting to Google authorization...');
        window.location.href = redirectUrl;
      } else {
        toast.error('Unable to retrieve Google authorization URL');
      }
    } catch (err: any) {
      // If server responded that Google is not configured, open the setup tab
      if (/not configured/i.test(err?.message || '')) {
        setActiveTab('google_setup');
      } else {
        toast.error(err?.message || 'Unable to connect to Google Drive');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OneDrive Connect button click
  const handleOneDriveClick = async () => {
    try {
      setLoading(true);
      // Check if configured first
      const cfg = await api.admin.getOneDriveConfig().catch(() => null);
      if (!cfg || !cfg.configured) {
        // Not configured yet -> smoothly open Setup screen directly!
        setActiveTab('onedrive_setup');
        return;
      }

      // If configured, fetch OAuth URL and redirect
      const res = await api.accounts.getOneDriveConnectUrl();
      const redirectUrl = res?.authorizationUrl || res?.url;
      if (redirectUrl) {
        toast.info('Redirecting to Microsoft OneDrive authorization...');
        window.location.href = redirectUrl;
      } else {
        toast.error('Unable to retrieve OneDrive authorization URL');
      }
    } catch (err: any) {
      if (/not configured/i.test(err?.message || '')) {
        setActiveTab('onedrive_setup');
      } else {
        toast.error(err?.message || 'Unable to connect to OneDrive');
      }
    } finally {
      setLoading(false);
    }
  };

  // Save Google Config & Immediately Connect
  const handleSaveGoogleAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleClientId.trim() || !googleClientSecret.trim()) {
      toast.error('Both Client ID and Client Secret are required');
      return;
    }

    try {
      setLoading(true);
      await api.admin.saveGoogleConfig({
        clientId: googleClientId.trim(),
        clientSecret: googleClientSecret.trim(),
        redirectUri: googleRedirectUri.trim(),
      });
      setGoogleIsConfigured(true);
      toast.success('Google Drive credentials saved in local vault!');

      // Immediately initiate OAuth link
      const res = await api.accounts.getGoogleConnectUrl();
      const redirectUrl = res?.authorizationUrl || res?.url;
      if (redirectUrl) {
        toast.info('Redirecting to Google authorization...');
        window.location.href = redirectUrl;
      } else {
        toast.error('Unable to retrieve Google authorization URL');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save Google Drive credentials');
    } finally {
      setLoading(false);
    }
  };

  // Save OneDrive Config & Immediately Connect
  const handleSaveOneDriveAndConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onedriveClientId.trim() || !onedriveClientSecret.trim()) {
      toast.error('Both Application (Client) ID and Client Secret are required');
      return;
    }

    try {
      setLoading(true);
      await api.admin.saveOneDriveConfig({
        clientId: onedriveClientId.trim(),
        clientSecret: onedriveClientSecret.trim(),
        redirectUri: onedriveRedirectUri.trim(),
      });
      setOnedriveIsConfigured(true);
      toast.success('OneDrive credentials saved in local vault!');

      // Immediately initiate OAuth link
      const res = await api.accounts.getOneDriveConnectUrl();
      const redirectUrl = res?.authorizationUrl || res?.url;
      if (redirectUrl) {
        toast.info('Redirecting to Microsoft OneDrive authorization...');
        window.location.href = redirectUrl;
      } else {
        toast.error('Unable to retrieve OneDrive authorization URL');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save OneDrive credentials');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Redirect URI copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Connect MEGA
  const handleConnectMega = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.accounts.connectMega({ email: megaEmail, password: megaPassword });
      toast.success('MEGA account linked successfully!');
      onAccountConnected();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to link MEGA account');
    } finally {
      setLoading(false);
    }
  };

  // Connect pCloud
  const handleConnectPCloud = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.accounts.connectPCloud({ email: pcloudEmail, password: pcloudPassword });
      toast.success('pCloud account linked successfully!');
      onAccountConnected();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to link pCloud account');
    } finally {
      setLoading(false);
    }
  };

  // Connect AWS S3
  const handleConnectS3 = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.accounts.connectS3({
        accessKeyId: s3AccessKey,
        secretAccessKey: s3SecretKey,
        bucket: s3Bucket,
        region: s3Region,
        endpoint: s3Endpoint || undefined,
      });
      toast.success('S3 Bucket linked successfully!');
      onAccountConnected();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to link S3 Bucket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white border-2 border-black shadow-[8px_8px_0px_#000] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#FEF08A] border-b-2 border-black px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-black stroke-[2.5]" />
            <h3 className="font-['Space_Grotesk_Variable'] font-black text-lg text-black">
              {activeTab === 'select'
                ? 'Link Cloud Storage Drive'
                : activeTab === 'google_setup'
                ? 'Google Drive OAuth Setup'
                : activeTab === 'onedrive_setup'
                ? 'Microsoft OneDrive Setup'
                : `Connect ${activeTab.toUpperCase()}`}
            </h3>
          </div>
          <button
            onClick={() => {
              if (activeTab !== 'select') {
                setActiveTab('select');
              } else {
                onClose();
              }
            }}
            className="w-8 h-8 bg-white border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center hover:bg-rose-100 font-bold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Main Provider Selector */}
          {activeTab === 'select' && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700">
                Select a cloud provider to connect into your unified storage pool:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Google Drive Card */}
                <div className="bg-[#FEF08A]/30 border-2 border-black shadow-[3px_3px_0px_#000] p-4 flex flex-col justify-between hover:bg-[#FEF08A]/50 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-['Space_Grotesk_Variable'] font-black text-base">
                        Google Drive
                      </span>
                      <span className="neo-badge bg-[#FEF08A] text-[9px] py-0 px-1.5">
                        OAuth 2.0
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-600 font-bold mb-3">
                      15 GB Free Storage
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGoogleClick}
                      disabled={loading}
                      className="neo-btn neo-btn-primary flex-1 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
                    >
                      {loading ? 'Connecting...' : googleIsConfigured ? 'Sign in with Google' : 'Setup & Connect'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('google_setup')}
                      className="neo-btn bg-white hover:bg-slate-100 p-1.5 shadow-[2px_2px_0px_#000]"
                      title="Configure Google OAuth Credentials"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Microsoft OneDrive Card */}
                <div className="bg-[#BAE6FD]/30 border-2 border-black shadow-[3px_3px_0px_#000] p-4 flex flex-col justify-between hover:bg-[#BAE6FD]/50 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-['Space_Grotesk_Variable'] font-black text-base">
                        OneDrive
                      </span>
                      <span className="neo-badge bg-[#BAE6FD] text-[9px] py-0 px-1.5">
                        Graph API
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-600 font-bold mb-3">
                      5 GB Free Storage
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOneDriveClick}
                      disabled={loading}
                      className="neo-btn neo-btn-blue flex-1 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
                    >
                      {loading ? 'Connecting...' : onedriveIsConfigured ? 'Sign in with Microsoft' : 'Setup & Connect'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('onedrive_setup')}
                      className="neo-btn bg-white hover:bg-slate-100 p-1.5 shadow-[2px_2px_0px_#000]"
                      title="Configure OneDrive OAuth Credentials"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* MEGA NZ Card */}
                <div className="bg-[#FED7AA]/30 border-2 border-black shadow-[3px_3px_0px_#000] p-4 flex flex-col justify-between hover:bg-[#FED7AA]/50 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-['Space_Grotesk_Variable'] font-black text-base">
                        MEGA NZ
                      </span>
                      <span className="neo-badge bg-[#FED7AA] text-[9px] py-0 px-1.5">
                        E2EE
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-600 font-bold mb-3">
                      20 GB Free Storage
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('mega')}
                    className="neo-btn bg-[#FED7AA] hover:bg-[#FB923C] w-full py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    Enter MEGA Credentials
                  </button>
                </div>

                {/* pCloud Card */}
                <div className="bg-[#A7F3D0]/30 border-2 border-black shadow-[3px_3px_0px_#000] p-4 flex flex-col justify-between hover:bg-[#A7F3D0]/50 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-['Space_Grotesk_Variable'] font-black text-base">
                        pCloud
                      </span>
                      <span className="neo-badge bg-[#A7F3D0] text-[9px] py-0 px-1.5">
                        Swiss Cloud
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-600 font-bold mb-3">
                      10 GB Free Storage
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pcloud')}
                    className="neo-btn neo-btn-mint w-full py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    Enter pCloud Credentials
                  </button>
                </div>

                {/* AWS S3 / MinIO Card */}
                <div className="sm:col-span-2 bg-[#FBCFE8]/30 border-2 border-black shadow-[3px_3px_0px_#000] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#FBCFE8]/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-['Space_Grotesk_Variable'] font-black text-base">
                        AWS S3 / MinIO / Cloudflare R2
                      </span>
                      <span className="neo-badge bg-[#FBCFE8] text-[9px] py-0 px-1.5">
                        Bucket
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-600 font-bold">
                      Unlimited Scalable Object Storage
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('s3')}
                    className="neo-btn bg-[#FBCFE8] hover:bg-[#F472B6] px-4 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
                  >
                    Configure S3 Bucket
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Google Drive Setup Form */}
          {activeTab === 'google_setup' && (
            <form onSubmit={handleSaveGoogleAndConnect} className="space-y-4">
              <div className="p-3.5 bg-[#FEF08A]/30 border-2 border-black shadow-[2px_2px_0px_#000] space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-black mb-1">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>How to get Google Drive OAuth Credentials:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-800 font-medium pl-1">
                  <li>
                    Go to{' '}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline font-bold inline-flex items-center gap-0.5"
                    >
                      Google Cloud Console <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    and create or select a project.
                  </li>
                  <li>Enable the <strong>Google Drive API</strong> in APIs & Services.</li>
                  <li>Go to <strong>Credentials → Create Credentials → OAuth client ID</strong> (Type: Web application).</li>
                  <li>Copy and paste the exact Authorized Redirect URI below.</li>
                </ol>
              </div>

              {/* Redirect URI with copy button */}
              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                  Authorized Redirect URI (Paste into Google Cloud Console)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={googleRedirectUri}
                    className="flex-1 px-3 py-1.5 bg-slate-100 border-2 border-black font-mono text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(googleRedirectUri, setCopiedGoogleUri)}
                    className="neo-btn bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedGoogleUri ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedGoogleUri ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Client ID */}
              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                  Google Client ID
                </label>
                <input
                  type="text"
                  required
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  placeholder="123456789-abcdef.apps.googleusercontent.com"
                  className="w-full px-3 py-2 bg-[#FAFAF8] border-2 border-black font-mono text-xs"
                />
              </div>

              {/* Client Secret */}
              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                  Google Client Secret
                </label>
                <input
                  type="password"
                  required
                  value={googleClientSecret}
                  onChange={(e) => setGoogleClientSecret(e.target.value)}
                  placeholder="GOCSPX-••••••••••••••••"
                  className="w-full px-3 py-2 bg-[#FAFAF8] border-2 border-black font-mono text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className="neo-btn bg-slate-100 px-4 py-2 text-xs font-bold shadow-[2px_2px_0px_#000]"
                >
                  ← Back to Providers
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="neo-btn neo-btn-primary px-5 py-2 text-xs font-bold shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Save & Connect to Google Drive
                </button>
              </div>
            </form>
          )}

          {/* OneDrive Setup Form */}
          {activeTab === 'onedrive_setup' && (
            <form onSubmit={handleSaveOneDriveAndConnect} className="space-y-4">
              <div className="p-3.5 bg-[#BAE6FD]/30 border-2 border-black shadow-[2px_2px_0px_#000] space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-black mb-1">
                  <Info className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>How to get Microsoft OneDrive Credentials:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-800 font-medium pl-1">
                  <li>
                    Go to{' '}
                    <a
                      href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline font-bold inline-flex items-center gap-0.5"
                    >
                      Azure App Registrations <ExternalLink className="w-3 h-3" />
                    </a>.
                  </li>
                  <li>Register a new app with <strong>Multitenant & personal accounts</strong> support.</li>
                  <li>Under <strong>Authentication</strong>, add platform Web with Redirect URI below.</li>
                  <li>Under <strong>Certificates & Secrets</strong>, create a new Client Secret.</li>
                </ol>
              </div>

              {/* Redirect URI with copy button */}
              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                  Web Redirect URI (Paste into Azure Portal)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={onedriveRedirectUri}
                    className="flex-1 px-3 py-1.5 bg-slate-100 border-2 border-black font-mono text-xs text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(onedriveRedirectUri, setCopiedOneDriveUri)}
                    className="neo-btn bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-bold shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedOneDriveUri ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedOneDriveUri ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Client ID */}
              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                  Application (Client) ID
                </label>
                <input
                  type="text"
                  required
                  value={onedriveClientId}
                  onChange={(e) => setOnedriveClientId(e.target.value)}
                  placeholder="00000000-0000-0000-0000-000000000000"
                  className="w-full px-3 py-2 bg-[#FAFAF8] border-2 border-black font-mono text-xs"
                />
              </div>

              {/* Client Secret */}
              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                  Client Secret Value
                </label>
                <input
                  type="password"
                  required
                  value={onedriveClientSecret}
                  onChange={(e) => setOnedriveClientSecret(e.target.value)}
                  placeholder="••••••••••••••••••••"
                  className="w-full px-3 py-2 bg-[#FAFAF8] border-2 border-black font-mono text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className="neo-btn bg-slate-100 px-4 py-2 text-xs font-bold shadow-[2px_2px_0px_#000]"
                >
                  ← Back to Providers
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="neo-btn neo-btn-blue px-5 py-2 text-xs font-bold shadow-[3px_3px_0px_#000] flex items-center gap-1.5 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Save & Connect to OneDrive
                </button>
              </div>
            </form>
          )}

          {/* MEGA Connect Sub-form */}
          {activeTab === 'mega' && (
            <form onSubmit={handleConnectMega} className="space-y-4">
              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                  MEGA Account Email
                </label>
                <input
                  type="email"
                  required
                  value={megaEmail}
                  onChange={(e) => setMegaEmail(e.target.value)}
                  placeholder="mega-user@example.com"
                  className="w-full px-3 py-2 bg-[#FAFAF8] border-2 border-black font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                  MEGA Password
                </label>
                <input
                  type="password"
                  required
                  value={megaPassword}
                  onChange={(e) => setMegaPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#FAFAF8] border-2 border-black font-mono text-xs"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-black text-xs font-mono text-amber-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Credentials are used locally to derive master cryptographic keys.</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className="neo-btn bg-slate-100 px-4 py-2 text-xs font-bold shadow-[2px_2px_0px_#000]"
                >
                  ← Back to Providers
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="neo-btn neo-btn-primary px-5 py-2 text-xs font-bold shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  {loading ? 'Connecting MEGA...' : 'Link MEGA (20GB)'}
                </button>
              </div>
            </form>
          )}

          {/* pCloud Connect Sub-form */}
          {activeTab === 'pcloud' && (
            <form onSubmit={handleConnectPCloud} className="space-y-4">
              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                  pCloud Account Email
                </label>
                <input
                  type="email"
                  required
                  value={pcloudEmail}
                  onChange={(e) => setPcloudEmail(e.target.value)}
                  placeholder="pcloud-user@example.com"
                  className="w-full px-3 py-2 bg-[#FAFAF8] border-2 border-black font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                  pCloud Password
                </label>
                <input
                  type="password"
                  required
                  value={pcloudPassword}
                  onChange={(e) => setPcloudPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#FAFAF8] border-2 border-black font-mono text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className="neo-btn bg-slate-100 px-4 py-2 text-xs font-bold shadow-[2px_2px_0px_#000]"
                >
                  ← Back to Providers
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="neo-btn neo-btn-mint px-5 py-2 text-xs font-bold shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  {loading ? 'Connecting pCloud...' : 'Link pCloud (10GB)'}
                </button>
              </div>
            </form>
          )}

          {/* S3 Connect Sub-form */}
          {activeTab === 's3' && (
            <form onSubmit={handleConnectS3} className="space-y-3">
              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                  Access Key ID
                </label>
                <input
                  type="text"
                  required
                  value={s3AccessKey}
                  onChange={(e) => setS3AccessKey(e.target.value)}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  className="w-full px-3 py-1.5 bg-[#FAFAF8] border-2 border-black font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                  Secret Access Key
                </label>
                <input
                  type="password"
                  required
                  value={s3SecretKey}
                  onChange={(e) => setS3SecretKey(e.target.value)}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  className="w-full px-3 py-1.5 bg-[#FAFAF8] border-2 border-black font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                    Bucket Name
                  </label>
                  <input
                    type="text"
                    required
                    value={s3Bucket}
                    onChange={(e) => setS3Bucket(e.target.value)}
                    placeholder="my-vault-bucket"
                    className="w-full px-3 py-1.5 bg-[#FAFAF8] border-2 border-black font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    value={s3Region}
                    onChange={(e) => setS3Region(e.target.value)}
                    placeholder="us-east-1"
                    className="w-full px-3 py-1.5 bg-[#FAFAF8] border-2 border-black font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-['Space_Grotesk_Variable'] font-bold text-xs text-black mb-1">
                  Custom Endpoint (Optional for Cloudflare R2 / MinIO)
                </label>
                <input
                  type="text"
                  value={s3Endpoint}
                  onChange={(e) => setS3Endpoint(e.target.value)}
                  placeholder="https://s3.example.com"
                  className="w-full px-3 py-1.5 bg-[#FAFAF8] border-2 border-black font-mono text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className="neo-btn bg-slate-100 px-4 py-2 text-xs font-bold shadow-[2px_2px_0px_#000]"
                >
                  ← Back to Providers
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="neo-btn neo-btn-purple px-5 py-2 text-xs font-bold shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  {loading ? 'Connecting S3...' : 'Link S3 Bucket'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
