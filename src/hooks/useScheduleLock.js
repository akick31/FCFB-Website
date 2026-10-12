import { useEffect, useState } from 'react';
import { isScheduleLocked } from '../api/seasonApi';

const useScheduleLock = (season, enabled = true) => {
    const [status, setStatus] = useState({ season: null, enabled: false, locked: null, error: null });
    const current = status.season === season && status.enabled === enabled;
    const lockStatusKnown = Boolean(enabled && season && current && typeof status.locked === 'boolean');

    useEffect(() => {
        let active = true;
        setStatus({ season, enabled, locked: null, error: null });
        if (enabled && season) {
            isScheduleLocked(season)
                .then((locked) => {
                    if (typeof locked !== 'boolean') {
                        throw new Error('Invalid schedule lock response');
                    }
                    if (active) {
                        setStatus({ season, enabled, locked, error: null });
                    }
                })
                .catch((error) => {
                    if (active) {
                        setStatus({ season, enabled, locked: null, error });
                    }
                });
        }
        return () => {
            active = false;
        };
    }, [season, enabled]);

    const setScheduleLocked = (locked) => {
        setStatus((previous) =>
            previous.season === season && previous.enabled === enabled ? { ...previous, locked, error: null } : previous
        );
    };

    return {
        scheduleLocked: !lockStatusKnown || status.locked,
        lockStatusKnown,
        lockError: current ? status.error : null,
        setScheduleLocked,
    };
};

export default useScheduleLock;
