import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import SelectPill from '../../components/ui/SelectPill';
import TeamPicker from '../../components/riceSheet/TeamPicker';
import RiceSheetCard from '../../components/riceSheet/RiceSheetCard';
import { getAllTeamsIncludingInactive } from '../../api/teamApi';
import { getAllSeasons, getCurrentSeasonOrLatest } from '../../api/seasonApi';
import { getTeamSeasonConference } from '../../api/teamSeasonConferenceApi';
import { getScheduleBySeasonAndTeam } from '../../api/scheduleApi';
import { getRankingMetrics, getValidRankingMetricWeeks } from '../../api/rankingMetricApi';
import { getTeamResumeMetrics } from '../../api/teamResumeMetricApi';
import { rankMetricEntries } from '../../utils/rankMetricEntries';
import { rankingMetricHigherIsBetter } from '../../constants/rankingMetrics';
import { ADJUSTED_PPG_METRIC_TYPES, adjustedMetricHigherIsBetter } from '../../constants/riceSheetAdjustedMetrics';
import { useTeamsMap, toEntry } from '../../hooks/useTeamsMap';
import { useConferencesMap, seasonConferenceList } from '../../components/constants/conferences';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';

const METRIC_TYPES = [
    'EQUIVALENT_WINS', 'COLLEY_MATRIX', 'ASR',
    'SCORING_OFFENSE', 'SCORING_DEFENSE', 'MARGIN_OF_VICTORY',
    'ADJUSTED_POINTS_FOR', 'ADJUSTED_POINTS_AGAINST', 'ADJUSTED_NET_POINTS',
    'COMPOSITE',
];
const MAX_TEAMS = 25;
const BOWL_START_WEEK = 14;
const TOP_N_QUICK_VIEWS = [10, 25];

const parseTeamIds = (param) => (param || '').split(',').map((id) => Number(id)).filter((id) => Number.isFinite(id)).slice(0, MAX_TEAMS);

const higherIsBetterFor = (type) => (type.startsWith('ADJUSTED_') ? adjustedMetricHigherIsBetter(type) : rankingMetricHigherIsBetter(type));

const RiceSheet = () => {
    useSeo(ROUTE_META['/rice-sheet']);

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTeamsMap = useTeamsMap();
    const conferencesMap = useConferencesMap();

    const [teams, setTeams] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [season, setSeason] = useState(() => (searchParams.get('season') ? Number(searchParams.get('season')) : null));
    const [validWeeks, setValidWeeks] = useState([]);
    const [selectedTeamIds, setSelectedTeamIds] = useState(() => parseTeamIds(searchParams.get('teams')));
    const [excludeBowls, setExcludeBowls] = useState(false);
    const [quickView, setQuickView] = useState(() => searchParams.get('quickView') || '');
    const [compact, setCompact] = useState(false);
    const [compactOverrides, setCompactOverrides] = useState({});
    const [dragTeamId, setDragTeamId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [metricsByType, setMetricsByType] = useState({});
    const [resumeByTeamId, setResumeByTeamId] = useState({});
    const [seasonConferenceByTeam, setSeasonConferenceByTeam] = useState({});
    const [opponentsByTeamId, setOpponentsByTeamId] = useState({});
    const [opponentsLoadingByTeamId, setOpponentsLoadingByTeamId] = useState({});

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [allTeams, allSeasons] = await Promise.all([
                    getAllTeamsIncludingInactive().catch(() => []),
                    getAllSeasons().catch(() => []),
                ]);
                if (!active) return;
                setTeams(allTeams || []);
                const seasonNumbers = [...new Set((allSeasons || [])
                    .map((entry) => entry.season_number ?? entry.seasonNumber)
                    .filter((value) => value != null))].sort((a, b) => b - a);
                setSeasons(seasonNumbers);
                if (season == null) {
                    const current = await getCurrentSeasonOrLatest().catch(() => null);
                    setSeason(seasonNumbers.includes(current) ? current : (seasonNumbers[0] ?? null));
                }
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (season == null) return undefined;
        let active = true;
        getValidRankingMetricWeeks(season).then((weeks) => {
            if (active) setValidWeeks(weeks || []);
        }).catch(() => { if (active) setValidWeeks([]); });
        return () => { active = false; };
    }, [season]);

    const week = useMemo(() => {
        if (!validWeeks.length) return null;
        if (excludeBowls) {
            const regularSeasonWeeks = validWeeks.filter((w) => w < BOWL_START_WEEK);
            if (regularSeasonWeeks.length) return regularSeasonWeeks[regularSeasonWeeks.length - 1];
        }
        return validWeeks[validWeeks.length - 1];
    }, [validWeeks, excludeBowls]);

    useEffect(() => {
        if (season == null) { setSeasonConferenceByTeam({}); return undefined; }
        let active = true;
        getTeamSeasonConference(season).then((map) => {
            if (active) setSeasonConferenceByTeam(map || {});
        }).catch(() => { if (active) setSeasonConferenceByTeam({}); });
        return () => { active = false; };
    }, [season]);

    useEffect(() => {
        if (season == null || week == null) return undefined;
        let active = true;
        Promise.all(METRIC_TYPES.map((type) => getRankingMetrics(season, week, type).catch(() => [])))
            .then((results) => {
                if (!active) return;
                const next = {};
                METRIC_TYPES.forEach((type, index) => {
                    const { rankByTeamId } = rankMetricEntries(results[index] || [], higherIsBetterFor(type));
                    const valueByTeamId = {};
                    (results[index] || []).forEach((entry) => { valueByTeamId[entry.teamId] = entry.value; });
                    next[type] = { rankByTeamId, valueByTeamId };
                });
                setMetricsByType(next);
            });
        getTeamResumeMetrics(season, week).then((rows) => {
            if (!active) return;
            const byTeamId = {};
            (rows || []).forEach((row) => { byTeamId[row.teamId] = row; });
            setResumeByTeamId(byTeamId);
        }).catch(() => { if (active) setResumeByTeamId({}); });
        return () => { active = false; };
    }, [season, week]);

    useEffect(() => {
        const next = new URLSearchParams(searchParams);
        let changed = false;
        const apply = (key, value) => {
            if (value == null) {
                if (next.has(key)) { next.delete(key); changed = true; }
            } else if (next.get(key) !== value) {
                next.set(key, value);
                changed = true;
            }
        };
        apply('season', season != null ? String(season) : null);
        apply('teams', selectedTeamIds.length ? selectedTeamIds.join(',') : null);
        apply('quickView', quickView || null);
        if (changed) setSearchParams(next, { replace: true });
    }, [season, selectedTeamIds, quickView]);

    const teamById = useMemo(() => Object.fromEntries(teams.map((team) => [team.id, team])), [teams]);
    const seasonTeams = useMemo(
        () => teams.filter((team) => seasonConferenceByTeam[team.name] != null),
        [teams, seasonConferenceByTeam],
    );
    const selectedTeams = useMemo(
        () => selectedTeamIds.map((id) => teamById[id]).filter(Boolean),
        [selectedTeamIds, teamById],
    );

    useEffect(() => {
        if (!Object.keys(seasonConferenceByTeam).length) return;
        setSelectedTeamIds((prev) => prev.filter((id) => {
            const team = teamById[id];
            return team && seasonConferenceByTeam[team.name] != null;
        }));
    }, [seasonConferenceByTeam, teamById]);

    const compositeRankByTeamId = metricsByType.COMPOSITE?.rankByTeamId || {};
    const teamIdByName = useMemo(() => Object.fromEntries(teams.map((team) => [team.name, team.id])), [teams]);

    const seasonConferences = useMemo(
        () => seasonConferenceList([...new Set(Object.values(seasonConferenceByTeam))]),
        [seasonConferenceByTeam, conferencesMap],
    );
    const quickViewOptions = useMemo(() => [
        { value: '', label: 'Quick view...' },
        ...TOP_N_QUICK_VIEWS.map((n) => ({ value: `top${n}`, label: `Top ${n}` })),
        ...seasonConferences.map((conference) => ({ value: conference.code, label: conference.label })),
    ], [seasonConferences]);

    const applyQuickView = (value) => {
        setQuickView(value);
        if (!value) return;
        const topN = TOP_N_QUICK_VIEWS.find((n) => value === `top${n}`);
        const ids = topN != null
            ? Object.entries(compositeRankByTeamId).filter(([, rank]) => rank <= topN).map(([teamId]) => Number(teamId))
            : seasonTeams.filter((team) => seasonConferenceByTeam[team.name] === value).map((team) => team.id);
        ids.sort((a, b) => (compositeRankByTeamId[a] ?? Infinity) - (compositeRankByTeamId[b] ?? Infinity));
        setSelectedTeamIds(ids);
    };

    useEffect(() => {
        if (!quickView || selectedTeamIds.length) return;
        if (!seasonTeams.length || !Object.keys(compositeRankByTeamId).length) return;
        applyQuickView(quickView);
    }, [seasonTeams, compositeRankByTeamId]);

    const sosRankByTeamId = useMemo(() => {
        const ranked = Object.values(resumeByTeamId)
            .filter((row) => row.compositeSos != null)
            .sort((a, b) => b.compositeSos - a.compositeSos);
        return Object.fromEntries(ranked.map((row, index) => [row.teamId, index + 1]));
    }, [resumeByTeamId]);

    useEffect(() => {
        if (season == null) return;
        selectedTeams.forEach((team) => {
            if (opponentsByTeamId[team.id] || opponentsLoadingByTeamId[team.id]) return;
            setOpponentsLoadingByTeamId((prev) => ({ ...prev, [team.id]: true }));
            getScheduleBySeasonAndTeam(season, team.name).then((entries) => {
                const opponents = (entries || [])
                    .filter((entry) => entry.home_team === team.name || entry.away_team === team.name)
                    .map((entry) => {
                        const isHome = entry.home_team === team.name;
                        const opponentName = isHome ? entry.away_team : entry.home_team;
                        const played = Boolean(entry.finished);
                        const ownScore = isHome ? entry.home_score : entry.away_score;
                        const oppScore = isHome ? entry.away_score : entry.home_score;
                        const hasScore = played && ownScore != null && oppScore != null;
                        return {
                            week: entry.week,
                            name: opponentName,
                            played,
                            won: hasScore ? ownScore > oppScore : null,
                            score: hasScore ? `${ownScore}-${oppScore}` : null,
                        };
                    })
                    .sort((a, b) => (a.week || 0) - (b.week || 0));
                setOpponentsByTeamId((prev) => ({ ...prev, [team.id]: opponents }));
            }).catch(() => {
                setOpponentsByTeamId((prev) => ({ ...prev, [team.id]: [] }));
            }).finally(() => {
                setOpponentsLoadingByTeamId((prev) => ({ ...prev, [team.id]: false }));
            });
        });
    }, [selectedTeams, season]);

    const rankedOpponents = (teamId) => (opponentsByTeamId[teamId] || [])
        .filter((opponent) => !excludeBowls || opponent.week < BOWL_START_WEEK)
        .map((opponent) => ({
            ...opponent,
            rank: compositeRankByTeamId[teamIdByName[opponent.name]] ?? null,
        }));

    const teamsMap = useMemo(() => {
        const merged = { ...activeTeamsMap };
        teams.forEach((team) => {
            if (team.name && !merged[team.name]) merged[team.name] = toEntry(team);
        });
        return merged;
    }, [activeTeamsMap, teams]);

    const removeTeam = (teamId) => {
        setSelectedTeamIds((prev) => prev.filter((id) => id !== teamId));
        setCompactOverrides((prev) => {
            if (!(teamId in prev)) return prev;
            const next = { ...prev };
            delete next[teamId];
            return next;
        });
    };

    const reorderTeams = (sourceId, targetId) => {
        if (sourceId === targetId) return;
        setSelectedTeamIds((prev) => {
            const from = prev.indexOf(sourceId);
            const to = prev.indexOf(targetId);
            if (from === -1 || to === -1) return prev;
            const next = [...prev];
            next.splice(from, 1);
            next.splice(to, 0, sourceId);
            return next;
        });
    };

    const isCardCompact = (teamId) => compactOverrides[teamId] ?? compact;
    const toggleCardCompact = (teamId) => {
        setCompactOverrides((prev) => ({ ...prev, [teamId]: !isCardCompact(teamId) }));
    };
    const setAllCompact = (value) => {
        setCompact(value);
        setCompactOverrides({});
    };

    return (
        <PageWrap maxWidth={1300}>
            <PageHeading eyebrow={`Compare up to ${MAX_TEAMS} teams`} title="Rice Sheet">
                {season != null && seasons.length > 0 && (
                    <SelectPill
                        label="Season"
                        value={season}
                        onChange={(next) => setSeason(Number(next))}
                        options={seasons.map((option) => ({ value: option, label: `Season ${option}` }))}
                        sx={{ height: '38px', boxSizing: 'border-box' }}
                    />
                )}
            </PageHeading>

            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <TeamPicker teams={seasonTeams} selectedTeams={selectedTeams} onChange={(next) => setSelectedTeamIds(next.map((team) => team.id))} />
                <SelectPill
                    label="Quick view"
                    value={quickView}
                    onChange={applyQuickView}
                    options={quickViewOptions}
                    sx={{ height: '38px', boxSizing: 'border-box' }}
                />
                <FormControlLabel
                    control={<Checkbox checked={excludeBowls} onChange={(event) => setExcludeBowls(event.target.checked)} size="small" />}
                    label="Exclude bowls"
                    sx={{ m: 0, whiteSpace: 'nowrap', color: 'var(--text-muted)', '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                />
                <FormControlLabel
                    control={<Checkbox checked={compact} onChange={(event) => setAllCompact(event.target.checked)} size="small" />}
                    label="Compact view"
                    sx={{ m: 0, whiteSpace: 'nowrap', color: 'var(--text-muted)', '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                />
            </Box>

            <Box sx={{ color: 'var(--text-muted)', fontSize: '0.78rem', mb: 2, lineHeight: 1.6 }}>
                {ADJUSTED_PPG_METRIC_TYPES.map((metric, index) => (
                    <React.Fragment key={metric.value}>
                        {index > 0 && ' '}
                        <strong>{metric.shortLabel}</strong>
                        {' = '}
                        {metric.description}
                    </React.Fragment>
                ))}
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
            ) : !selectedTeams.length ? (
                <Box sx={{ color: 'var(--text-muted)', textAlign: 'center', py: 8 }}>Pick a team above to get started.</Box>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                    {selectedTeams.map((team) => (
                        <Box
                            key={team.id}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                                event.preventDefault();
                                if (dragTeamId != null) reorderTeams(dragTeamId, team.id);
                                setDragTeamId(null);
                            }}
                            sx={{
                                opacity: dragTeamId === team.id ? 0.4 : 1,
                                ...(isCardCompact(team.id)
                                    ? { flex: '0 0 auto', width: 190 }
                                    : { flex: '0 0 auto', width: 300 }),
                            }}
                        >
                            <RiceSheetCard
                                team={team}
                                mark={teamsMap[team.name]}
                                conference={seasonConferenceByTeam[team.name] ?? team.conference}
                                compositeRank={metricsByType.COMPOSITE?.rankByTeamId[team.id]}
                                metricsByType={metricsByType}
                                resume={resumeByTeamId[team.id]}
                                sosRank={sosRankByTeamId[team.id]}
                                opponents={rankedOpponents(team.id)}
                                opponentsLoading={Boolean(opponentsLoadingByTeamId[team.id])}
                                onRemove={() => removeTeam(team.id)}
                                compact={isCardCompact(team.id)}
                                onToggleCompact={() => toggleCardCompact(team.id)}
                                onDragHandleStart={() => setDragTeamId(team.id)}
                                onDragHandleEnd={() => setDragTeamId(null)}
                            />
                        </Box>
                    ))}
                </Box>
            )}
        </PageWrap>
    );
};

export default RiceSheet;
