import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from('training_sessions')
      .select(`
        id,
        uma_id,
        session_type,
        quality_pct,
        speed_delta,
        stamina_delta,
        technique_delta,
        energy_before,
        energy_after,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mappedRows = (rows || []).map((row) => ({
      id: row.id,
      umaId: row.uma_id,
      sessionType: row.session_type,
      quality: row.quality_pct,
      speedDelta: row.speed_delta,
      staminaDelta: row.stamina_delta,
      techniqueDelta: row.technique_delta,
      energyBefore: row.energy_before,
      energyAfter: row.energy_after,
      createdAt: row.created_at,
    }));

    return NextResponse.json(mappedRows);
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

  try {
    const supabase = await createClient();

    // Fetch the current stats of the Uma
    const { data: uma, error: fetchError } = await supabase
      .from('uma_characters')
      .select('id, speed, stamina, technique, energy, max_energy')
      .eq('id', Number(umaId))
      .eq('user_id', user.id)
      .single();

    if (fetchError || !uma) {
      return NextResponse.json({ message: 'Uma not found' }, { status: 404 });
    }

    const newSpeed = clamp(Number(uma.speed) + Number(speedDelta), 0, 999);
    const newStamina = clamp(Number(uma.stamina) + Number(staminaDelta), 0, 999);
    const newTechnique = clamp(Number(uma.technique) + Number(techniqueDelta), 0, 999);
    const newEnergy = clamp(Number(energyAfter ?? uma.energy), 0, Number(uma.max_energy ?? 100));

    // Update the Uma
    const { error: updateError } = await supabase
      .from('uma_characters')
      .update({
        speed: newSpeed,
        stamina: newStamina,
        technique: newTechnique,
        energy: newEnergy,
        last_energy_at: new Date().toISOString(),
      })
      .eq('id', Number(umaId))
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    // Insert the training session
    const { data: insertResult, error: insertError } = await supabase
      .from('training_sessions')
      .insert({
        user_id: user.id,
        uma_id: Number(umaId),
        session_type: sessionType.toUpperCase(),
        quality_pct: qualityPct,
        speed_delta: speedDelta,
        stamina_delta: staminaDelta,
        technique_delta: techniqueDelta,
        energy_before: energyBefore ?? uma.energy,
        energy_after: newEnergy,
      })
      .select('id')
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      message: 'Training saved',
      id: insertResult.id,
      quality: qualityPct,
      gains: {
        speed: speedDelta,
        stamina: staminaDelta,
        technique: techniqueDelta,
      },
      uma: {
        id: String(uma.id),
        speed: newSpeed,
        stamina: newStamina,
        technique: newTechnique,
        energy: newEnergy,
      },
    });
  } catch (error) {
    console.error('POST /api/training error', error);
    return NextResponse.json({ message: 'Failed to save training session' }, { status: 500 });
  }
}
