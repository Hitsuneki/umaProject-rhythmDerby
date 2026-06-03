import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Username, email, and password are required.' }, { status: 400 });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    // Check if username already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ message: 'Email or username already exists.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      // Supabase returns an error if email already exists
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ message: 'Registration failed.' }, { status: 500 });
    }

    return NextResponse.json(
      { user: { id: data.user.id, username, email: data.user.email } },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST /api/auth/register error', error);
    return NextResponse.json({ message: 'Registration failed.' }, { status: 500 });
  }
}
