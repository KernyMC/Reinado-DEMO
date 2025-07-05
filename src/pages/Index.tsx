
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

const Index = () => {
  const { user } = useAuth();

  // Redirect to login if not authenticated, otherwise to votes
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/votes" replace />;
};

export default Index;
