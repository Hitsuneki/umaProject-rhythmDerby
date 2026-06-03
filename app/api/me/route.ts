import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, currency_balance')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      username: data.username,
      email: data.email,
      currency_balance: data.currency_balance ?? 0,
    });
  } catch (err) {
    console.error('GET /api/me error', err);
    return NextResponse.json({ message: 'Failed to fetch user data' }, { status: 500 });
  }
}
