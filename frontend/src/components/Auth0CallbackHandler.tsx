import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Auth0CallbackHandler = () => {
  const { error, isLoading, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (error) {
      console.error('Auth error:', error);
      navigate('/');
      return;
    }

    const returnTo = localStorage.getItem('auth0ReturnTo') || '/';
    localStorage.removeItem('auth0ReturnTo');
    
    if (isAuthenticated) {
      navigate(returnTo);
    }
  }, [error, isLoading, isAuthenticated, navigate]);

  return null;
};
