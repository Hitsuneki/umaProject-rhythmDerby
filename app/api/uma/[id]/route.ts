import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const DEMO_USER_ID = 1;

export async function GET(_request: Request, { params }: { params: { id: string } }) {
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
      WHERE id = ? AND user_id = ?`,
      [params.id, DEMO_USER_ID],
    );

    const uma = (rows as any[])[0];
    if (!uma) {
      return NextResponse.json({ message: 'Uma not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...uma,
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const allowedFields = [
      'name',
      'temperament',
      'style',
      'trait',
      'level',
      'speed',
      'stamina',
      'technique',
      'energy',
      'maxEnergy',
      'comfortZone',
    ] as const;

    const updates: string[] = [];
    const values: any[] = [];

    allowedFields.forEach((field) => {
      if (field in body) {
        const column = field === 'maxEnergy' ? 'max_energy' : field === 'comfortZone' ? 'comfort_zone' : field;
        updates.push(`${column} = ?`);
        values.push(body[field]);
      }
    });

    if (updates.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    values.push(params.id, DEMO_USER_ID);

    await query(`UPDATE uma_characters SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, values);

    return NextResponse.json({ message: 'Updated' });
  } catch (error) {
    console.error('PUT /api/uma/[id] error', error);
    return NextResponse.json({ message: 'Failed to update Uma' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await query(`DELETE FROM uma_characters WHERE id = ? AND user_id = ?`, [params.id, DEMO_USER_ID]);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('DELETE /api/uma/[id] error', error);
    return NextResponse.json({ message: 'Failed to delete Uma' }, { status: 500 });
  }
}

