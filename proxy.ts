import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const isAuthenticated = !!user;

  const { pathname } = request.nextUrl;
  
  // Protected routes - only dashboard needs middleware protection
  // Other pages (training, racing, etc.) are protected at the API level
  const protectedRoutes = ['/training', '/racing', '/inventory', '/gacha'];
  const authRoutes = ['/login', '/register'];
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Redirect unauthenticated users to login
  const isProtected = pathname === '/' || protectedRoutes.some(route => pathname.startsWith(route));
  if (!isAuthenticated && isProtected) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
