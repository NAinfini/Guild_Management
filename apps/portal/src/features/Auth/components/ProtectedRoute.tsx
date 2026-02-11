import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks';
import type { Role } from '@/types';
import type { PermissionControl } from '@/lib/permissions';
import { hasPermission } from '@/lib/permissions';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: Role[];
  permissionControl?: PermissionControl;
};

export function ProtectedRoute({
  children,
  allowedRoles = ['admin', 'moderator', 'member'],
  permissionControl,
}: ProtectedRouteProps) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (permissionControl && !hasPermission(user.role, permissionControl)) return <Navigate to="/" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
}
