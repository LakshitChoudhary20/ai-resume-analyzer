import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  timeout: 60000, // 60s — AI calls can be slow
});

// Attach token if present
const token = localStorage.getItem('token');
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

export default api;
