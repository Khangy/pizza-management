import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://pizza-management-production.up.railway.app/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors here (e.g., show toast notifications)
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;