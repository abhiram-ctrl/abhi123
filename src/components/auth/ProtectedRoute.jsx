// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  };

  // Get user role from localStorage
  const getUserRole = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed.role || 'citizen';
      } catch (e) {
        return 'citizen';
      }
    }
    return null;
  };

  // SPECIAL CASE: Allow access to volunteer/apply for anyone authenticated
  // This is because new volunteers need to apply before their role is updated
  const isVolunteerApplyRoute = location.pathname === '/volunteer/apply';

  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Allow access to /volunteer/apply for any authenticated user
  if (isVolunteerApplyRoute) {
    console.log('Allowing access to /volunteer/apply for authenticated user');
    console.log('User role:', getUserRole());
    return children;
  }

  // Check if user has required role
  const hasRequiredRole = () => {
    if (allowedRoles.length === 0) return true;
    const userRole = getUserRole();
    console.log('Checking role access:', { userRole, allowedRoles });
    return allowedRoles.includes(userRole);
  };

  if (!hasRequiredRole()) {
    console.log('Role check failed. Redirecting to appropriate login...');
    // Redirect to the appropriate login page for the requested section
    const path = location.pathname;
    if (path.startsWith('/volunteer')) {
      return <Navigate to="/login?role=volunteer&error=unauthorized" replace />;
    }
    if (path.startsWith('/admin')) {
      return <Navigate to="/admin-login?error=unauthorized" replace />;
    }
    // Citizen section or other: send to citizen login
    return <Navigate to="/login?role=citizen&error=unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;