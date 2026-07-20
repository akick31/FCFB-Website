import { useState, useEffect } from 'react';
import { getCurrentOffseason } from '../../../../api/offseasonApi';

export const useOffseasonStatus = () => {
    const [isOffseason, setIsOffseason] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        getCurrentOffseason()
            .then((offseason) => {
                if (!cancelled) setIsOffseason(!!offseason?.start_date);
            })
            .catch(() => {
                if (!cancelled) setIsOffseason(false);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return { isOffseason, loading };
};
