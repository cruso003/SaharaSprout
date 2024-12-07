import axios from 'axios';

const API_BASE_URL = 'http://34.227.29.64';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
