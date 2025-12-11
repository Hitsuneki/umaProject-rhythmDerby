import { NextResponse } from 'next/server';
import { getConnection, query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const [raceRows] = await query(
      `SELECT 
        r.id,
        r.uma_id AS umaId,
        r.distance_type AS distanceType,
        r.start_time AS startTime,
        r.end_time AS endTime,
        r.start_quality AS startQuality,
        r.mid_quality AS midQuality,
        r.final_quality AS finalQuality,
        r.overall_quality AS overallQuality,
        r.race_score AS score,
        r.placement,
        uc.name AS umaName,
        uc.style AS umaStyle
      FROM races r
      LEFT JOIN uma_characters uc ON uc.id = r.uma_id
      WHERE r.user_id = ?
      ORDER BY r.start_time DESC`,
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
      createdAt: race.startTime ? new Date(race.startTime).getTime() : Date.now(),
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
    startTime,
    endTime,
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

  // Validate distanceType matches database ENUM
  const validDistanceTypes = ['SHORT', 'MID', 'LONG'];
  if (!validDistanceTypes.includes(distanceType)) {
    return NextResponse.json({
      message: `Invalid distance type. Must be one of: ${validDistanceTypes.join(', ')}`
    }, { status: 400 });
  }

  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    const formattedStartTime = startTime ? new Date(startTime) : new Date();
    const formattedEndTime = endTime ? new Date(endTime) : new Date();

    const [raceResult]: any = await conn.execute(
      `INSERT INTO races
        (user_id, uma_id, distance_type, start_time, end_time, start_quality, mid_quality, final_quality, overall_quality, race_score, placement)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        umaId,
        distanceType,
        formattedStartTime,
        formattedEndTime,
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
        .map(() => '(?, ?, ?, ?, ?, ?, ?, ?)')
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
          Number(p.finalPos ?? 0)
        );
      });

      await conn.execute(
        `INSERT INTO race_participants
          (race_id, is_player, name, speed, stamina, technique, lane_path, final_pos)
         VALUES ${placeholders}`,
        values,
      );
    }

    // Calculate coin reward based on placement
    const getRaceCoinReward = (placement: number): number => {
      if (placement === 1) return 200;  // 1st place
      if (placement === 2) return 100;  // 2nd place
      if (placement === 3) return 50;   // 3rd place
      return 20; // participation
    };

    const rewardCoins = getRaceCoinReward(placement);

    // Update user's currency balance
    await conn.execute(
      'UPDATE users SET currency_balance = currency_balance + ? WHERE id = ?',
      [rewardCoins, user.id]
    );

    await conn.commit();

    return NextResponse.json({
      message: 'Race saved',
      id: raceId,
      rewardCoins
    }, { status: 201 });
  } catch (error) {
    await conn.rollback();
    console.error('POST /api/races error', error);
    return NextResponse.json({ message: 'Failed to save race' }, { status: 500 });
  } finally {
    conn.release();
  }
}

