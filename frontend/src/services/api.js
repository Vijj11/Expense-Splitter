import axios from 'axios';

const API_BASE_URL = 'https://expense-splitter-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export const sendOtp = (mobile) => api.post('/auth/send-otp/', { mobile });
export const verifyOtp = (mobile, otp) => api.post('/auth/verify-otp/', { mobile, otp });

export default api;
