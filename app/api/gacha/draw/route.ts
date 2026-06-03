import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

const SINGLE_PULL_COST = 100;

export async function POST() {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = await createClient();

        // 1. Check user's current balance
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('currency_balance')
            .eq('id', user.id)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const currentBalance = userData.currency_balance;

        if (currentBalance < SINGLE_PULL_COST) {
            return NextResponse.json({
                message: 'Insufficient funds',
                error: 'INSUFFICIENT_FUNDS'
            }, { status: 400 });
        }

        const newBalance = currentBalance - SINGLE_PULL_COST;

        // 2. Deduct coins (Optimistic update, subject to race condition without RPC, but acceptable for this migration scope)
        const { error: updateError } = await supabase
            .from('users')
            .update({ currency_balance: newBalance })
            .eq('id', user.id);

        if (updateError) throw updateError;

        // 3. Get random reward from gacha pool
        const { data: poolRows, error: poolError } = await supabase
            .from('gacha_pool')
            .select('id, reward_type, reward_ref_id, rarity, weight');

        if (poolError || !poolRows || poolRows.length === 0) {
            // Refund if pool fails
            await supabase.from('users').update({ currency_balance: currentBalance }).eq('id', user.id);
            return NextResponse.json({ message: 'No gacha pool available' }, { status: 500 });
        }

        // Weighted random selection
        const totalWeight = poolRows.reduce((sum: number, item: any) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        let selectedReward: any = null;
        for (const item of poolRows) {
            random -= item.weight;
            if (random <= 0) {
                selectedReward = item;
                break;
            }
        }

        if (!selectedReward) {
            selectedReward = poolRows[0]; // Fallback
        }

        // 4. Log to gacha_history
        await supabase
            .from('gacha_history')
            .insert({
                user_id: user.id,
                pool_id: selectedReward.id,
                reward_type: selectedReward.reward_type,
                reward_ref_id: selectedReward.reward_ref_id
            });

        // 5. Fetch full reward details and grant item
        let rewardDetail: any = null;

        if (selectedReward.reward_type === 'ITEM') {
            const { data: itemData } = await supabase
                .from('items')
                .select('id, code, name, type, description')
                .eq('id', selectedReward.reward_ref_id)
                .single();

            if (itemData) {
                // Upsert user item
                const { data: existingItem } = await supabase
                    .from('user_items')
                    .select('id, quantity')
                    .eq('user_id', user.id)
                    .eq('item_id', itemData.id)
                    .maybeSingle();

                if (existingItem) {
                    await supabase
                        .from('user_items')
                        .update({ quantity: existingItem.quantity + 1 })
                        .eq('id', existingItem.id);
                } else {
                    await supabase
                        .from('user_items')
                        .insert({
                            user_id: user.id,
                            item_id: itemData.id,
                            quantity: 1
                        });
                }

                rewardDetail = {
                    kind: 'ITEM',
                    id: itemData.id,
                    code: itemData.code,
                    name: itemData.name,
                    type: itemData.type,
                    rarity: selectedReward.rarity, // From gacha_pool
                    description: itemData.description,
                };
            }
        } else if (selectedReward.reward_type === 'UMA') {
            rewardDetail = {
                kind: 'UMA',
                id: selectedReward.reward_ref_id,
                name: `UMA Character #${selectedReward.reward_ref_id}`,
                rarity: selectedReward.rarity,
            };
        }

        if (!rewardDetail) {
            rewardDetail = {
                kind: selectedReward.reward_type,
                id: selectedReward.reward_ref_id,
                name: 'Unknown',
                rarity: selectedReward.rarity,
            };
        }

        return NextResponse.json({
            reward: rewardDetail,
            newBalance,
        });
    } catch (error) {
        console.error('POST /api/gacha/draw error', error);
        return NextResponse.json({ message: 'Failed to process gacha pull' }, { status: 500 });
    }
}

