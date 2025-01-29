import { parseClock } from '../utils/gameUtils';

export const sortGamesByTimeRemaining = (games, sortOption) => {
    return [...games].sort((a, b) => {
        const quarterA = a.quarter || 0;
        const quarterB = b.quarter || 0;
        const clockA = parseClock(a.clock);
        const clockB = parseClock(b.clock);

        if (sortOption === 'least-time') {
            return quarterB - quarterA || clockA - clockB;
        } else {
            return quarterA - quarterB || clockB - clockA;
        }
    });
};