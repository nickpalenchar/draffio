import { useAuth0 } from '@auth0/auth0-react';
import { apiClient } from '../services/api';
import { useState, useEffect } from 'react';

interface UseGetCodeParams {
  username: string;
  title: string;
}

export const useGetCode = ({ username, title }: UseGetCodeParams) => {
  const [code, setCode] = useState(' ');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchCode = async () => {
      if (error || !loading) {
        return;
      }

      if (username === 'dev/null') {
        setLoading(false);
        setError('');
        setCode('// Your code here...');
        return;
      }

      try {
        const token = await getAccessTokenSilently();
        const response = await apiClient.get(`/v1/draffs/${username}/${title}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setCode(response.data.code);
        setLoading(false);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Not Found!');
        } else {
          setError('An error occurred');
          console.error('Error fetching code:', err);
        }
        setLoading(false);
      }
    };

    fetchCode();
  }, [username, title, error, loading, getAccessTokenSilently]);

  return { code, error, loading };
};
