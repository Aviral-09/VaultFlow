export interface User {
  id: number;
  email: string;
  isAdmin?: boolean;
  role?: string;
  created_at?: string;
}

export interface Account {
  id: number;
  email: string;
  provider: 'google' | 'onedrive' | 'dropbox' | 'mega' | 'pcloud' | 's3' | string;
  total_space: number;
  used_space: number;
  free_space: number;
  status: 'active' | 'warning' | 'error' | 'syncing' | string;
  created_at?: string;
}

export interface FileItem {
  id: string | number;
  account_id?: number;
  provider: string;
  name: string;
  path: string;
  size: number;
  mime_type?: string;
  is_directory: boolean;
  starred?: boolean;
  shared?: boolean;
  updated_at?: string;
  created_at?: string;
  thumbnail_url?: string;
}

export interface StorageBreakdown {
  total: number;
  used: number;
  free: number;
  providers: {
    name: string;
    provider: string;
    used: number;
    total: number;
    color: string;
  }[];
}
