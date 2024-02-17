import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cuid from '@paralleldrive/cuid2';

export const RandomDraff = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const id = cuid.createId();
    navigate('/js/' + id);
  }, [navigate]);
  return <div>One moment...</div>;
};
