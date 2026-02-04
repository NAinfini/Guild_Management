import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'moderator' | 'member' | 'external'>;
};

export function ProtectedRoute({ children, allowedRoles = ['admin', 'moderator', 'member'] }: ProtectedRouteProps) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
}
