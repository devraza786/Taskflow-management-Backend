import axios from 'axios';

const getBaseURL = () => {
  const url = import.meta.env.VITE_API_URL || 'https://taskflow-management-backend-api.vercel.app/api/v1';
  // Ensure we don't have v1/api swapped
  if (url.includes('/v1/api')) {
    return url.replace('/v1/api', '/api/v1');
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 (Unauthorized)
    if (error.response?.status === 401) {
      // Lazy import to avoid circular dependency crashing the store instantiation
      const { useAuthStore } = await import('../store/auth.store');
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
