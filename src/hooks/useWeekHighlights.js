import { useEffect, useState } from 'react';
import { getFilteredGames } from '../api/gameApi';
import { getRankings, getRankingWeeks } from '../api/rankingApi';
import { getScheduleBySeasonAndWeek } from '../api/scheduleApi';
import { getCurrentWeek } from '../api/seasonApi';
import { getEloHistory } from '../api/eloHistoryApi.jsx';
import { getHistoryWeek } from '../api/historyApi';
import { withScores } from '../utils/weekHistory';
import { eloMovers, marqueeGames, pollMovers } from '../utils/homeHighlights';

const WEEK_SIZE = 100;

const loadPolls = async (season, isActive) => {
    const weeks = await getRankingWeeks(season, 'COACHES_POLL').catch(() => []);
    if (!isActive() || !weeks.length) {
        return { current: [], previous: [] };
    }
    const sorted = [...weeks].sort((a, b) => b - a);
    const [current, previous] = await Promise.all([
        getRankings(season, sorted[0], 'COACHES_POLL').catch(() => []),
        sorted[1] != null ? getRankings(season, sorted[1], 'COACHES_POLL').catch(() => []) : [],
    ]);
    return { current: current || [], previous: previous || [] };
};

const useWeekHighlights = (season) => {
    const [state, setState] = useState({ rankings: [], loaded: false });

    useEffect(() => {
        if (!season) {
            return undefined;
        }
        let active = true;
        (async () => {
            const [week, polls] = await Promise.all([
                getCurrentWeek().catch(() => null),
                loadPolls(season, () => active),
            ]);
            if (!active) {
                return;
            }
            setState((current) => ({
                ...current,
                rankings: polls.current,
                pollMoves: pollMovers(polls.current, polls.previous, 25),
            }));
            if (!week) {
                setState((current) => ({ ...current, loaded: true }));
                return;
            }
            const [ongoing, past, schedule, elo, history] = await Promise.all([
                getFilteredGames({ category: 'ONGOING', sort: 'CLOSEST_TO_END', page: 0, size: WEEK_SIZE }).catch(
                    () => null
                ),
                getFilteredGames({ category: 'PAST', season, week, sort: 'NEWEST', page: 0, size: WEEK_SIZE }).catch(
                    () => null
                ),
                getScheduleBySeasonAndWeek(season, week).catch(() => []),
                getEloHistory('all', season).catch(() => []),
                getHistoryWeek(season, week).catch(() => null),
            ]);
            if (!active) {
                return;
            }
            const live = (ongoing?.content || []).filter((game) => game.season === season && game.week === week);
            const finals = past?.content || [];
            const upcoming = (schedule || []).filter((entry) => !entry.started && entry.game_type !== 'SCRIMMAGE');
            const rankByTeam = Object.fromEntries(polls.current.map((row) => [row.teamName, row.rank]));
            setState((current) => ({
                ...current,
                loaded: true,
                week,
                remaining: live.length + upcoming.length,
                upsets: history ? withScores(history.highlights.upsets, history.games) : null,
                brewing: live.filter((game) => game.upset_alert).length,
                swing: history?.highlights.biggest_swing ?? null,
                marquee: marqueeGames({ live, finals, upcoming, rankByTeam }),
                eloMoves: eloMovers(elo || [], week, 10),
            }));
        })();
        return () => {
            active = false;
        };
    }, [season]);

    return state;
};

export default useWeekHighlights;
