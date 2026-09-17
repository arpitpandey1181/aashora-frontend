import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:58781/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token if exists
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('softycare_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const userStr = localStorage.getItem('softycare_user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const tenantId = u.tenantid || u.tenantId || u.orgid || u.orgId;
          if (tenantId) {
            config.headers['X-Tenant-ID'] = tenantId;
          }
        } catch {}
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle API errors globally
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      if (error.response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('softycare_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
