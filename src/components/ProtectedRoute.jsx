import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles, requireActiveStatus = false }) => {
  const { user, userRole, userStatus, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-50">
        <div className="w-8 h-8 border-4 border-terracotta-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  if (requireActiveStatus && userStatus !== 'active') {
    return <Navigate to="/pending" replace />;
  }

  return children;
};

export default ProtectedRoute;
