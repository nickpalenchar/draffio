import React, { useEffect, useState } from 'react';
import { Box, Text, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { apiClient } from '../../services/api';
import { API_CONFIG } from '../../config/api';
import { useAuth0 } from '@auth0/auth0-react';

export const Profile = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await apiClient.get(API_CONFIG.endpoints.user, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserData(response.data);
      } catch (err) {
        setError('Failed to load user data');
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [getAccessTokenSilently]);

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box p={4}>
      <Text as="pre" whiteSpace="pre-wrap">
        {JSON.stringify(userData, null, 2)}
      </Text>
    </Box>
  );
}; 