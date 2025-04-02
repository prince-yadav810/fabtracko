
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';
const TOKEN_KEY = 'auth_token';

// Initialize auth headers with stored token if any
export const initAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('authenticated') === 'true' && !!localStorage.getItem(TOKEN_KEY);
};

// Logout function
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('user');
  localStorage.removeItem('authenticated');
  delete axios.defaults.headers.common['Authorization'];
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Get token
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const authService = {
  initAuthHeaders,
  isAuthenticated,
  logout,
  getCurrentUser,
  getToken
};

export default authService;
