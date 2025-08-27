import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../utils/api';
import LoginForm from '../components/auth/LoginForm';
import MagicLinkSent from '../components/auth/MagicLinkSent';
import Loading from '../components/common/Loading';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [showMagicLinkSent, setShowMagicLinkSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (token) => {
    setVerifying(true);
    setError('');

    try {
      const response = await api.auth.verify(token);
      login(response.jwt, response.admin);
      navigate('/dashboard');
    } catch (error) {
      setError(`Login failed: ${error.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleMagicLinkSent = (email) => {
    setSentEmail(email);
    setShowMagicLinkSent(true);
  };

  const handleBackToLogin = () => {
    setShowMagicLinkSent(false);
    setSentEmail('');
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Verifying login..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full">
        {error && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          </div>
        )}
        
        {showMagicLinkSent ? (
          <MagicLinkSent 
            email={sentEmail} 
            onBackToLogin={handleBackToLogin} 
          />
        ) : (
          <LoginForm onMagicLinkSent={handleMagicLinkSent} />
        )}
      </div>
    </div>
  );
};

export default Login;