import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

const DEMO_USER_ID = 1;

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    await conn.execute(`DELETE FROM race_participants WHERE race_id = ?`, [params.id]);
    await conn.execute(`DELETE FROM races WHERE id = ? AND user_id = ?`, [params.id, DEMO_USER_ID]);

    await conn.commit();
    return NextResponse.json({ message: 'Race deleted' });
  } catch (error) {
    await conn.rollback();
    console.error('DELETE /api/races/[id] error', error);
    return NextResponse.json({ message: 'Failed to delete race' }, { status: 500 });
  } finally {
    conn.release();
  }
}

