import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('access_token');

  if (!token) return <Navigate to="/login" />;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Проверка на срок действия токена
    if (payload.exp * 1000 < Date.now()) {
      return <Navigate to="/login" />;
    }

    // Проверка роли
    if (role && payload.role !== role) {
      return <Navigate to="/login" />;
    }

    return children;
  } catch {
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;

