import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Username, email, and password are required.' }, { status: 400 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ message: 'Server misconfigured: missing JWT_SECRET' }, { status: 500 });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    const [existing] = await query(
      `SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1`,
      [email, username],
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json({ message: 'Email or username already exists.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result]: any = await query(
      `INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())`,
      [username, email, passwordHash],
    );

    const token = await createSessionToken(result.insertId);
    const res = NextResponse.json(
      { user: { id: String(result.insertId), username, email } },
      { status: 201 },
    );
    await setSessionCookie(token);
    return res;
  } catch (error) {
    console.error('POST /api/auth/register error', error);
    return NextResponse.json({ message: 'Registration failed.' }, { status: 500 });
  }
}

