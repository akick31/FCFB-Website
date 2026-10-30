import { useEffect, useState } from 'react';
import { getAllSeasons, getCurrentSeasonOrLatest } from '../api/seasonApi';
import { getHistoryWeek, getHistoryWeeks } from '../api/historyApi';

const seasonNumbers = (seasons) =>
    (seasons || [])
        .map((season) => season.season_number ?? season.seasonNumber ?? season)
        .filter((season) => typeof season === 'number')
        .sort((a, b) => b - a);

export const useHistorySeasons = (requestedSeason) => {
    const [state, setState] = useState({ seasons: [], season: null });
    useEffect(() => {
        let active = true;
        Promise.all([getAllSeasons().catch(() => []), getCurrentSeasonOrLatest().catch(() => null)]).then(
            ([seasons, current]) => {
                if (active) {
                    const numbers = seasonNumbers(seasons);
                    setState({ seasons: numbers, season: requestedSeason ?? current ?? numbers[0] ?? null });
                }
            }
        );
        return () => {
            active = false;
        };
    }, [requestedSeason]);
    return state;
};

export const useHistoryWeeks = (season) => {
    const [weeks, setWeeks] = useState(null);
    useEffect(() => {
        if (season == null) {
            return undefined;
        }
        let active = true;
        setWeeks(null);
        getHistoryWeeks(season)
            .catch(() => [])
            .then((loaded) => active && setWeeks(loaded));
        return () => {
            active = false;
        };
    }, [season]);
    return weeks;
};

export const useHistoryWeek = (season, week) => {
    const [state, setState] = useState({ loading: true, data: null });
    useEffect(() => {
        if (season == null || week == null) {
            return undefined;
        }
        let active = true;
        setState({ loading: true, data: null });
        getHistoryWeek(season, week)
            .then((data) => active && setState({ loading: false, data }))
            .catch(() => active && setState({ loading: false, data: null, error: true }));
        return () => {
            active = false;
        };
    }, [season, week]);
    return state;
};
