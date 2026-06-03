import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('training_sessions')
      .delete()
      .eq('id', Number(id))
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Training log deleted' });
  } catch (error) {
    console.error('DELETE /api/training/[id] error', error);
    return NextResponse.json({ message: 'Failed to delete training log' }, { status: 500 });
  }
}
