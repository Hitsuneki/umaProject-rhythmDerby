import { NextResponse } from 'next/server';
import { getConnection, query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const [raceRows] = await query(
      `SELECT 
        id,
        uma_id AS umaId,
        distance_type AS distanceType,
        start_quality AS startQuality,
        mid_quality AS midQuality,
        final_quality AS finalQuality,
        overall_quality AS overallQuality,
        race_score AS score,
        placement,
        created_at AS createdAt
      FROM races
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [user.id],
    );

    const raceIds = (raceRows as any[]).map((r) => r.id);
    let participantsMap: Record<number, any[]> = {};

    if (raceIds.length > 0) {
      const [participantRows] = await query(
        `SELECT 
          id,
          race_id AS raceId,
          is_player AS isPlayer,
          name,
          speed,
          stamina,
          technique,
          lane_path AS lanePath,
          final_pos AS finalPos
        FROM race_participants
        WHERE race_id IN (${raceIds.map(() => '?').join(',')})`,
        raceIds,
      );

      participantsMap = (participantRows as any[]).reduce((acc, p) => {
        acc[p.raceId] = acc[p.raceId] || [];
        acc[p.raceId].push(p);
        return acc;
      }, {} as Record<number, any[]>);
    }

    const races = (raceRows as any[]).map((race) => ({
      ...race,
      id: String(race.id),
      createdAt: race.createdAt ? new Date(race.createdAt).getTime() : Date.now(),
      participants: participantsMap[race.id] ?? [],
    }));

    return NextResponse.json(races);
  } catch (error) {
    console.error('GET /api/races error', error);
    return NextResponse.json({ message: 'Failed to fetch races' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const {
    umaId,
    distanceType,
    startQuality = 0,
    midQuality = 0,
    finalQuality = 0,
    overallQuality = 0,
    raceScore = 0,
    placement = 4,
    participants = [],
  } = body;

  if (!umaId || !distanceType) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    const [raceResult]: any = await conn.execute(
      `INSERT INTO races
        (user_id, uma_id, distance_type, start_quality, mid_quality, final_quality, overall_quality, race_score, placement, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        user.id,
        umaId,
        distanceType,
        startQuality,
        midQuality,
        finalQuality,
        overallQuality,
        raceScore,
        placement,
      ],
    );

    const raceId = raceResult.insertId;

    if (Array.isArray(participants) && participants.length > 0) {
      const values: any[] = [];
      const placeholders = participants
        .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .join(',');

      participants.forEach((p: any) => {
        values.push(
          raceId,
          p.isPlayer ? 1 : 0,
          p.name ?? '',
          Number(p.speed ?? 0),
          Number(p.stamina ?? 0),
          Number(p.technique ?? 0),
          p.lanePath ?? '',
          Number(p.finalPos ?? 0),
          user.id,
        );
      });

      await conn.execute(
        `INSERT INTO race_participants
          (race_id, is_player, name, speed, stamina, technique, lane_path, final_pos, user_id)
         VALUES ${placeholders}`,
        values,
      );
    }

    await conn.commit();

    return NextResponse.json({ message: 'Race saved', id: raceId }, { status: 201 });
  } catch (error) {
    await conn.rollback();
    console.error('POST /api/races error', error);
    return NextResponse.json({ message: 'Failed to save race' }, { status: 500 });
  } finally {
    conn.release();
  }
}

