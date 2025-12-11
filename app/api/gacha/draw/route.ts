import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const SINGLE_PULL_COST = 100;

export async function POST() {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const conn = await getConnection();

    try {
        await conn.beginTransaction();

        // Check user's current balance
        const [userRows]: any = await conn.execute(
            'SELECT currency_balance FROM users WHERE id = ?',
            [user.id]
        );

        if (!userRows || userRows.length === 0) {
            await conn.rollback();
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const currentBalance = userRows[0].currency_balance;

        if (currentBalance < SINGLE_PULL_COST) {
            await conn.rollback();
            return NextResponse.json({
                message: 'Insufficient funds',
                error: 'INSUFFICIENT_FUNDS'
            }, { status: 400 });
        }

        // Deduct coins
        await conn.execute(
            'UPDATE users SET currency_balance = currency_balance - ? WHERE id = ?',
            [SINGLE_PULL_COST, user.id]
        );

        const newBalance = currentBalance - SINGLE_PULL_COST;

        // Get random reward from gacha pool
        const [poolRows]: any = await conn.execute(
            `SELECT id, reward_type, reward_ref_id, rarity, weight 
       FROM gacha_pool`
        );

        if (!poolRows || poolRows.length === 0) {
            await conn.rollback();
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

        // Log to gacha_history
        await conn.execute(
            `INSERT INTO gacha_history (user_id, pool_id, reward_type, reward_ref_id, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
            [user.id, selectedReward.id, selectedReward.reward_type, selectedReward.reward_ref_id]
        );

        // Fetch full reward details based on type
        let rewardDetail: any = null;

        if (selectedReward.reward_type === 'ITEM') {
            // Get item details (items table does NOT have rarity column)
            const [itemRows]: any = await conn.execute(
                'SELECT id, code, name, type, description FROM items WHERE id = ?',
                [selectedReward.reward_ref_id]
            );

            if (itemRows && itemRows.length > 0) {
                const item = itemRows[0];

                // Check if user already has this item
                const [existingItem]: any = await conn.execute(
                    'SELECT id, quantity FROM user_items WHERE user_id = ? AND item_id = ?',
                    [user.id, item.id]
                );

                if (existingItem && existingItem.length > 0) {
                    // Increment quantity
                    await conn.execute(
                        'UPDATE user_items SET quantity = quantity + 1 WHERE user_id = ? AND item_id = ?',
                        [user.id, item.id]
                    );
                } else {
                    // Add new item
                    await conn.execute(
                        'INSERT INTO user_items (user_id, item_id, quantity) VALUES (?, ?, 1)',
                        [user.id, item.id]
                    );
                }

                rewardDetail = {
                    kind: 'ITEM',
                    id: item.id,
                    code: item.code,
                    name: item.name,
                    type: item.type,
                    rarity: selectedReward.rarity, // From gacha_pool, NOT items table
                    description: item.description,
                };
            }
        } else if (selectedReward.reward_type === 'UMA') {
            // Get UMA details (assuming there's a uma_templates or similar table)
            // For now, return basic info
            rewardDetail = {
                kind: 'UMA',
                id: selectedReward.reward_ref_id,
                name: `UMA Character #${selectedReward.reward_ref_id}`,
                rarity: selectedReward.rarity,
            };
        }

        // Fallback if no details found
        if (!rewardDetail) {
            rewardDetail = {
                kind: selectedReward.reward_type,
                id: selectedReward.reward_ref_id,
                name: 'Unknown',
                rarity: selectedReward.rarity,
            };
        }

        await conn.commit();

        return NextResponse.json({
            reward: rewardDetail,
            newBalance,
        });
    } catch (error) {
        await conn.rollback();
        console.error('POST /api/gacha/draw error', error);
        return NextResponse.json({ message: 'Failed to process gacha pull' }, { status: 500 });
    } finally {
        conn.release();
    }
}
