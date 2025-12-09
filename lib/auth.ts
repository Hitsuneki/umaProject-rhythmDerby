import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { query } from './db';

const SESSION_COOKIE = 'uma_session';
const SESSION_TTL = '7d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET in environment');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(userId: number | string) {
  const secret = getJwtSecret();
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(SESSION_TTL)
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload.sub ? String(payload.sub) : null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUserId(request?: Request): Promise<string | null> {
  // Prefer Next.js cookies helper when available
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (token) {
      return verifySessionToken(token);
    }
  } catch {
    // fall through to manual parsing
  }

  if (request) {
    const cookieHeader = request.headers.get('cookie') || '';
    const token = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
      ?.split('=')[1];
    if (token) {
      return verifySessionToken(token);
    }
  }

  return null;
}

/**
 * getCurrentUser
 * - Uses the session token (via Next cookies or an optional Request) to determine the user id
 * - Returns user object { id, username, email } or null
 */
export async function getCurrentUser(request?: Request): Promise<{ id: string; username?: string; email?: string } | null> {
  const userId = await getCurrentUserId(request);
  if (!userId) return null;

  try {
    const [rows] = await query('SELECT id, username, email FROM users WHERE id = ?', [userId]);
    const users = rows as any[];
    if (users.length === 0) return null;
    const user = users[0];
    return {
      id: String(user.id),
      username: user.username ?? undefined,
      email: user.email ?? undefined,
    };
  } catch (err) {
    // Log the error server-side; don't throw so callers get null on failure
    // (This prevents build-time issues and keeps runtime routes robust)
    // eslint-disable-next-line no-console
    console.error('getCurrentUser error:', err);
    return null;
  }
}