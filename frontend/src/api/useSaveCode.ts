import React, { useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { apiClient } from '../services/api';

interface SaveCodeParams {
  code: string;
  existingDraff?: {
    username: string;
    title: string;
  };
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
    async ({ code, existingDraff }) => {
      setLoading(true);
      setError(null);
      
      try {
        const token = await getAccessTokenSilently();

        if (existingDraff) {
          // Update existing draff
          const response = await apiClient.put(
            `/v1/draffs/${existingDraff.username}/${existingDraff.title}`,
            { code },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          return {
            username: `@${response.data.username}`,
            draffName: response.data.title
          };
        } else {
          // Create new draff
          const response = await apiClient.post('/v1/draffs', 
            { code },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          return {
            username: `@${response.data.username}`,
            draffName: response.data.title
          };
        }
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
