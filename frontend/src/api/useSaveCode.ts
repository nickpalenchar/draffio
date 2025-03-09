import React, { useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiClient } from '../services/api';

interface SaveCodeParams {
  code: string;
}

interface SaveCodeReturn {
  loading: boolean;
  error: string | null;
  saveCode: (params: SaveCodeParams) => Promise<{ username: string; draffName: string }>;
}

export const useSaveCode = (): SaveCodeReturn => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCode = useCallback<SaveCodeReturn['saveCode']>(
    async ({ code }) => {
      setLoading(true);
      setError(null);
      
      try {
        const token = await getAccessTokenSilently();
        const response = await apiClient.post('/v1/draffs', {
          code
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const { username, title } = response.data;
        return { 
          username: `@${username}`,
          draffName: title 
        };
      } catch (err) {
        setError('Failed to save code');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getAccessTokenSilently]
  );

  return { loading, error, saveCode };
};
