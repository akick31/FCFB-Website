import { useEffect, useState } from 'react';
import { getCurrentSeason, getCurrentWeek } from '../api/seasonApi';
import { getHistoryWeek } from '../api/historyApi';

const REFRESH_MS = 120000;

const weekNumber = (raw) =>
    typeof raw === 'number' ? raw : (raw?.week ?? raw?.current_week ?? raw?.currentWeek ?? null);

const useAroundFcfb = () => {
    const [week, setWeek] = useState(null);

    useEffect(() => {
        let active = true;
        const load = async () => {
            const [season, rawWeek] = await Promise.all([
                getCurrentSeason().catch(() => null),
                getCurrentWeek().catch(() => null),
            ]);
            const current = weekNumber(rawWeek);
            if (!season || current == null) {
                return;
            }
            const loaded = await getHistoryWeek(season, current).catch(() => null);
            if (active && loaded) {
                setWeek(loaded);
            }
        };
        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => {
            active = false;
            clearInterval(timer);
        };
    }, []);

    return week;
};

export default useAroundFcfb;
