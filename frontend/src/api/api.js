import axios from 'axios';

const api = axios.create({
  baseURL: 'https://mern-ai-notes-app.onrender.com/api',
  withCredentials: false,
});

// 🔥 FORCE ATTACH TOKEN
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // console.log('➡️ API REQUEST:', config.url);
    // console.log('➡️ TOKEN FROM STORAGE:', token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // console.log('➡️ REQUEST HEADERS:', config.headers);
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
