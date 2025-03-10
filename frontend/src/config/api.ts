const getApiUrl = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return window.location.hostname === 'draff.io' 
      ? 'https://api.draff.io'
      : 'https://api.zibzu.online';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

export const API_CONFIG = {
  baseURL: getApiUrl(),
  endpoints: {
    healthCheck: '/healthz',
    authorized: '/v1/authorized',
    user: '/v1/user/self'
  }
}; 