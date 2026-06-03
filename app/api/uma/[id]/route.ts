import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

const DEFAULT_TRAIT = 'all_rounder';
const DEFAULT_COMFORT = 50;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('uma_characters')
      .select(`*, trait_code, comfort_zone`)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    if (error) throw error;
    if (!data) return NextResponse.json({ message: 'Uma not found' }, { status: 404 });

    const uma = {
      ...data,
      trait: data.trait_code ?? DEFAULT_TRAIT,
      comfortZone: data.comfort_zone ?? DEFAULT_COMFORT,
      id: String(data.id),
      createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
      lastEnergyUpdate: data.last_energy_at ? new Date(data.last_energy_at).getTime() : Date.now(),
      copiesOwned: data.copies_owned ?? 1,
      bondShards: data.bond_shards ?? 0,
      bondRank: data.bond_rank ?? 0,
      limitBreakLevel: data.limit_break_level ?? 0,
      maxLimitBreak: data.max_limit_break ?? 5,
    };
    return NextResponse.json(uma);
  } catch (err) {
    console.error('GET /api/uma/[id] error', err);
    return NextResponse.json({ message: 'Failed to fetch Uma' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const allowedFields = [
    'name', 'temperament', 'style', 'level', 'speed', 'stamina', 'technique',
    'energy', 'max_energy', 'comfort_zone', 'trait_code'
  ];
  const updates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
  }
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('uma_characters')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
    return NextResponse.json({ message: 'Updated' });
  } catch (err) {
    console.error('PUT /api/uma/[id] error', err);
    return NextResponse.json({ message: 'Failed to update Uma' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('uma_characters')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) throw error;
    return NextResponse.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE /api/uma/[id] error', err);
    return NextResponse.json({ message: 'Failed to delete Uma' }, { status: 500 });
  }
}
