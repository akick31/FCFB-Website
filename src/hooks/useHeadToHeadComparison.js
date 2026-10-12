import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllTeamsIncludingInactive } from '../api/teamApi';
import { getAllUsers } from '../api/userApi';
import { getAllPlaysByTeam, getAllPlaysByDiscordId } from '../api/playApi';
import { getGamesByIds } from '../api/gameApi';
import { getFilteredSeasonStats } from '../api/seasonStatsApi';
import { getCoachStats } from '../api/coachStatsApi';
import { getRankedGames } from '../api/rankingApi';
import { orderedGameIdsFromPlays } from '../utils/scoutingReport';
import { buildTeamRankings, buildCoachRankings } from '../utils/leagueRankings';
import { buildMatchupHistory } from '../utils/headToHead';

const statsRows = (result) => {
    if (Array.isArray(result)) {
        return result;
    }
    if (result?.content) {
        return result.content;
    }
    return result ? [result] : [];
};

const useHeadToHeadComparison = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const autoRanRef = useRef(false);
    const scopeRef = useRef(null);

    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        return () => {
            scope.active = false;
        };
    }, []);

    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [teamRankings, setTeamRankings] = useState(new Map());
    const [coachRankings, setCoachRankings] = useState(new Map());
    const [loadingLookups, setLoadingLookups] = useState(true);

    const [modeA, setModeA] = useState('team');
    const [modeB, setModeB] = useState('team');
    const [labelA, setLabelA] = useState('');
    const [labelB, setLabelB] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [resultA, setResultA] = useState(null);
    const [resultB, setResultB] = useState(null);
    const [matchups, setMatchups] = useState(null);

    useEffect(() => {
        let active = true;
        Promise.all([
            getAllTeamsIncludingInactive().catch(() => []),
            getAllUsers().catch(() => []),
            getRankedGames('all').catch(() => []),
        ])
            .then(([allTeams, allUsers, rankedGames]) => {
                if (!active) {
                    return;
                }
                setTeams(allTeams || []);
                setUsers(allUsers || []);
                setTeamRankings(buildTeamRankings(allTeams || [], rankedGames || []));
                setCoachRankings(buildCoachRankings(allUsers || [], rankedGames || []));
            })
            .finally(() => {
                if (active) {
                    setLoadingLookups(false);
                }
            });
        return () => {
            active = false;
        };
    }, []);

    const teamOptions = useMemo(
        () =>
            [...teams]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((team) => ({ value: team.name, label: team.name })),
        [teams]
    );
    const coachLabel = (user) => (user.team ? `${user.username} (${user.team})` : user.username);
    const coachOptions = useMemo(
        () =>
            users
                .filter((user) => user.discord_id)
                .map((user) => ({ value: user.discord_id, label: coachLabel(user) }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        [users]
    );

    const optionsFor = (entityMode) => (entityMode === 'coach' ? coachOptions : teamOptions);
    const resolvedA = useMemo(
        () => optionsFor(modeA).find((option) => option.label === labelA)?.value ?? null,
        [modeA, teamOptions, coachOptions, labelA]
    );
    const resolvedB = useMemo(
        () => optionsFor(modeB).find((option) => option.label === labelB)?.value ?? null,
        [modeB, teamOptions, coachOptions, labelB]
    );

    const userByDiscordId = useMemo(() => {
        const map = new Map();
        users.forEach((user) => {
            if (user.discord_id) {
                map.set(user.discord_id, user);
            }
        });
        return map;
    }, [users]);

    const compare = async (
        overrideModeA = modeA,
        overrideModeB = modeB,
        overrideA = resolvedA,
        overrideB = resolvedB
    ) => {
        if (!overrideA || !overrideB) {
            setError('Pick two teams or coaches first.');
            return;
        }
        const scope = scopeRef.current;
        setLoading(true);
        setError('');
        try {
            const [seasonRowsA, seasonRowsB, playsA, playsB] = await Promise.all([
                overrideModeA === 'coach'
                    ? getCoachStats(userByDiscordId.get(overrideA)?.username).catch(() => [])
                    : getFilteredSeasonStats(overrideA, null, null, null, 0, 100).catch(() => null),
                overrideModeB === 'coach'
                    ? getCoachStats(userByDiscordId.get(overrideB)?.username).catch(() => [])
                    : getFilteredSeasonStats(overrideB, null, null, null, 0, 100).catch(() => null),
                overrideModeA === 'coach'
                    ? getAllPlaysByDiscordId(overrideA).catch(() => [])
                    : getAllPlaysByTeam(overrideA).catch(() => []),
                overrideModeB === 'coach'
                    ? getAllPlaysByDiscordId(overrideB).catch(() => [])
                    : getAllPlaysByTeam(overrideB).catch(() => []),
            ]);
            if (!scope.active) {
                return;
            }
            const gameIds = [...new Set([...orderedGameIdsFromPlays(playsA), ...orderedGameIdsFromPlays(playsB)])];
            const games = gameIds.length > 0 ? await getGamesByIds(gameIds) : [];
            if (!scope.active) {
                return;
            }
            const entityA = { mode: overrideModeA, id: overrideA };
            const entityB = { mode: overrideModeB, id: overrideB };
            const matchupHistory = buildMatchupHistory(games, entityA, entityB, playsA, playsB);

            setResultA({ mode: overrideModeA, id: overrideA, seasonRows: statsRows(seasonRowsA) });
            setResultB({ mode: overrideModeB, id: overrideB, seasonRows: statsRows(seasonRowsB) });
            setMatchups(matchupHistory);
            setSearchParams(
                { aType: overrideModeA, a: overrideA, bType: overrideModeB, b: overrideB },
                { replace: true }
            );
        } catch (err) {
            if (scope.active) {
                setError(err.message);
            }
        } finally {
            if (scope.active) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (autoRanRef.current || teamOptions.length === 0 || coachOptions.length === 0) {
            return;
        }
        autoRanRef.current = true;
        const urlModeA = searchParams.get('aType') === 'coach' ? 'coach' : 'team';
        const urlModeB = searchParams.get('bType') === 'coach' ? 'coach' : 'team';
        const urlA = searchParams.get('a');
        const urlB = searchParams.get('b');
        const optionA = optionsFor(urlModeA).find((option) => option.value === urlA);
        const optionB = optionsFor(urlModeB).find((option) => option.value === urlB);
        setModeA(urlModeA);
        setModeB(urlModeB);
        if (optionA) {
            setLabelA(optionA.label);
        }
        if (optionB) {
            setLabelB(optionB.label);
        }
        if (optionA && optionB) {
            compare(urlModeA, urlModeB, optionA.value, optionB.value);
        }
    }, [teamOptions, coachOptions]);

    return {
        teamRankings,
        coachRankings,
        loadingLookups,
        modeA,
        setModeA,
        modeB,
        setModeB,
        labelA,
        setLabelA,
        labelB,
        setLabelB,
        loading,
        error,
        resultA,
        resultB,
        matchups,
        optionsFor,
        resolvedA,
        resolvedB,
        userByDiscordId,
        compare,
    };
};
export default useHeadToHeadComparison;
