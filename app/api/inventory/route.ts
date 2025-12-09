import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const [rows] = await query(
      `SELECT 
        ui.id,
        ui.item_id AS itemId,
        ui.quantity,
        i.code,
        i.name,
        i.description,
        i.type
      FROM user_items ui
      JOIN items i ON i.id = ui.item_id
      WHERE ui.user_id = ?
      ORDER BY i.type, i.name`,
      [user.id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET /api/inventory error', error);
    return NextResponse.json({ message: 'Failed to fetch inventory' }, { status: 500 });
  }
}
