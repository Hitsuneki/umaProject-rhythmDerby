import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('user_items')
      .select('item_id, quantity, items(code, name, description, type)')
      .eq('user_id', user.id);

    if (error) throw error;

    // Map to expected shape for frontend
    const inventory = (data || []).map((row) => ({
      itemId: row.item_id,
      quantity: row.quantity,
      code: (row.items as any)?.code,
      name: (row.items as any)?.name,
      description: (row.items as any)?.description,
      type: (row.items as any)?.type,
    }));

    return NextResponse.json(inventory);
  } catch (err) {
    console.error('GET /api/inventory error', err);
    return NextResponse.json({ message: 'Failed to fetch inventory' }, { status: 500 });
  }
}
