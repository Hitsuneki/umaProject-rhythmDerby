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
            `SELECT id, reward_type, reward_ref_id, rarity, drop_weight 
       FROM gacha_pool 
       WHERE is_active = 1`
        );

        if (!poolRows || poolRows.length === 0) {
            await conn.rollback();
            return NextResponse.json({ message: 'No gacha pool available' }, { status: 500 });
        }

        // Weighted random selection
        const totalWeight = poolRows.reduce((sum: number, item: any) => sum + item.drop_weight, 0);
        let random = Math.random() * totalWeight;

        let selectedReward: any = null;
        for (const item of poolRows) {
            random -= item.drop_weight;
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

        // Process reward based on type
        let rewardName = 'Unknown';

        if (selectedReward.reward_type === 'item') {
            // Check if user already has this item
            const [existingItem]: any = await conn.execute(
                'SELECT quantity FROM user_items WHERE user_id = ? AND item_code = ?',
                [user.id, selectedReward.reward_ref_id]
            );

            if (existingItem && existingItem.length > 0) {
                // Increment quantity
                await conn.execute(
                    'UPDATE user_items SET quantity = quantity + 1 WHERE user_id = ? AND item_code = ?',
                    [user.id, selectedReward.reward_ref_id]
                );
            } else {
                // Add new item
                await conn.execute(
                    'INSERT INTO user_items (user_id, item_code, quantity) VALUES (?, ?, 1)',
                    [user.id, selectedReward.reward_ref_id]
                );
            }

            // Get item name
            const [itemRows]: any = await conn.execute(
                'SELECT name FROM items WHERE code = ?',
                [selectedReward.reward_ref_id]
            );
            if (itemRows && itemRows.length > 0) {
                rewardName = itemRows[0].name;
            }
        } else if (selectedReward.reward_type === 'uma') {
            // For uma rewards, you might want to create a new uma_character
            // This is a simplified version - adjust based on your schema
            rewardName = `Uma Character #${selectedReward.reward_ref_id}`;
        }

        await conn.commit();

        return NextResponse.json({
            reward: {
                id: selectedReward.id,
                rewardType: selectedReward.reward_type,
                rewardId: selectedReward.reward_ref_id,
                rarity: selectedReward.rarity,
                name: rewardName,
            },
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
