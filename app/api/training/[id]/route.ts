import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const DEMO_USER_ID = 1;

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await query(`DELETE FROM training_sessions WHERE id = ? AND user_id = ?`, [params.id, DEMO_USER_ID]);
    return NextResponse.json({ message: 'Training log deleted' });
  } catch (error) {
    console.error('DELETE /api/training/[id] error', error);
    return NextResponse.json({ message: 'Failed to delete training log' }, { status: 500 });
  }
}

