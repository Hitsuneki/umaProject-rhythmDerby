import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const DEFAULT_TRAIT = 'all_rounder';
const DEFAULT_COMFORT = 50;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const [rows] = await query(
      `SELECT 
        id,
        name,
        temperament,
        style,
        level,
        speed,
        stamina,
        technique,
        energy,
        max_energy AS maxEnergy,
        created_at AS createdAt
      FROM uma_characters
      WHERE id = ? AND user_id = ?`,
      [id, user.id],
    );

    const uma = (rows as any[])[0];
    if (!uma) {
      return NextResponse.json({ message: 'Uma not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...uma,
      trait: uma.trait_code ?? DEFAULT_TRAIT,
      comfortZone: uma.comfortZone ?? DEFAULT_COMFORT,
      id: String(uma.id),
      createdAt: uma.createdAt ? new Date(uma.createdAt).getTime() : Date.now(),
      lastEnergyUpdate: uma.lastEnergyUpdate ? new Date(uma.lastEnergyUpdate).getTime() : Date.now(),
      copiesOwned: uma.copiesOwned ?? 1,
      bondShards: uma.bondShards ?? 0,
      bondRank: uma.bondRank ?? 0,
      limitBreakLevel: uma.limitBreakLevel ?? 0,
      maxLimitBreak: uma.maxLimitBreak ?? 5,
    });
  } catch (error) {
    console.error('GET /api/uma/[id] error', error);
    return NextResponse.json({ message: 'Failed to fetch Uma' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const allowedFields = [
      'name',
      'temperament',
      'style',
      'level',
      'speed',
      'stamina',
      'technique',
      'energy',
      'maxEnergy',
    ] as const;

    const updates: string[] = [];
    const values: any[] = [];

    allowedFields.forEach((field) => {
      if (field in body) {
        const column = field === 'maxEnergy' ? 'max_energy' : field;
        updates.push(`${column} = ?`);
        values.push(body[field]);
      }
    });

    if (updates.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    values.push(id, user.id);

    await query(`UPDATE uma_characters SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, values);

    return NextResponse.json({ message: 'Updated' });
  } catch (error) {
    console.error('PUT /api/uma/[id] error', error);
    return NextResponse.json({ message: 'Failed to update Uma' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    await query(`DELETE FROM uma_characters WHERE id = ? AND user_id = ?`, [id, user.id]);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE /api/uma/[id] error', error);
    return NextResponse.json({ message: 'Failed to delete Uma' }, { status: 500 });
  }
}

