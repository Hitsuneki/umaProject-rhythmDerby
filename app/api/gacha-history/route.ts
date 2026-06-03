import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from('gacha_history')
      .select('id, pool_id, reward_type, reward_ref_id, created_at, gacha_pool(rarity)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const history = (rows || []).map((row) => ({
      id: String(row.id),
      rewardType: row.reward_type,
      rewardId: String(row.reward_ref_id),
      rarity: (row.gacha_pool as any)?.rarity,
      timestamp: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    }));

    return NextResponse.json(history);
  } catch (error) {
    console.error('GET /api/gacha-history error', error);
    return NextResponse.json({ message: 'Failed to fetch gacha history' }, { status: 500 });
  }
}
