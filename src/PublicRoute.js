import React from 'react';
import { Navigate } from 'react-router';

export default function PublicRoute({ user, children }) {
  if (user) {
    return <Navigate to="/records" replace />;
  }
  return children;
}
