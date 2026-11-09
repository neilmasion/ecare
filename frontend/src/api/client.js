import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Read Django's csrftoken cookie
function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 second timeout for external SMTP / Neon DB
});

// Attach CSRF token to every mutating request (POST, PUT, PATCH, DELETE)
apiClient.interceptors.request.use((config) => {
  const method = (config.method || '').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    config.headers['X-CSRFToken'] = getCsrfToken();
  }
  return config;
});

// Simple in-memory cache with expiration
const memoryCache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

const getCachedOrFetch = async (url, params = {}) => {
  const cacheKey = `${url}:${JSON.stringify(params)}`;
  const cached = memoryCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const res = await apiClient.get(url, { params });
  memoryCache.set(cacheKey, { data: res, timestamp: Date.now() });
  return res;
};

export const clearApiCache = () => {
  memoryCache.clear();
};

// Services API
export const getServices = (params) => getCachedOrFetch('/services/', params);
export const getServiceDetail = (slugOrId) => getCachedOrFetch(`/services/${slugOrId}/`);

// Assistance API (Mutations invalidate cache)
export const submitAssistance = async (formData) => {
  clearApiCache();
  if (formData instanceof FormData) {
    return apiClient.post('/assistance/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return apiClient.post('/assistance/', formData);
};

export const trackAssistance = (referenceNumber) =>
  apiClient.get('/assistance/track/', { params: { ref: referenceNumber } });

export const getMyAssistanceRequests = () => apiClient.get('/assistance/my-requests/');

// Contact API
export const submitContact = (data) => apiClient.post('/contact/', data);

// Info & Stats API
export const getStats = () => getCachedOrFetch('/stats/');
export const getTestimonials = () => getCachedOrFetch('/testimonials/');
export const getFAQs = (category) => getCachedOrFetch('/faqs/', category ? { category } : {});

// Auth API
export const sendVerificationCode = (email) => apiClient.post('/auth/send-verification/', { email });
export const registerUser = (userData) => apiClient.post('/auth/register/', userData);
export const loginUser = (credentials) => apiClient.post('/auth/login/', credentials);
export const logoutUser = () => apiClient.post('/auth/logout/');
export const forgotPassword = (email) => apiClient.post('/auth/forgot-password/', { email });
export const resetPassword = (data) => apiClient.post('/auth/reset-password/', data);
export const getCurrentUser = () =>
  apiClient.get('/auth/me/', {
    params: { _t: Date.now() },
    headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
  });

export const getProfile = () => apiClient.get('/auth/profile/');
export const updateProfile = (data) => apiClient.put('/auth/profile/', data);
export const uploadProfileAvatar = (formData) =>
  apiClient.post('/auth/profile/avatar/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const verifyResident = (data) => apiClient.post('/auth/verify-resident/', data);

export default apiClient;
