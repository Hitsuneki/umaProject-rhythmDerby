import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await query(
      `SELECT 
        gh.id,
        gh.pool_id AS poolId,
        gh.reward_type AS rewardType,
        gh.reward_ref_id AS rewardId,
        gh.created_at AS timestamp,
        gp.rarity
      FROM gacha_history gh
      JOIN gacha_pool gp ON gp.id = gh.pool_id
      WHERE gh.user_id = ?
      ORDER BY gh.created_at DESC
      LIMIT 100`,
      [user.id]
    );

    const history = (rows as any[]).map((row) => ({
      id: String(row.id),
      rewardType: row.rewardType,
      rewardId: String(row.rewardId),
      rarity: row.rarity,
      timestamp: row.timestamp ? new Date(row.timestamp).getTime() : Date.now(),
    }));

    return NextResponse.json(history);
  } catch (error) {
    console.error('GET /api/gacha-history error', error);
    return NextResponse.json({ message: 'Failed to fetch gacha history' }, { status: 500 });
  }
}
