import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const umaId = searchParams.get('uma_id');

    const supabase = await createClient();
    let query = supabase
      .from('training_sessions')
      .select('id, uma_id, session_type, quality_pct, speed_delta, stamina_delta, technique_delta, energy_before, energy_after, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (umaId) {
      query = query.eq('uma_id', Number(umaId));
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    const sessions = (rows || []).map((row) => ({
      id: String(row.id),
      umaId: String(row.uma_id),
      sessionType: row.session_type,
      quality: row.quality_pct,
      statGains: {
        speed: row.speed_delta || 0,
        stamina: row.stamina_delta || 0,
        technique: row.technique_delta || 0,
      },
      timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    }));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('GET /api/training-sessions error', error);
    return NextResponse.json({ message: 'Failed to fetch training sessions' }, { status: 500 });
  }
}
