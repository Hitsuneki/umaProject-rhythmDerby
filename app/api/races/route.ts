import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Helper to group participants by race_id
function groupParticipants(participants: any[]) {
  return participants.reduce((acc: Record<number, any[]>, p) => {
    const rid = p.race_id;
    if (!acc[rid]) acc[rid] = [];
    acc[rid].push(p);
    return acc;
  }, {});
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createClient();
    // Fetch races belonging to the user along with basic UMA info
    const { data: raceRows, error: raceError } = await supabase
      .from('races')
      .select(`id,uma_id,distance_type,start_time,end_time,start_quality,mid_quality,final_quality,overall_quality,race_score,placement,uma_characters(name,style)`, { head: false })
      .eq('user_id', user.id)
      .order('start_time', { ascending: false });
    if (raceError) throw raceError;
    if (!raceRows) return NextResponse.json([]);

    const raceIds = (raceRows as any[]).map((r) => r.id);
    let participantsMap: Record<number, any[]> = {};

    if (raceIds.length > 0) {
      const { data: participantRows, error: partError } = await supabase
        .from('race_participants')
        .select('id,race_id,is_player,name,speed,stamina,technique,lane_path,final_pos')
        .in('race_id', raceIds as any);
      if (partError) throw partError;
      participantsMap = groupParticipants(participantRows as any[]);
    }

    const races = (raceRows as any[]).map((race) => ({
      ...race,
      id: String(race.id),
      createdAt: race.start_time ? new Date(race.start_time).getTime() : Date.now(),
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

  const validDistanceTypes = ['SHORT', 'MID', 'LONG'];
  if (!validDistanceTypes.includes(distanceType)) {
    return NextResponse.json({ message: `Invalid distance type. Must be one of: ${validDistanceTypes.join(', ')}` }, { status: 400 });
  }

  const formattedStartTime = startTime ? new Date(startTime) : new Date();
  const formattedEndTime = endTime ? new Date(endTime) : new Date();

  try {
    const supabase = await createClient();
    // Insert race
    const { data: raceData, error: raceError } = await supabase
      .from('races')
      .insert([
        {
          user_id: user.id,
          uma_id: umaId,
          distance_type: distanceType,
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          start_quality: startQuality,
          mid_quality: midQuality,
          final_quality: finalQuality,
          overall_quality: overallQuality,
          race_score: raceScore,
          placement,
        },
      ])
      .select('id')
      .single();
    if (raceError) throw raceError;
    const raceId = (raceData as any).id;

    // Insert participants if any
    if (Array.isArray(participants) && participants.length > 0) {
      const participantRows = participants.map((p: any) => ({
        race_id: raceId,
        is_player: p.isPlayer ? true : false,
        name: p.name ?? '',
        speed: Number(p.speed ?? 0),
        stamina: Number(p.stamina ?? 0),
        technique: Number(p.technique ?? 0),
        lane_path: p.lanePath ?? '',
        final_pos: Number(p.finalPos ?? 0),
      }));
      const { error: partError } = await supabase.from('race_participants').insert(participantRows);
      if (partError) throw partError;
    }

    // Determine reward coins based on placement
    const getRaceCoinReward = (placement: number): number => {
      if (placement === 1) return 200;
      if (placement === 2) return 100;
      if (placement === 3) return 50;
      return 20;
    };
    const rewardCoins = getRaceCoinReward(placement);

    // Update user's currency balance (read-modify-write)
    const { data: userData, error: userFetchError } = await supabase.from('users').select('currency_balance').eq('id', user.id).single();
    if (userFetchError) throw userFetchError;
    const newBalance = (userData as any).currency_balance + rewardCoins;
    const { error: balanceError } = await supabase.from('users').update({ currency_balance: newBalance }).eq('id', user.id);
    if (balanceError) throw balanceError;

    return NextResponse.json({ message: 'Race saved', id: raceId, rewardCoins }, { status: 201 });
  } catch (error) {
    console.error('POST /api/races error', error);
    return NextResponse.json({ message: 'Failed to save race' }, { status: 500 });
  }
}

