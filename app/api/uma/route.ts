import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

const DEFAULT_TRAIT = 'all_rounder';
const DEFAULT_COMFORT = 50;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createClient();
    const { data: rows, error } = await supabase
      .from('uma_characters')
      .select('id, name, temperament, style, trait_code, level, speed, stamina, technique, energy, max_energy, created_at, last_energy_at')
      .eq('user_id', user.id)
      .eq('is_retired', false)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const umas = (rows || []).map((row) => ({
      ...row,
      trait: row.trait_code ?? DEFAULT_TRAIT,
      comfortZone: DEFAULT_COMFORT, // Field not in DB but required by UI
      id: String(row.id),
      maxEnergy: row.max_energy,
      createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      lastEnergyUpdate: row.last_energy_at
        ? new Date(row.last_energy_at).getTime()
        : Date.now(),
      // Defaults for fields removed in schema but expected by frontend
      copiesOwned: 1,
      bondShards: 0,
      bondRank: 0,
      limitBreakLevel: 0,
      maxLimitBreak: 5,
    }));

    return NextResponse.json(umas);
  } catch (error) {
    console.error('GET /api/uma error', error);
    return NextResponse.json({ message: 'Failed to fetch characters' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    console.log('CREATE UMA BODY:', body);

    const { name, temperament, style, trait, speed, stamina, technique } = body;

    if (!name || !temperament || !style) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    type UmaStyle = 'Front' | 'Mid' | 'Back';
    const allowedStyles: UmaStyle[] = ['Front', 'Mid', 'Back'];
    const allowedTemps = ['calm', 'energetic', 'stubborn', 'gentle'];

    const styleMap: Record<string, UmaStyle> = {
      runner: 'Front',
      pacemaker: 'Front',
      front: 'Front',
      leader: 'Mid',
      chaser: 'Mid',
      stalker: 'Mid',
      normal: 'Mid',
      mid: 'Mid',
      closer: 'Back',
      last: 'Back',
      back: 'Back',
    };

    const level = Number(body.level ?? 1);
    const energy = Number(body.energy ?? 100);
    const maxEnergy = Number(body.maxEnergy ?? 100);
    const comfortZone = Number(body.comfortZone ?? DEFAULT_COMFORT);
    const safeTrait = trait ?? DEFAULT_TRAIT;
    const mappedStyle = styleMap[String(style).toLowerCase()] ?? null;
    const safeStyle: UmaStyle | null =
      mappedStyle && allowedStyles.includes(mappedStyle) ? mappedStyle : null;
    const safeTemperament = allowedTemps.includes(temperament) ? temperament : 'calm';

    if (!safeStyle) {
      console.warn('INVALID STYLE:', style);
      return NextResponse.json({ message: 'Invalid style' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: result, error } = await supabase
      .from('uma_characters')
      .insert({
        user_id: user.id,
        name,
        temperament: safeTemperament,
        style: safeStyle,
        trait_code: safeTrait,
        level: level,
        exp: 0,
        speed: Number(speed ?? 0),
        stamina: Number(stamina ?? 0),
        technique: Number(technique ?? 0),
        energy,
        max_energy: maxEnergy,
        is_retired: false,
      })
      .select('id, created_at, last_energy_at')
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        id: String(result.id),
        name,
        temperament: safeTemperament,
        style,
        trait: safeTrait,
        level,
        speed: Number(speed ?? 0),
        stamina: Number(stamina ?? 0),
        technique: Number(technique ?? 0),
        energy,
        maxEnergy,
        comfortZone,
        createdAt: result.created_at ? new Date(result.created_at).getTime() : Date.now(),
        lastEnergyUpdate: result.last_energy_at ? new Date(result.last_energy_at).getTime() : Date.now(),
        copiesOwned: 1,
        bondShards: 0,
        bondRank: 0,
        limitBreakLevel: 0,
        maxLimitBreak: 5,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST /api/uma error', error);
    return NextResponse.json({ message: 'Failed to create character' }, { status: 500 });
  }
}
