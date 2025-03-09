import axios from 'axios';
import { API_CONFIG } from '../config/api';

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export { apiClient }; 