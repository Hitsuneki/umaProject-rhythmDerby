import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
  }

  // Initialize Supabase client with cookie handling
  const cookieStore = await cookies();
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json({ message: error?.message || 'Invalid credentials' }, { status: 401 });
  }

  // Fetch the public profile for username
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('username')
    .eq('id', data.user.id)
    .single();

  const responseBody = {
    user: {
      id: data.user.id,
      username: profile?.username || data.user.user_metadata?.username,
      email: data.user.email,
    },
  };

  // Return the response using the Supabase‑aware NextResponse so cookies are set
  return supabaseResponse.json(responseBody);
}

export async function DELETE() {
  // Sign out via Supabase and clear cookies
  const cookieStore = await cookies();
  let supabaseResponse = NextResponse.next({
    request: { headers: {} },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
          supabaseResponse = NextResponse.next({ request: {} });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.signOut();
  return supabaseResponse.json({ message: 'Logged out' });
}
