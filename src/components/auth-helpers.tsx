import React from 'react';
import { useAuth } from '@/hooks/use-auth';

export function Authenticated({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading || !isAuthenticated) return null;
  return <>{children}</>;
}

export function Unauthenticated({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading || isAuthenticated) return null;
  return <>{children}</>;
}

export function AuthLoading({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  if (!isLoading) return null;
  return <>{children}</>;
}
