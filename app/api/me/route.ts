import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch full user data including currency_balance
        const [rows]: any = await query(
            'SELECT id, username, email, currency_balance FROM users WHERE id = ?',
            [user.id]
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const userData = rows[0];

        return NextResponse.json({
            id: userData.id,
            username: userData.username,
            email: userData.email,
            currency_balance: userData.currency_balance || 0,
        });
    } catch (error) {
        console.error('GET /api/me error', error);
        return NextResponse.json({ message: 'Failed to fetch user data' }, { status: 500 });
    }
}
