import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { User } from '../context/AuthContext';

interface RoleGuardProps {
  allowedRoles: Array<User['role'] | 'Admin'>;
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) return null;

  if (allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return null;
}
