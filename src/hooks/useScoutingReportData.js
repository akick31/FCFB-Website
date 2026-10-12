import { useEffect, useMemo, useRef, useState } from 'react';
import { getAllUsers, getUserById } from '../api/userApi';
import { getAllPlaysByDiscordId } from '../api/playApi';
import { getGamesByIds } from '../api/gameApi';
import { getCurrentSeason } from '../api/seasonApi';
import { orderedGameIdsFromPlays, orderGameIdsByRecency, decodeHiddenColumns } from '../utils/scoutingReport';

const userLabel = (user) => (user.team ? `${user.username} (${user.team})` : user.username);

const useScoutingReportData = ({
    searchParams,
    setError,
    onResetFilters,
    loggedInUserId,
    loginToken,
    setHiddenColumns,
}) => {
    const [users, setUsers] = useState([]);
    const [currentSeasonNumber, setCurrentSeasonNumber] = useState(null);
    const [loadingLookups, setLoadingLookups] = useState(true);

    const [targetLabel, setTargetLabel] = useState('');
    const [gameCount, setGameCount] = useState(10);
    const [rangeMode, setRangeMode] = useState('count');

    const [loading, setLoading] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [plays, setPlays] = useState([]);
    const [reportTarget, setReportTarget] = useState(null);

    const scopeRef = useRef(null);
    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        return () => {
            scope.active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        const urlCols = searchParams.get('cols');
        Promise.all([
            getAllUsers().catch(() => []),
            getCurrentSeason().catch(() => null),
            loggedInUserId ? getUserById(loggedInUserId).catch(() => null) : Promise.resolve(null),
        ])
            .then(([allUsers, current, currentUser]) => {
                if (!active) {
                    return;
                }
                setUsers(allUsers || []);
                setCurrentSeasonNumber(current);
                if (urlCols) {
                    setHiddenColumns(decodeHiddenColumns(urlCols));
                } else if (
                    currentUser?.scouting_report_hidden_columns &&
                    localStorage.getItem('userId') === loggedInUserId &&
                    localStorage.getItem('token') === loginToken
                ) {
                    setHiddenColumns(currentUser.scouting_report_hidden_columns);
                }
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

    const targetOptions = useMemo(
        () =>
            users
                .filter((user) => user.discord_id)
                .map((user) => ({ value: user.discord_id, label: userLabel(user) }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        [users]
    );

    const resolvedTarget = useMemo(
        () => targetOptions.find((option) => option.label === targetLabel)?.value ?? null,
        [targetOptions, targetLabel]
    );

    const generate = async (
        overrideTarget = resolvedTarget,
        overrideGameCount = gameCount,
        overrideRangeMode = rangeMode,
        resetFilters = true
    ) => {
        if (!overrideTarget) {
            setError('Pick a coach or team first.');
            return;
        }
        const scope = scopeRef.current;
        const overrideUser = users.find((user) => user.discord_id === overrideTarget) || null;
        setLoading(true);
        setError('');
        try {
            const rawPlays = await getAllPlaysByDiscordId(overrideTarget);
            if (!scope.active) {
                return;
            }
            const allGameIds = orderedGameIdsFromPlays(rawPlays);
            const games = await getGamesByIds(allGameIds);
            if (!scope.active) {
                return;
            }
            const map = {};
            (games || []).forEach((game) => {
                map[game.game_id] = game;
            });
            const rankedGameIds = orderGameIdsByRecency(allGameIds, map, overrideUser?.team);
            const selectedGameIds =
                overrideRangeMode === 'season'
                    ? rankedGameIds.filter((id) => map[id]?.season === currentSeasonNumber)
                    : rankedGameIds.slice(0, overrideGameCount);
            const allowedIds = new Set(selectedGameIds);
            const limited = rawPlays.filter((play) => allowedIds.has(play.game_id));

            setPlays(limited);
            setReportTarget(overrideTarget);
            setHasGenerated(true);
            if (resetFilters) {
                onResetFilters();
            }
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

    return {
        targetOptions,
        targetLabel,
        setTargetLabel,
        gameCount,
        setGameCount,
        rangeMode,
        setRangeMode,
        loadingLookups,
        loading,
        hasGenerated,
        plays,
        reportTarget,
        resolvedTarget,
        generate,
    };
};
export default useScoutingReportData;
