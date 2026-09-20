import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0 || !bytes || isNaN(bytes)) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export interface ProviderMeta {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  category: string;
}

export function getProviderMeta(provider: string): ProviderMeta {
  const p = (provider || '').toLowerCase().replace(/[-_]/g, '');
  
  if (p.includes('google')) {
    return {
      id: 'google',
      name: 'Google Drive',
      color: '#FDE047',
      badgeBg: 'bg-[#FEF08A]',
      badgeText: 'text-black',
      category: 'Personal & Enterprise',
    };
  }
  if (p.includes('one') || p.includes('microsoft')) {
    return {
      id: 'onedrive',
      name: 'OneDrive',
      color: '#38BDF8',
      badgeBg: 'bg-[#BAE6FD]',
      badgeText: 'text-black',
      category: 'Microsoft 365 Cloud',
    };
  }
  if (p.includes('drop')) {
    return {
      id: 'dropbox',
      name: 'Dropbox',
      color: '#A78BFA',
      badgeBg: 'bg-[#DDD6FE]',
      badgeText: 'text-black',
      category: 'Fast Sync Cloud',
    };
  }
  if (p.includes('mega')) {
    return {
      id: 'mega',
      name: 'MEGA',
      color: '#FB923C',
      badgeBg: 'bg-[#FED7AA]',
      badgeText: 'text-black',
      category: 'End-to-End Encrypted',
    };
  }
  if (p.includes('pcloud')) {
    return {
      id: 'pcloud',
      name: 'pCloud',
      color: '#34D399',
      badgeBg: 'bg-[#A7F3D0]',
      badgeText: 'text-black',
      category: 'Swiss Secure Cloud',
    };
  }
  if (p.includes('s3') || p.includes('aws')) {
    return {
      id: 's3',
      name: 'AWS S3',
      color: '#F472B6',
      badgeBg: 'bg-[#FBCFE8]',
      badgeText: 'text-black',
      category: 'Object Storage Bucket',
    };
  }

  return {
    id: provider || 'unknown',
    name: provider ? provider.toUpperCase() : 'Custom Cloud',
    color: '#E2E8F0',
    badgeBg: 'bg-slate-200',
    badgeText: 'text-black',
    category: 'Cloud Storage',
  };
}
