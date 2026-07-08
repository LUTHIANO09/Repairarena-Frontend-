import axios from 'axios';

// Base URL of your Django backend
const BASE_URL = 'http://127.0.0.1:8000/api';

// Create an axios instance with default settings
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach the token to every request if it exists
// This is what was causing the Postman 401 issues — React handles it automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// ── AUTH ──────────────────────────────────────────────
export const registerUser = (data) => api.post('/auth/register/', data);
export const loginUser = (data) => api.post('/auth/login/', data);
export const logoutUser = () => api.post('/auth/logout/');

// ── TERMS ─────────────────────────────────────────────
export const getTerms = (userType) => api.get(`/terms/?user_type=${userType}`);
export const agreeToTerms = (termsId) => api.post('/terms/agree/', { terms_id: termsId });

// ── PROFILE ───────────────────────────────────────────
export const createCustomerProfile = (data) => api.post('/profile/customer/create/', data);
export const getCustomerProfile = () => api.get('/profile/customer/');
export const createArtisanProfile = (data) => api.post('/profile/artisan/create/', data);
export const getArtisanProfile = () => api.get('/profile/artisan/');
export const toggleAvailability = () => api.post('/profile/artisan/availability/');

// ── VERIFICATION ──────────────────────────────────────
export const uploadCertificate = (data) => api.post('/verification/certificate/', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const submitGuarantor = (data) => api.post('/verification/guarantor/', data);

// ── CATEGORIES ────────────────────────────────────────
export const getCategories = () => api.get('/categories/');
export const getArtisanActiveJobs = () => api.get('/artisan/jobs/');

// ── JOB REQUESTS ──────────────────────────────────────
export const getJobs = () => api.get('/jobs/');
export const getMyJobs = () => api.get('/jobs/mine/');
export const getJobDetail = (id) => api.get(`/jobs/${id}/`);
export const createJob = (data) => api.post('/jobs/', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// ── QUOTES ────────────────────────────────────────────
export const getQuotesForJob = (jobId) => api.get(`/jobs/${jobId}/quotes/`);
export const submitQuote = (jobId, data) => api.post(`/jobs/${jobId}/quotes/`, {
  ...data,
  job_request: jobId,
});
export const acceptQuote = (quoteId) => api.post(`/quotes/${quoteId}/accept/`);

// ── ACTIVE JOBS ───────────────────────────────────────
export const getJobActiveDetail = (id) => api.get(`/active-jobs/${id}/`);
export const getMyActiveJobs = () => api.get('/jobs/mine/');
export const updateJobStatus = (jobId, newStatus) =>
  api.post(`/active-jobs/${jobId}/status/`, { status: newStatus });
export const submitReview = (jobId, data) => api.post(`/active-jobs/${jobId}/review/`, data);
export const uploadAfterPhoto = (jobId, data) => api.post(`/active-jobs/${jobId}/after-photo/`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const confirmPortfolioPhoto = (jobId) => api.post(`/active-jobs/${jobId}/confirm-photo/`);

export default api;