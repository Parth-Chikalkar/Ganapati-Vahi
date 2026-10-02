import axios from 'axios';

// Separate axios instance for admin API calls
const AdminAPI = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '/api') + '/admin',
});

// Attach admin JWT token to every request
AdminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses — clear admin session
AdminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
    return Promise.reject(error);
  }
);

export default AdminAPI;
