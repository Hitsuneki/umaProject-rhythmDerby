import { NextResponse } from 'next/server';
import { getConnection, query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await query(
      `SELECT 
        id,
        uma_id AS umaId,
        session_type AS sessionType,
        quality_pct AS quality,
        speed_delta AS speedDelta,
        stamina_delta AS staminaDelta,
        technique_delta AS techniqueDelta,
        energy_before AS energyBefore,
        energy_after AS energyAfter,
        created_at AS createdAt
      FROM training_sessions
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [user.id],
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET /api/training error', error);
    return NextResponse.json({ message: 'Failed to fetch training history' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const {
    umaId,
    sessionType,
    qualityPct,
    speedDelta = 0,
    staminaDelta = 0,
    techniqueDelta = 0,
    energyBefore,
    energyAfter,
  } = body;

  if (!umaId || !sessionType || typeof qualityPct !== 'number') {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    const [umaRows]: any = await conn.execute(
      `SELECT id, speed, stamina, technique, energy, max_energy AS maxEnergy FROM uma_characters WHERE id = ? AND user_id = ? FOR UPDATE`,
      [umaId, user.id],
    );

    const uma = umaRows[0];
    if (!uma) {
      await conn.rollback();
      return NextResponse.json({ message: 'Uma not found' }, { status: 404 });
    }

    const newSpeed = clamp(Number(uma.speed) + Number(speedDelta), 0, 999);
    const newStamina = clamp(Number(uma.stamina) + Number(staminaDelta), 0, 999);
    const newTechnique = clamp(Number(uma.technique) + Number(techniqueDelta), 0, 999);
    const newEnergy = clamp(Number(energyAfter ?? uma.energy), 0, Number(uma.maxEnergy ?? 100));

    const [insertResult]: any = await conn.execute(
      `INSERT INTO training_sessions
        (user_id, uma_id, session_type, quality_pct, speed_delta, stamina_delta, technique_delta, energy_before, energy_after, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user.id,
        umaId,
        sessionType,
        qualityPct,
        speedDelta,
        staminaDelta,
        techniqueDelta,
        energyBefore ?? uma.energy,
        newEnergy,
      ],
    );

    await conn.execute(
      `UPDATE uma_characters
       SET speed = ?, stamina = ?, technique = ?, energy = ?, last_energy_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [newSpeed, newStamina, newTechnique, newEnergy, umaId, user.id],
    );

    await conn.commit();

    return NextResponse.json({
      message: 'Training saved',
      id: insertResult.insertId,
      quality: qualityPct,
      gains: {
        speed: speedDelta,
        stamina: staminaDelta,
        technique: techniqueDelta,
      },
      uma: {
        id: uma.id,
        speed: newSpeed,
        stamina: newStamina,
        technique: newTechnique,
        energy: newEnergy,
      },
    });
  } catch (error) {
    await conn.rollback();
    console.error('POST /api/training error', error);
    return NextResponse.json({ message: 'Failed to save training session' }, { status: 500 });
  } finally {
    conn.release();
  }
}
