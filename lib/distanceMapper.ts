/**
 * Maps race distance labels to database ENUM values
 * Database expects: 'SHORT' | 'MID' | 'LONG'
 * Application uses: '1200m' | '1600m' | '2000m' | '2400m'
 */

import type { DistanceType } from '@/types';

export type DatabaseDistanceType = 'SHORT' | 'MID' | 'LONG';

/**
 * Maps distance in meters to database distance type enum
 */
export function mapDistanceToEnum(distanceMeters: number): DatabaseDistanceType {
    if (distanceMeters <= 1000) return 'SHORT';
    if (distanceMeters <= 1800) return 'MID';
    return 'LONG';
}

/**
 * Maps application distance type to database distance type enum
 */
export function mapDistanceTypeToEnum(distanceType: DistanceType): DatabaseDistanceType {
    const distanceMap: Record<DistanceType, DatabaseDistanceType> = {
        '1200m': 'SHORT',
        '1600m': 'MID',
        '2000m': 'MID',
        '2400m': 'LONG',
    };

    return distanceMap[distanceType];
}
