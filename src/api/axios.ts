import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Add a slight artificial delay so the beautiful loading animation is visible
api.interceptors.response.use(
  async (response) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return response;
  },
  async (error) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return Promise.reject(error);
  }
);

export default api;
