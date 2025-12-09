import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const umaId = searchParams.get('uma_id');

    let sql = `
      SELECT 
        id,
        uma_id AS umaId,
        session_type AS sessionType,
        quality_pct AS quality,
        speed_delta AS speedGain,
        stamina_delta AS staminaGain,
        technique_delta AS techniqueGain,
        energy_before AS energyBefore,
        energy_after AS energyAfter,
        created_at AS timestamp
      FROM training_sessions
      WHERE user_id = ?
    `;
    
    const params: any[] = [user.id];

    if (umaId) {
      sql += ' AND uma_id = ?';
      params.push(umaId);
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const [rows] = await query(sql, params);

    const sessions = (rows as any[]).map((row) => ({
      id: String(row.id),
      umaId: String(row.umaId),
      sessionType: row.sessionType,
      quality: row.quality,
      statGains: {
        speed: row.speedGain || 0,
        stamina: row.staminaGain || 0,
        technique: row.techniqueGain || 0,
      },
      timestamp: row.timestamp ? new Date(row.timestamp).getTime() : Date.now(),
    }));

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('GET /api/training-sessions error', error);
    return NextResponse.json({ message: 'Failed to fetch training sessions' }, { status: 500 });
  }
}
