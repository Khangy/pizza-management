import axios from 'axios';

// Force HTTPS
const baseURL = 'https://pizza-management-production.up.railway.app/api';

// Add logging to debug the URL
console.log('API Base URL being used:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to log the full URL
api.interceptors.request.use(
  (config) => {
    console.log('Full request URL:', config.url);
    console.log('Base URL being used:', config.baseURL);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;