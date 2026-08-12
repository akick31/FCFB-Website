import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { checkIfUserIsAdmin } from '../../utils/utils';
import { getTeamById } from '../../api/teamApi';
import { getEloHistory } from '../../api/eloHistoryApi.jsx';
import { getRankingsHistory } from '../../api/rankingsHistoryApi.jsx';
import { getRankingMetricWeeks, getRankingMetrics } from '../../api/rankingMetricApi';
import { RANKING_METRIC_TYPES, rankingMetricLabel, rankingMetricShortLabel, rankingMetricHigherIsBetter } from '../../constants/rankingMetrics';
import { getFilteredSeasonStats } from '../../api/seasonStatsApi';
import { getScheduleBySeasonAndTeam } from '../../api/scheduleApi';
import { getLatestCompletedSeason, getCurrentSeason, getAllSeasons } from '../../api/seasonApi';
import { useTeamsMap, toEntry } from '../../hooks/useTeamsMap';
import { useColorMode } from '../../theme/ColorModeContext';
import { pickTeamColor } from '../../utils/teamColor';
import PageWrap from '../../components/layout/PageWrap';
import Panel from '../../components/ui/Panel';
import SectionTitle from '../../components/ui/SectionTitle';
import SelectPill from '../../components/ui/SelectPill';
import SegTabs from '../../components/ui/SegTabs';
import StatTile, { TileGrid } from '../../components/ui/StatTile';
import MiniTrendChart from '../../components/charts/MiniTrendChart';
import TeamHeader from '../../components/team/TeamHeader';
import SeasonStatTable from '../../components/team/SeasonStatTable';
import TeamSchedule from '../../components/schedule/TeamSchedule';
import { aggregateSeasonStats } from '../../utils/aggregateStats';
import { useSeo } from '../../hooks/useSeo';

const statsRows = (result) => {
    if (Array.isArray(result)) return result;
    if (result?.content) return result.content;
    return result ? [result] : [];
};

const firstStats = (result) => statsRows(result)[0] || null;

const SCOPE_TABS = [
    { value: 'regular', label: 'Regular season' },
    { value: 'postseason', label: 'Postseason' },
];

const resolveDefaultSeason = async () => {
    try {
        return await getCurrentSeason();
    } catch {
        const latest = await getLatestCompletedSeason().catch(() => null);
        return latest?.season_number ?? latest?.seasonNumber ?? null;
    }
};

const buildTrend = (points, view) => {
    const filtered = view === 'alltime' ? points : points.filter((point) => point.season === view);
    const sorted = [...filtered].sort((a, b) => (a.season - b.season) || (a.week - b.week));
    return sorted.map((point, index) => ({ week: view === 'alltime' ? index + 1 : point.week, realWeek: point.week, season: point.season, value: point.value }));
};

const TeamDetails = () => {
    const { teamId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const teamsMap = useTeamsMap();
    const { mode } = useColorMode();

    const [team, setTeam] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [seasonView, setSeasonView] = useState(null);
    const scope = searchParams.get('scope') === 'postseason' ? 'postseason' : 'regular';
    const [allEloRows, setAllEloRows] = useState([]);
    const [allRankPoints, setAllRankPoints] = useState([]);
    const [allTimeStats, setAllTimeStats] = useState(null);
    const [seasonStats, setSeasonStats] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seasonLoading, setSeasonLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentSeason, setCurrentSeason] = useState(null);
    const [metricStats, setMetricStats] = useState({ values: {}, ranks: {}, totals: {} });
    const [metricStatus, setMetricStatus] = useState({ season: null, fallback: false });
    const [metricsLoading, setMetricsLoading] = useState(true);
    const [metricTrends, setMetricTrends] = useState({});
    const [metricTrendsLoading, setMetricTrendsLoading] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState(() => new Set());

    const toggleSection = (key) => setCollapsedSections((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
    });

    useSeo({
        title: team ? `${team.name} | FCFB` : 'Team Details | FCFB',
        description: team ? `Record, stats, schedule, and ELO history for ${team.name}.` : 'Team details in Fake College Football.',
    });

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                const teamData = await getTeamById(teamId);
                if (!active) return;
                setTeam(teamData);

                const [defSeason, elo, rankGames, allStatsData] = await Promise.all([
                    resolveDefaultSeason(),
                    getEloHistory(teamData.name, null).catch(() => []),
                    getRankingsHistory(teamData.name, null).catch(() => []),
                    getFilteredSeasonStats(teamData.name, null, null, null, 0, 50).catch(() => null),
                ]);
                if (!active) return;
                setCurrentSeason(defSeason);

                const eloRows = (elo || [])
                    .filter((row) => row.elo != null && row.season >= 1)
                    .map((row) => ({ season: row.season, week: row.week, value: Math.round(row.elo) }));
                const rankPoints = (rankGames || [])
                    .map((game) => ({ season: game.season, week: game.week, value: game.home_team === teamData.name ? game.home_team_rank : game.away_team_rank }))
                    .filter((point) => point.season >= 1 && point.value >= 1 && point.value <= 25);
                setAllEloRows(eloRows);
                setAllRankPoints(rankPoints);
                setAllTimeStats(aggregateSeasonStats(statsRows(allStatsData)));

                const seasonSet = new Set([...eloRows, ...rankPoints].map((row) => row.season).filter((value) => value != null));
                let seasonList = [...seasonSet].sort((a, b) => b - a);
                if (seasonList.length === 0) {
                    const all = await getAllSeasons().catch(() => []);
                    seasonList = all.map((entry) => entry.season_number ?? entry.seasonNumber).filter((value) => value != null).sort((a, b) => b - a);
                }
                setSeasons(seasonList);
                const urlSeason = searchParams.get('season');
                if (urlSeason === 'alltime' || (urlSeason && seasonList.includes(Number(urlSeason)))) {
                    setSeasonView(urlSeason === 'alltime' ? 'alltime' : Number(urlSeason));
                } else {
                    const initial = defSeason != null && seasonList.includes(defSeason) ? defSeason : (seasonList[0] ?? defSeason);
                    setSeasonView(initial);
                }
            } catch {
                if (active) setError('Failed to load team details. Please try again.');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [teamId]);

    useEffect(() => {
        if (!team || seasonView == null) return undefined;
        let active = true;
        setSeasonLoading(true);
        (async () => {
            try {
                if (seasonView === 'alltime') {
                    const results = await Promise.all(seasons.map((entry) => getScheduleBySeasonAndTeam(entry, team.name).catch(() => [])));
                    if (!active) return;
                    const all = results.flat().sort((a, b) => (a.season - b.season) || ((a.week || 0) - (b.week || 0)));
                    setSchedule(all.slice(-12));
                    setSeasonStats(null);
                } else {
                    const [statsData, scheduleData] = await Promise.all([
                        getFilteredSeasonStats(team.name, null, seasonView, null, 0, 20, scope).catch(() => null),
                        getScheduleBySeasonAndTeam(seasonView, team.name).catch(() => []),
                    ]);
                    if (!active) return;
                    setSeasonStats(firstStats(statsData));
                    setSchedule((scheduleData || []).sort((a, b) => (a.week || 0) - (b.week || 0)));
                }
            } finally {
                if (active) setSeasonLoading(false);
            }
        })();
        return () => { active = false; };
    }, [team, seasonView, seasons, scope]);

    useEffect(() => {
        if (!team || currentSeason == null) return undefined;
        let active = true;
        setMetricsLoading(true);
        const fetchMetric = async (season, entry) => {
            const weeks = await getRankingMetricWeeks(season, entry.value).catch(() => []);
            if (!weeks || !weeks.length) return { value: null, rank: null, total: 0 };
            const week = weeks[weeks.length - 1];
            const rows = await getRankingMetrics(season, week, entry.value).catch(() => []);
            const higherIsBetter = rankingMetricHigherIsBetter(entry.value);
            const sorted = [...rows].sort((a, b) => (higherIsBetter ? b.value - a.value : a.value - b.value));
            const index = sorted.findIndex((row) => row.teamId === team.id);
            return { value: index >= 0 ? sorted[index].value : null, rank: index >= 0 ? index + 1 : null, total: sorted.length };
        };
        const fetchSeason = async (season) => {
            const results = await Promise.all(RANKING_METRIC_TYPES.map((entry) => fetchMetric(season, entry)));
            const values = {};
            const ranks = {};
            const totals = {};
            let any = false;
            RANKING_METRIC_TYPES.forEach((entry, index) => {
                values[entry.value] = results[index].value;
                ranks[entry.value] = results[index].rank;
                totals[entry.value] = results[index].total;
                if (results[index].value != null) any = true;
            });
            return { values, ranks, totals, any };
        };
        (async () => {
            const current = await fetchSeason(currentSeason);
            if (!active) return;
            if (current.any) {
                setMetricStats(current);
                setMetricStatus({ season: currentSeason, fallback: false });
                return;
            }
            const previous = await fetchSeason(currentSeason - 1);
            if (!active) return;
            setMetricStats(previous);
            setMetricStatus({ season: currentSeason - 1, fallback: previous.any });
        })().finally(() => { if (active) setMetricsLoading(false); });
        return () => { active = false; };
    }, [team, currentSeason]);

    useEffect(() => {
        if (!team || seasonView == null || seasonView === 'alltime') { setMetricTrends({}); return undefined; }
        let active = true;
        setMetricTrendsLoading(true);
        Promise.all(
            RANKING_METRIC_TYPES.map(async (entry) => {
                const weeks = await getRankingMetricWeeks(seasonView, entry.value).catch(() => []);
                const higherIsBetter = rankingMetricHigherIsBetter(entry.value);
                const byWeek = await Promise.all(
                    (weeks || []).map((week) => getRankingMetrics(seasonView, week, entry.value).catch(() => [])),
                );
                const points = [];
                let maxTeams = 25;
                (weeks || []).forEach((week, index) => {
                    const rows = byWeek[index] || [];
                    if (rows.length > maxTeams) maxTeams = rows.length;
                    const sorted = [...rows].sort((a, b) => (higherIsBetter ? b.value - a.value : a.value - b.value));
                    const rankIndex = sorted.findIndex((row) => row.teamId === team.id);
                    if (rankIndex >= 0) points.push({ week, value: rankIndex + 1 });
                });
                return { points, maxTeams };
            }),
        ).then((results) => {
            if (!active) return;
            const next = {};
            RANKING_METRIC_TYPES.forEach((entry, index) => { next[entry.value] = results[index]; });
            setMetricTrends(next);
        }).finally(() => { if (active) setMetricTrendsLoading(false); });
        return () => { active = false; };
    }, [team, seasonView]);

    const changeScope = (nextScope) => {
        const next = new URLSearchParams(searchParams);
        if (nextScope === 'postseason') {
            next.set('scope', nextScope);
            if (seasonView === 'alltime') {
                const fallback = seasons[0] ?? null;
                setSeasonView(fallback);
                if (fallback != null) next.set('season', String(fallback));
            }
        } else {
            next.delete('scope');
        }
        setSearchParams(next, { replace: true });
    };

    const mark = useMemo(() => {
        if (!team) return null;
        return teamsMap[team.name] || toEntry(team);
    }, [team, teamsMap]);

    useEffect(() => {
        if (seasonView == null) return;
        if (searchParams.get('season') === String(seasonView)) return;
        const next = new URLSearchParams(searchParams);
        next.set('season', String(seasonView));
        setSearchParams(next, { replace: true });
    }, [seasonView]);

    const eloTrend = useMemo(() => buildTrend(allEloRows, seasonView), [allEloRows, seasonView]);
    const rankTrend = useMemo(() => buildTrend(allRankPoints, seasonView), [allRankPoints, seasonView]);

    if (loading) {
        return <PageWrap><Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box></PageWrap>;
    }
    if (error || !team) {
        return <PageWrap><Alert severity="error">{error || 'Team not found.'}</Alert></PageWrap>;
    }

    const lineColor = pickTeamColor(mark, mode);
    const isAllTime = seasonView === 'alltime';
    const activeStats = isAllTime ? allTimeStats : seasonStats;
    const rangeLabel = isAllTime ? 'all seasons' : `Season ${seasonView}`;

    return (
        <PageWrap>
            {checkIfUserIsAdmin() && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '10px' }}>
                    <Box
                        component={Link}
                        to={`/admin/edit-team/${teamId}`}
                        sx={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '14px', py: '8px', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', '&:hover': { borderColor: 'var(--brand)' } }}
                    >
                        Edit team
                    </Box>
                </Box>
            )}
            <TeamHeader team={team} mark={mark} pollRank={team.coaches_poll_ranking} />

            <SectionTitle title="Program history" collapsible collapsed={collapsedSections.has('history')} onToggle={() => toggleSection('history')} />
            {!collapsedSections.has('history') && (
                <TileGrid>
                    <StatTile label="All-time record" value={`${team.overall_wins || 0}-${team.overall_losses || 0}`} caption={`${team.overall_conference_wins || 0}-${team.overall_conference_losses || 0} conference`} />
                    <StatTile label="National titles" value={team.national_championship_wins || 0} />
                    <StatTile label="Playoff record" value={`${team.playoff_wins || 0}-${team.playoff_losses || 0}`} />
                    <StatTile label="Bowl record" value={`${team.bowl_wins || 0}-${team.bowl_losses || 0}`} />
                    <StatTile label="Conference titles" value={team.conference_championship_wins || 0} />
                    <StatTile label="All-time ELO" value={team.overall_elo != null ? Math.round(team.overall_elo) : '-'} />
                </TileGrid>
            )}

            {!metricsLoading && metricStatus.season != null && Object.values(metricStats.values).some((value) => value != null) && (
                <>
                    <SectionTitle
                        title="Computer Rankings"
                        note={`Season ${metricStatus.season}${metricStatus.fallback ? ' (final)' : ''}`}
                        collapsible
                        collapsed={collapsedSections.has('metrics')}
                        onToggle={() => toggleSection('metrics')}
                    />
                    {!collapsedSections.has('metrics') && (
                        <TileGrid minTile={100} sx={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 130px))', justifyContent: 'center' }}>
                            {RANKING_METRIC_TYPES.map((entry) => (
                                <StatTile
                                    key={entry.value}
                                    compact
                                    label={rankingMetricLabel(entry.value)}
                                    value={metricStats.values[entry.value] != null ? metricStats.values[entry.value].toFixed(2) : '-'}
                                    caption={metricStats.ranks[entry.value] != null ? `#${metricStats.ranks[entry.value]} of ${metricStats.totals[entry.value]}` : undefined}
                                />
                            ))}
                        </TileGrid>
                    )}
                </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: '22px', flexWrap: 'wrap' }}>
                <SegTabs value={scope} onChange={changeScope} options={SCOPE_TABS} ariaLabel="Stats scope" />
                <SelectPill
                    label="Viewing"
                    value={seasonView ?? ''}
                    onChange={(next) => setSeasonView(next === 'alltime' ? 'alltime' : Number(next))}
                    options={[
                        ...seasons.map((option) => ({ value: option, label: `Season ${option}` })),
                        ...(scope === 'postseason' ? [] : [{ value: 'alltime', label: 'All-time' }]),
                    ]}
                />
            </Box>

            <SectionTitle title="Schedule" note={rangeLabel} collapsible collapsed={collapsedSections.has('schedule')} onToggle={() => toggleSection('schedule')} />
            {!collapsedSections.has('schedule') && (
                <Box>
                    <TeamSchedule teamName={team.name} schedule={schedule} season={seasonView} teamsMap={teamsMap} loading={seasonLoading} showSeason={isAllTime} subtitle={isAllTime ? 'Last 12 games' : undefined} />
                </Box>
            )}

            {(eloTrend.length > 1 || rankTrend.length > 1 || (!isAllTime && (metricTrendsLoading || RANKING_METRIC_TYPES.some((entry) => (metricTrends[entry.value]?.points || []).length > 1)))) && (
                <>
                    <SectionTitle title="Trends" note={rangeLabel} collapsible collapsed={collapsedSections.has('trends')} onToggle={() => toggleSection('trends')} />
                    {!collapsedSections.has('trends') && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '16px' }}>
                        {eloTrend.length > 1 && (
                            <Panel header="ELO trend" more={rangeLabel}>
                                <Box sx={{ p: 2 }}>
                                    <MiniTrendChart data={eloTrend} color={lineColor} formatLabel={(p) => `Season ${p.season}, Week ${p.realWeek}, ELO ${p.value}`} />
                                </Box>
                            </Panel>
                        )}
                        {rankTrend.length > 1 && (
                            <Panel header="Coaches Poll trend" more={rangeLabel}>
                                <Box sx={{ p: 2 }}>
                                    <MiniTrendChart data={rankTrend} color={lineColor} reversed formatLabel={(p) => `Season ${p.season}, Week ${p.realWeek}, #${p.value}`} />
                                </Box>
                            </Panel>
                        )}
                        {!isAllTime && metricTrendsLoading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={26} /></Box>
                        )}
                        {!isAllTime && !metricTrendsLoading && RANKING_METRIC_TYPES.map((entry) => {
                            const { points = [], maxTeams = 25 } = metricTrends[entry.value] || {};
                            if (points.length < 2) return null;
                            return (
                                <Panel key={entry.value} header={rankingMetricShortLabel(entry.value)} more={`${points.length} weeks`}>
                                    <Box sx={{ p: 2 }}>
                                        <MiniTrendChart
                                            data={points}
                                            color={lineColor}
                                            reversed
                                            yDomain={[1, maxTeams]}
                                            formatLabel={(p) => `Week ${p.week}: #${p.value}`}
                                        />
                                    </Box>
                                </Panel>
                            );
                        })}
                    </Box>
                    )}
                </>
            )}

            <SectionTitle title="Statistics" note={rangeLabel} collapsible collapsed={collapsedSections.has('stats')} onToggle={() => toggleSection('stats')} />
            {!collapsedSections.has('stats') && (
            <Panel>
                {seasonLoading && !isAllTime ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={26} /></Box>
                ) : activeStats ? (
                    <SeasonStatTable stats={activeStats} />
                ) : (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No statistics.</Box>
                )}
            </Panel>
            )}
        </PageWrap>
    );
};

export default TeamDetails;
