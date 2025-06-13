import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PublicRoute({ user, children }) {
  if (user) {
    return <Navigate to="/records" replace />;
  }
  return children;
}
