import React from 'react';
import { useAuthStore } from '../../store/auth.store';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'manager' | 'team_head' | 'employee')[];
  fallback?: React.ReactNode;
}

/**
 * RoleGuard conditionally renders children based on the authenticated user's role.
 * 
 * @param allowedRoles - An array of roles that are permitted to see the content.
 * @param fallback - Optional element to show if the user is not authorized (default is null).
 */
export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
