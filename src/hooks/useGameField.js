import { useEffect, useState } from 'react';
import { getGameField } from '../api/stadiumApi';

export const useGameField = (gameId) => {
    const [field, setField] = useState(null);

    useEffect(() => {
        let active = true;
        setField(null);
        if (gameId != null) {
            getGameField(gameId)
                .then((loaded) => active && setField(loaded))
                .catch(() => {});
        }
        return () => {
            active = false;
        };
    }, [gameId]);

    return field;
};
