import { useEffect, useState } from 'react';
import { getAllPlaysByGameId, getPlayById } from '../api/playApi';
import { getGameById } from '../api/gameApi';
import { getTeamByName } from '../api/teamApi';
import { getGameStatsByIdAndTeam } from '../api/gameStatsApi.jsx';

const firstOf = (result) => {
    const data = result?.data ?? result;
    return Array.isArray(data) ? data[0] : data;
};

const usePlayDetails = (playId) => {
    const [state, setState] = useState({ loading: true });

    useEffect(() => {
        let active = true;
        setState({ loading: true });
        (async () => {
            try {
                const play = await getPlayById(playId);
                const game = await getGameById(play.game_id);
                const [plays, awayTeam, homeTeam, awayStats, homeStats] = await Promise.all([
                    getAllPlaysByGameId(play.game_id).catch(() => []),
                    getTeamByName(game.away_team).catch(() => null),
                    getTeamByName(game.home_team).catch(() => null),
                    getGameStatsByIdAndTeam(play.game_id, game.away_team).catch(() => null),
                    getGameStatsByIdAndTeam(play.game_id, game.home_team).catch(() => null),
                ]);
                if (active) {
                    setState({
                        loading: false,
                        play,
                        game,
                        plays: Array.isArray(plays) ? plays : [],
                        awayTeam,
                        homeTeam,
                        awayStats: firstOf(awayStats),
                        homeStats: firstOf(homeStats),
                    });
                }
            } catch {
                if (active) {
                    setState({ loading: false, error: 'Play not found.' });
                }
            }
        })();
        return () => {
            active = false;
        };
    }, [playId]);

    return state;
};

export default usePlayDetails;
