import { useState, useEffect, createContext, useContext } from 'react';
import { auth } from '../utils/auth.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = auth.getToken();
    const adminData = auth.getAdmin();
    
    if (token && adminData) {
      setIsAuthenticated(true);
      setAdmin(adminData);
    }
    
    setLoading(false);
  }, []);

  const login = (token, adminData) => {
    auth.setToken(token);
    auth.setAdmin(adminData);
    setIsAuthenticated(true);
    setAdmin(adminData);
  };

  const logout = () => {
    auth.logout();
    setIsAuthenticated(false);
    setAdmin(null);
  };

  const value = {
    isAuthenticated,
    admin,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};