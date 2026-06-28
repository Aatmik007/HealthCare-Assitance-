import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Connect directly to the primary Node.js API server
axios.defaults.baseURL = 'http://localhost:5000';

const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set default axios header if token is present
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  // Load user profile on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/profile');
          setUser(res.data);
        } catch (err) {
          console.error("Auth initialization failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
      return false;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      setToken(userToken);
      setUser(userData);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const res = await axios.put('/api/auth/profile', profileData);
      setUser(res.data.user);
      return { success: true, message: res.data.message };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, updateProfile, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
