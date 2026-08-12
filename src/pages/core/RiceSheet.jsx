import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
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
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';

const METRIC_TYPES = [
    'EQUIVALENT_WINS', 'COLLEY_MATRIX', 'ASR',
    'SCORING_OFFENSE', 'SCORING_DEFENSE', 'MARGIN_OF_VICTORY',
    'ADJUSTED_POINTS_FOR', 'ADJUSTED_POINTS_AGAINST', 'ADJUSTED_NET_POINTS',
    'COMPOSITE',
];
const MAX_TEAMS = 10;

const parseTeamIds = (param) => (param || '').split(',').map((id) => Number(id)).filter((id) => Number.isFinite(id)).slice(0, MAX_TEAMS);

const higherIsBetterFor = (type) => (type.startsWith('ADJUSTED_') ? adjustedMetricHigherIsBetter(type) : rankingMetricHigherIsBetter(type));

const RiceSheet = () => {
    useSeo(ROUTE_META['/rice-sheet']);

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTeamsMap = useTeamsMap();

    const [teams, setTeams] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [season, setSeason] = useState(() => (searchParams.get('season') ? Number(searchParams.get('season')) : null));
    const [week, setWeek] = useState(null);
    const [selectedTeamIds, setSelectedTeamIds] = useState(() => parseTeamIds(searchParams.get('teams')));
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
            if (!active) return;
            const weekList = weeks || [];
            setWeek(weekList.length ? weekList[weekList.length - 1] : null);
        }).catch(() => { if (active) setWeek(null); });
        return () => { active = false; };
    }, [season]);

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
        if (changed) setSearchParams(next, { replace: true });
    }, [season, selectedTeamIds]);

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
                        return {
                            week: entry.week,
                            name: opponentName,
                            played,
                            score: played && ownScore != null && oppScore != null ? `${ownScore}-${oppScore}` : null,
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

    const rankedOpponents = (teamId) => (opponentsByTeamId[teamId] || []).map((opponent) => ({
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

    const removeTeam = (teamId) => setSelectedTeamIds((prev) => prev.filter((id) => id !== teamId));

    return (
        <PageWrap>
            <PageHeading eyebrow="Compare up to 10 teams" title="Rice Sheet">
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

            <Box sx={{ display: 'flex', mb: 2 }}>
                <TeamPicker teams={seasonTeams} selectedTeams={selectedTeams} onChange={(next) => setSelectedTeamIds(next.map((team) => team.id))} />
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
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {selectedTeams.map((team) => (
                        <RiceSheetCard
                            key={team.id}
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
                        />
                    ))}
                </Box>
            )}
        </PageWrap>
    );
};

export default RiceSheet;
