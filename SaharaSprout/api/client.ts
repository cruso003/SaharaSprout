import axios from 'axios';

const API_BASE_URL = 'http://192.168.8.144:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
