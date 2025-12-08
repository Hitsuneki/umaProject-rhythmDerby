'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
    }

    // If authenticated and trying to access login/register, redirect to dashboard
    if (isAuthenticated && isPublicRoute) {
      router.push('/');
    }
  }, [isAuthenticated, pathname, router]);

  // Show loading or nothing while checking auth
  if (!isAuthenticated && pathname !== '/login' && pathname !== '/register') {
    return null;
  }

  return <>{children}</>;
}