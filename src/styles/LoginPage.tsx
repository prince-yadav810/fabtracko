
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import '../styles/LoginPage.css';

// Define the API URL
const API_URL = 'http://localhost:5001/api';

// Response types
interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
  };
}

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the backend login API
      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/login`,
        { username, password }
      );
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('authenticated', 'true');
      
      // Set Authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      toast.success('Login successful!');
      navigate('/'); // Redirect to homepage
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const [error, setError] = useState('');

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Vikas Fabrication Works</h2>
        {error && <p className="error-message">{error}</p>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              title="Enter your username"
              placeholder="Enter username"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              title="Enter your password"
              placeholder="Enter password"
              required
              disabled={isLoading}
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
