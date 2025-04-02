
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

// Login function
export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    const { token, user } = response.data;
    
    // Store auth data
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('authenticated', 'true');
    
    // Set auth header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return user;
  } catch (error) {
    console.error('Login failed:', error);
    throw new Error(
      axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Login failed. Please check your credentials.'
    );
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
  getToken,
  login
};

export default authService;
