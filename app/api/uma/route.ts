import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const DEMO_USER_ID = 1;

export async function GET() {
  try {
    const [rows] = await query(
      `SELECT 
        id,
        name,
        temperament,
        style,
        trait,
        level,
        speed,
        stamina,
        technique,
        energy,
        max_energy AS maxEnergy,
        comfort_zone AS comfortZone,
        last_energy_update AS lastEnergyUpdate,
        created_at AS createdAt
      FROM uma_characters
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [DEMO_USER_ID],
    );

    const umas = (rows as any[]).map((row) => ({
      ...row,
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
  try {
    const body = await request.json();
    const { name, temperament, style, trait, speed, stamina, technique } = body;

    if (!name || !temperament || !style || !trait) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const level = Number(body.level ?? 1);
    const energy = Number(body.energy ?? 100);
    const maxEnergy = Number(body.maxEnergy ?? 100);
    const comfortZone = Number(body.comfortZone ?? 50);

    const [result]: any = await query(
      `INSERT INTO uma_characters
        (user_id, name, temperament, style, trait, level, speed, stamina, technique, energy, max_energy, comfort_zone, created_at, last_energy_update)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        DEMO_USER_ID,
        name,
        temperament,
        style,
        trait,
        Number(speed ?? 0),
        Number(stamina ?? 0),
        Number(technique ?? 0),
        energy,
        maxEnergy,
        comfortZone,
      ],
    );

    return NextResponse.json(
      {
        id: String(result.insertId),
        name,
        temperament,
        style,
        trait,
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

