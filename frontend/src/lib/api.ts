export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : endpoint;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // ensures cookies are sent and received
  });

  const contentType = response.headers.get('content-type') || '';
  let payload: any = null;

  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    payload = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (payload && typeof payload === 'object' && payload.error) 
      ? payload.error 
      : response.statusText || 'An unexpected error occurred';
    throw new ApiError(errorMsg, response.status, payload);
  }

  // If response has { data: ... }, unwrap it, otherwise return payload
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export const api = {
  get: <T>(url: string, options?: RequestInit) => 
    request<T>(url, { method: 'GET', ...options }),
    
  post: <T>(url: string, body?: any, options?: RequestInit) => 
    request<T>(url, { 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options 
    }),
    
  patch: <T>(url: string, body?: any, options?: RequestInit) => 
    request<T>(url, { 
      method: 'PATCH', 
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options 
    }),
    
  put: <T>(url: string, body?: any, options?: RequestInit) => 
    request<T>(url, { 
      method: 'PUT', 
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options 
    }),

  delete: <T>(url: string, options?: RequestInit) => 
    request<T>(url, { method: 'DELETE', ...options }),

  // Auth endpoints
  auth: {
    me: () => api.get<{ authenticated: boolean; user?: { id: number; email: string; isAdmin?: boolean } }>('/api/auth/me'),
    login: (credentials: { email: string; password: string }) => 
      api.post<{ authenticated: boolean; user: { id: number; email: string; isAdmin?: boolean } }>('/api/auth/login', credentials),
    register: (credentials: { email: string; password: string }) => 
      api.post<{ authenticated: boolean; user: { id: number; email: string; isAdmin?: boolean } }>('/api/auth/register', credentials),
    logout: () => api.post<{ authenticated: boolean }>('/api/auth/logout'),
  },

  // Accounts & Providers
  accounts: {
    list: () => api.get<any[]>('/api/accounts'),
    providers: () => api.get<any[]>('/api/accounts/providers'),
    delete: (id: number | string) => api.delete<{ success: boolean }>(`/api/accounts/${id}`),
    
    // Connect OAuth / Credential providers
    getGoogleConnectUrl: () => api.get<{ url: string; authorizationUrl: string; state?: string; redirectUri?: string }>('/api/accounts/google/connect'),
    getOneDriveConnectUrl: () => api.get<{ url: string; authorizationUrl: string; state?: string; redirectUri?: string }>('/api/accounts/onedrive/connect'),
    getDropboxConnectUrl: () => api.get<{ url: string; authorizationUrl: string; state?: string; redirectUri?: string }>('/api/accounts/dropbox/connect'),
    connectMega: (payload: { email: string; password: string }) => 
      api.post<any>('/api/accounts/mega/connect', payload),
    connectPCloud: (payload: { email: string; password: string }) => 
      api.post<any>('/api/accounts/pcloud/connect', payload),
    connectS3: (payload: { accessKeyId: string; secretAccessKey: string; bucket: string; region?: string; endpoint?: string }) => 
      api.post<any>('/api/accounts/s3/connect', payload),
  },

  // File Operations
  files: {
    list: (params?: { path?: string; search?: string; starred?: boolean; recent?: boolean; shared?: boolean }) => {
      const sp = new URLSearchParams();
      if (params?.search) sp.set('search', params.search);
      if (params?.path && !params?.search) sp.set('path', params.path);
      if (params?.starred) sp.set('starred', '1');
      if (params?.recent) sp.set('recent', '1');
      if (params?.shared) sp.set('shared', '1');
      const qs = sp.toString();
      return api.get<any[]>(`/api/files${qs ? `?${qs}` : ''}`);
    },
    star: (id: string | number, isStarred: boolean) => 
      api.patch<{ success: boolean; is_starred: boolean }>(`/api/files/${id}/star`, { is_starred: isStarred }),
    rename: (id: string | number, name: string) => 
      api.patch<{ success: boolean }>(`/api/files/${id}/rename`, { name }),
    delete: (id: string | number) => 
      api.post<{ success: boolean }>(`/api/files/bulk/delete`, { ids: [id] }),
    bulkDelete: (ids: (string | number)[]) => 
      api.post<{ success: boolean; count: number }>(`/api/files/bulk/delete`, { ids }),
    getDownloadUrl: (id: string | number) => `/api/files/${id}/download`,
    getPreviewUrl: (id: string | number) => `/api/files/${id}/preview`,
  },

  // Admin Provider Configurations (Dynamic OAuth setup)
  admin: {
    getGoogleConfig: () => api.get<{ configured: boolean; clientId?: string; redirectUri?: string; hasClientSecret?: boolean }>('/api/admin/providers/google'),
    saveGoogleConfig: (payload: { clientId: string; clientSecret: string; redirectUri?: string }) => 
      api.put<any>('/api/admin/providers/google', payload),
    testGoogleConfig: (payload?: { clientId?: string; clientSecret?: string; redirectUri?: string }) => 
      api.post<any>('/api/admin/providers/google/test', payload || {}),

    getOneDriveConfig: () => api.get<{ configured: boolean; clientId?: string; redirectUri?: string; hasClientSecret?: boolean }>('/api/admin/providers/onedrive'),
    saveOneDriveConfig: (payload: { clientId: string; clientSecret: string; redirectUri?: string }) => 
      api.put<any>('/api/admin/providers/onedrive', payload),
    testOneDriveConfig: (payload?: { clientId?: string; clientSecret?: string; redirectUri?: string }) => 
      api.post<any>('/api/admin/providers/onedrive/test', payload || {}),
  },
};
