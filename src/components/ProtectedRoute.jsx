import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, requireActiveStatus = false }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      // Redirect based on role
      return <Navigate to="/" replace />; 
    }

    if (requireActiveStatus && payload.status !== 'active') {
      return <Navigate to="/pending" replace />;
    }

    return children;
  } catch (err) {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
