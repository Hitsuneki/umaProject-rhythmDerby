import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const DEFAULT_TRAIT = 'all_rounder';
const DEFAULT_COMFORT = 50;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await query(
      `SELECT 
        id,
        name,
        temperament,
        style,
        trait_code,
        level,
        speed,
        stamina,
        technique,
        energy,
        max_energy AS maxEnergy,
        created_at AS createdAt
      FROM uma_characters
      WHERE user_id = ? AND is_retired = 0
      ORDER BY created_at ASC`,
      [user.id],
    );

    const umas = (rows as any[]).map((row) => ({
      ...row,
      trait: row.trait_code ?? DEFAULT_TRAIT,
      comfortZone: row.comfortZone ?? DEFAULT_COMFORT,
      id: String(row.id),
      createdAt: row.createdAt ? new Date(row.createdAt).getTime() : Date.now(),
      lastEnergyUpdate: row.lastEnergyUpdate
        ? new Date(row.lastEnergyUpdate).getTime()
        : Date.now(),
      copiesOwned: row.copiesOwned ?? 1,
      bondShards: row.bondShards ?? 0,
      bondRank: row.bondRank ?? 0,
      limitBreakLevel: row.limitBreakLevel ?? 0,
      maxLimitBreak: row.maxLimitBreak ?? 5,
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
    // Log request body for debugging (avoid leaking secrets; this is controlled input)
    console.log('CREATE UMA BODY:', body);

    const { name, temperament, style, trait, speed, stamina, technique } = body;

    if (!name || !temperament || !style) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    type UmaStyle = 'Front' | 'Mid' | 'Back';
    const allowedStyles: UmaStyle[] = ['Front', 'Mid', 'Back'];
    const allowedTemps = ['calm', 'energetic', 'stubborn', 'gentle'];

    // Map UI labels to DB enum values
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

    const [result]: any = await query(
      `INSERT INTO uma_characters
        (user_id, name, temperament, style, trait_code, level, exp, speed, stamina, technique, energy, max_energy, last_energy_at, is_retired, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0, NOW())`,
      [
        user.id,
        name,
        safeTemperament,
        safeStyle,
        safeTrait,
        Number(level ?? 1),
        0, // exp
        Number(speed ?? 0),
        Number(stamina ?? 0),
        Number(technique ?? 0),
        energy,
        maxEnergy,
      ],
    );

    return NextResponse.json(
      {
        id: String(result.insertId),
        name,
        temperament,
        style,
        trait: safeTrait,
        level,
        speed: Number(speed ?? 0),
        stamina: Number(stamina ?? 0),
        technique: Number(technique ?? 0),
        energy,
        maxEnergy,
        comfortZone,
        createdAt: Date.now(),
        lastEnergyUpdate: Date.now(),
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

