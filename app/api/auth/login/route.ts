import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { createSessionToken, setSessionCookie, clearSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: 'Email/username and password are required.' }, { status: 400 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ message: 'Server misconfigured: missing JWT_SECRET' }, { status: 500 });
    }

    const [rows] = await query(
      `SELECT id, username, email, password_hash AS passwordHash FROM users WHERE email = ? OR username = ? LIMIT 1`,
      [identifier, identifier],
    );

    const user = (rows as any[])[0];
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ message: 'Invalid password.' }, { status: 401 });
    }

    const token = await createSessionToken(user.id);
    const res = NextResponse.json({
      user: { id: String(user.id), username: user.username, email: user.email },
    });
    await setSessionCookie(token);
    return res;
  } catch (error) {
    console.error('POST /api/auth/login error', error);
    return NextResponse.json({ message: 'Login failed.' }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ message: 'Logged out' });
}

