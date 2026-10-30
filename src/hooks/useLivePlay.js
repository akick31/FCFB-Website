import { useEffect, useState } from 'react';
import { getPreviousPlay } from '../api/playApi';

const useLivePlay = (game, ongoing) => {
    const [play, setPlay] = useState(null);
    useEffect(() => {
        if (!game?.game_id || !ongoing) {
            setPlay(null);
            return undefined;
        }
        let active = true;
        getPreviousPlay(game.game_id)
            .then((next) => {
                if (active) {
                    setPlay({ gameId: game.game_id, value: next });
                }
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, [game?.game_id, ongoing, game?.home_score, game?.away_score]);
    return ongoing && play && play.gameId === game?.game_id ? play.value : null;
};

export default useLivePlay;
