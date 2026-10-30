import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { checkIfUserIsAdmin } from '../../utils/utils';
import { getTeamById } from '../../api/teamApi';
import { getEloHistory } from '../../api/eloHistoryApi.jsx';
import { getLatestRankings, getTeamRankings } from '../../api/rankingApi';
import { getRankingMetricWeeks, getTeamRankingMetrics, getTeamRankingMetricTrends } from '../../api/rankingMetricApi';
import { RANKING_METRIC_TYPES, rankingMetricLabel, rankingMetricShortLabel } from '../../constants/rankingMetrics';
import { getFilteredSeasonStats } from '../../api/seasonStatsApi';
import { getScheduleBySeasonAndTeam } from '../../api/scheduleApi';
import { getLatestCompletedSeason, getCurrentSeason, getAllSeasons } from '../../api/seasonApi';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';
import { getAllUsers } from '../../api/userApi';
import { useTeamsMap, toEntry } from '../../hooks/useTeamsMap';
import { useColorMode } from '../../context/ColorModeContext';
import { pickTeamColor } from '../../utils/teamColor';
import { formatPosition } from '../../utils/formatText';
import PageWrap from '../../components/layout/PageWrap';
import Panel from '../../components/ui/Panel';
import SectionTitle from '../../components/ui/SectionTitle';
import SelectPill from '../../components/ui/SelectPill';
import SegTabs from '../../components/ui/SegTabs';
import PageTabs from '../../components/ui/PageTabs';
import StatTile, { TileGrid } from '../../components/ui/StatTile';
import MiniTrendChart from '../../components/charts/MiniTrendChart';
import TeamHeader from '../../components/team/TeamHeader';
import TeamEditDialog from '../../components/admin/TeamEditDialog';
import { pillHeight, secondaryButtonSx } from '../../styles/controls';
import SeasonStatTable from '../../components/team/SeasonStatTable';
import TeamSchedule from '../../components/schedule/TeamSchedule';
import DataTable from '../../components/ui/DataTable';
import { aggregateSeasonStats } from '../../utils/aggregateStats';
import { buildTeamCoachHistory, formatStintDate } from '../../utils/coachHistory';
import { useSeo } from '../../hooks/useSeo';

const statsRows = (result) => {
    if (Array.isArray(result)) {
        return result;
    }
    if (result?.content) {
        return result.content;
    }
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
    const sorted = [...filtered].sort((a, b) => a.season - b.season || a.week - b.week);
    return sorted.map((point, index) => ({
        week: view === 'alltime' ? index + 1 : point.week,
        realWeek: point.week,
        season: point.season,
        value: point.value,
    }));
};

const TeamDetails = () => {
    const { teamId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const teamsMap = useTeamsMap();
    const { mode } = useColorMode();

    const [team, setTeam] = useState(null);
    const [pollRank, setPollRank] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [seasonView, setSeasonView] = useState(null);
    const scope = searchParams.get('scope') === 'postseason' ? 'postseason' : 'regular';
    const [allEloRows, setAllEloRows] = useState([]);
    const [allRankPoints, setAllRankPoints] = useState([]);
    const [allTimeStats, setAllTimeStats] = useState(null);
    const [allTimePostseasonStats, setAllTimePostseasonStats] = useState(null);
    const [postseasonSeasons, setPostseasonSeasons] = useState(() => new Set());
    const [seasonStats, setSeasonStats] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [version, setVersion] = useState(0);
    const [seasonLoading, setSeasonLoading] = useState(false);
    const [error, setError] = useState('');
    const [metricStats, setMetricStats] = useState({ values: {}, ranks: {}, totals: {} });
    const [metricsLoading, setMetricsLoading] = useState(true);
    const [metricTrends, setMetricTrends] = useState({});
    const [metricTrendsLoading, setMetricTrendsLoading] = useState(false);
    const [coachTransactions, setCoachTransactions] = useState([]);
    const [discordIdToUsername, setDiscordIdToUsername] = useState({});

    useSeo({
        title: team ? `${team.name} | FCFB` : 'Team Details | FCFB',
        description: team
            ? `Record, stats, schedule, and ELO history for ${team.name}.`
            : 'Team details in Fake College Football.',
    });

    useEffect(() => {
        let active = true;
        setError('');
        setTeam(null);
        setPollRank(null);
        setSeasonView(null);
        (async () => {
            try {
                setLoading(true);
                const teamData = await getTeamById(teamId);
                if (!active) {
                    return;
                }
                setTeam(teamData);
                getLatestRankings('COACHES_POLL')
                    .then((entries) => {
                        if (active) {
                            setPollRank(entries.find((entry) => entry.teamId === teamData.id)?.rank ?? null);
                        }
                    })
                    .catch(() => {});

                const [defSeason, elo, teamRankings, allStatsData, postStatsData, allTransactions, allUsers] =
                    await Promise.all([
                        resolveDefaultSeason(),
                        getEloHistory(teamData.name, null).catch(() => []),
                        getTeamRankings(teamData.id, 'COACHES_POLL').catch(() => []),
                        getFilteredSeasonStats(teamData.name, null, null, null, 0, 50).catch(() => null),
                        getFilteredSeasonStats(teamData.name, null, null, null, 0, 50, 'postseason').catch(() => null),
                        getEntireCoachTransactionLog().catch(() => []),
                        getAllUsers().catch(() => []),
                    ]);
                if (!active) {
                    return;
                }
                setCoachTransactions(allTransactions || []);
                setDiscordIdToUsername(
                    (allUsers || []).reduce((acc, entry) => {
                        if (entry.discord_id) {
                            acc[entry.discord_id] = entry.username;
                        }
                        return acc;
                    }, {})
                );

                const eloRows = (elo || [])
                    .filter((row) => row.elo != null && row.season >= 1)
                    .map((row) => ({ season: row.season, week: row.week, value: Math.round(row.elo) }));
                const rankPoints = (teamRankings || [])
                    .map((entry) => ({ season: entry.season, week: entry.week, value: entry.rank }))
                    .filter((point) => point.season >= 1);
                setAllEloRows(eloRows);
                setAllRankPoints(rankPoints);
                setAllTimeStats(aggregateSeasonStats(statsRows(allStatsData)));
                const postRows = statsRows(postStatsData);
                setPostseasonSeasons(new Set(postRows.map((row) => row.season_number ?? row.seasonNumber)));
                setAllTimePostseasonStats(postRows.length > 0 ? aggregateSeasonStats(postRows) : null);

                const seasonSet = new Set(
                    [...eloRows, ...rankPoints].map((row) => row.season).filter((value) => value != null)
                );
                if (defSeason != null) {
                    seasonSet.add(defSeason);
                }
                let seasonList = [...seasonSet].sort((a, b) => b - a);
                if (seasonList.length === 0) {
                    const all = await getAllSeasons().catch(() => []);
                    if (!active) {
                        return;
                    }
                    seasonList = all
                        .map((entry) => entry.season_number ?? entry.seasonNumber)
                        .filter((value) => value != null)
                        .sort((a, b) => b - a);
                }
                setSeasons(seasonList);
                const urlSeason = searchParams.get('season');
                if (urlSeason === 'alltime' || (urlSeason && seasonList.includes(Number(urlSeason)))) {
                    setSeasonView(urlSeason === 'alltime' ? 'alltime' : Number(urlSeason));
                } else {
                    const initial =
                        defSeason != null && seasonList.includes(defSeason) ? defSeason : (seasonList[0] ?? defSeason);
                    setSeasonView(initial);
                }
            } catch {
                if (active) {
                    setError('Failed to load team details. Please try again.');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        })();
        return () => {
            active = false;
        };
    }, [teamId, version]);

    useEffect(() => {
        if (!team || seasonView == null) {
            return undefined;
        }
        let active = true;
        setSeasonLoading(true);
        (async () => {
            try {
                if (seasonView === 'alltime') {
                    const results = await Promise.all(
                        seasons.map((entry) => getScheduleBySeasonAndTeam(entry, team.name).catch(() => []))
                    );
                    if (!active) {
                        return;
                    }
                    const all = results.flat().sort((a, b) => a.season - b.season || (a.week || 0) - (b.week || 0));
                    setSchedule(all.slice(-12));
                    setSeasonStats(null);
                } else {
                    const [statsData, scheduleData] = await Promise.all([
                        getFilteredSeasonStats(
                            team.name,
                            null,
                            seasonView,
                            null,
                            0,
                            20,
                            postseasonSeasons.has(seasonView) ? scope : 'regular'
                        ).catch(() => null),
                        getScheduleBySeasonAndTeam(seasonView, team.name).catch(() => []),
                    ]);
                    if (!active) {
                        return;
                    }
                    setSeasonStats(firstStats(statsData));
                    setSchedule((scheduleData || []).sort((a, b) => (a.week || 0) - (b.week || 0)));
                }
            } finally {
                if (active) {
                    setSeasonLoading(false);
                }
            }
        })();
        return () => {
            active = false;
        };
    }, [team, seasonView, seasons, scope, postseasonSeasons]);

    useEffect(() => {
        if (!team || seasonView == null || seasonView === 'alltime') {
            setMetricStats({ values: {}, ranks: {}, totals: {} });
            setMetricsLoading(false);
            return undefined;
        }
        let active = true;
        setMetricsLoading(true);
        (async () => {
            try {
                const weeks = await getRankingMetricWeeks(seasonView, RANKING_METRIC_TYPES[0].value).catch(() => []);
                if (!active) {
                    return;
                }
                if (!weeks || !weeks.length) {
                    setMetricStats({ values: {}, ranks: {}, totals: {} });
                    return;
                }
                const numericWeeks = weeks.map(Number).filter(Number.isFinite);
                if (!numericWeeks.length) {
                    setMetricStats({ values: {}, ranks: {}, totals: {} });
                    return;
                }
                const week = Math.max(...numericWeeks);
                const metrics = await getTeamRankingMetrics(seasonView, week, team.id).catch(() => []);
                if (!active) {
                    return;
                }
                const byType = Object.fromEntries((metrics || []).map((entry) => [entry.metricType, entry]));
                const values = {};
                const ranks = {};
                const totals = {};
                RANKING_METRIC_TYPES.forEach((entry) => {
                    const found = byType[entry.value];
                    values[entry.value] = found ? found.value : null;
                    ranks[entry.value] = found ? found.rank : null;
                    totals[entry.value] = found ? found.total : 0;
                });
                setMetricStats({ values, ranks, totals });
            } finally {
                if (active) {
                    setMetricsLoading(false);
                }
            }
        })();
        return () => {
            active = false;
        };
    }, [team, seasonView]);

    useEffect(() => {
        if (!team || seasonView == null || seasonView === 'alltime') {
            setMetricTrends({});
            return undefined;
        }
        let active = true;
        setMetricTrendsLoading(true);
        getTeamRankingMetricTrends(seasonView, team.id)
            .catch(() => [])
            .then((rows) => {
                if (!active) {
                    return;
                }
                const byType = {};
                (rows || []).forEach((row) => {
                    if (!byType[row.metricType]) {
                        byType[row.metricType] = { points: [], maxTeams: 25 };
                    }
                    const entry = byType[row.metricType];
                    if (row.total > entry.maxTeams) {
                        entry.maxTeams = row.total;
                    }
                    if (row.rank != null) {
                        entry.points.push({ week: row.week, value: row.rank });
                    }
                });
                const next = {};
                RANKING_METRIC_TYPES.forEach((entry) => {
                    const found = byType[entry.value] || { points: [], maxTeams: 25 };
                    found.points.sort((a, b) => a.week - b.week);
                    next[entry.value] = found;
                });
                setMetricTrends(next);
            })
            .finally(() => {
                if (active) {
                    setMetricTrendsLoading(false);
                }
            });
        return () => {
            active = false;
        };
    }, [team, seasonView]);

    const changeScope = (nextScope) => {
        const next = new URLSearchParams(searchParams);
        if (nextScope === 'postseason') {
            next.set('scope', nextScope);
        } else {
            next.delete('scope');
        }
        setSearchParams(next, { replace: true });
    };

    const mark = useMemo(() => {
        if (!team) {
            return null;
        }
        return teamsMap[team.name] || toEntry(team);
    }, [team, teamsMap]);

    useEffect(() => {
        if (seasonView == null) {
            return;
        }
        if (searchParams.get('season') === String(seasonView)) {
            return;
        }
        const next = new URLSearchParams(searchParams);
        next.set('season', String(seasonView));
        setSearchParams(next, { replace: true });
    }, [seasonView]);

    const eloTrend = useMemo(() => buildTrend(allEloRows, seasonView), [allEloRows, seasonView]);
    const rankTrend = useMemo(() => buildTrend(allRankPoints, seasonView), [allRankPoints, seasonView]);
    const teamCoachHistory = useMemo(
        () => (team ? buildTeamCoachHistory(coachTransactions, team.name, discordIdToUsername) : []),
        [coachTransactions, team, discordIdToUsername]
    );

    if (loading) {
        return (
            <PageWrap>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            </PageWrap>
        );
    }
    if (error || !team) {
        return (
            <PageWrap>
                <Alert severity="error">{error || 'Team not found.'}</Alert>
            </PageWrap>
        );
    }

    const lineColor = pickTeamColor(mark, mode);
    const isAllTime = seasonView === 'alltime';
    const postseasonAvailable = isAllTime ? postseasonSeasons.size > 0 : postseasonSeasons.has(seasonView);
    const shownScope = postseasonAvailable ? scope : 'regular';
    const activeStats = isAllTime ? (shownScope === 'postseason' ? allTimePostseasonStats : allTimeStats) : seasonStats;
    const rangeLabel = isAllTime ? 'all seasons' : `Season ${seasonView}`;

    const tabOptions = [
        { value: 'overview', label: 'Overview' },
        { value: 'schedule', label: 'Schedule' },
        { value: 'trends', label: 'Trends' },
        { value: 'stats', label: 'Stats' },
        { value: 'coaches', label: 'Coaches' },
    ];
    const shownTab = tabOptions.some((option) => option.value === searchParams.get('tab'))
        ? searchParams.get('tab')
        : 'overview';
    const setTab = (next) => {
        const params = new URLSearchParams(searchParams);
        if (next === 'overview') {
            params.delete('tab');
        } else {
            params.set('tab', next);
        }
        setSearchParams(params, { replace: true });
    };

    const metricWeeks = Math.max(
        0,
        ...RANKING_METRIC_TYPES.map((entry) => (metricTrends[entry.value]?.points || []).length)
    );
    const waitingTrends = [
        rankTrend.length < 2 &&
            (rankTrend.length === 0
                ? 'Coaches Poll trend (not ranked yet)'
                : 'Coaches Poll trend (ranked once so far)'),
        metricWeeks < 2 &&
            `computer ranking trends (${metricWeeks === 1 ? 'one week' : 'no weeks'} of rankings published for Season ${seasonView})`,
    ].filter(Boolean);
    const hasTrends =
        eloTrend.length > 1 ||
        rankTrend.length > 1 ||
        (!isAllTime &&
            (metricTrendsLoading ||
                RANKING_METRIC_TYPES.some((entry) => (metricTrends[entry.value]?.points || []).length > 1)));

    return (
        <PageWrap>
            <TeamHeader team={team} mark={mark} pollRank={pollRank} />

            <Box sx={{ mt: '12px' }}>
                <PageTabs
                    value={shownTab}
                    onChange={setTab}
                    options={tabOptions}
                    ariaLabel="Team sections"
                    trailing={
                        <>
                            {postseasonAvailable && shownTab === 'stats' && (
                                <SegTabs
                                    value={shownScope}
                                    onChange={changeScope}
                                    options={SCOPE_TABS}
                                    ariaLabel="Stats scope"
                                />
                            )}
                            <SelectPill
                                label="Viewing"
                                value={seasonView ?? ''}
                                onChange={(next) => setSeasonView(next === 'alltime' ? 'alltime' : Number(next))}
                                options={[
                                    { value: 'alltime', label: 'All-time' },
                                    ...seasons.map((option) => ({ value: option, label: `Season ${option}` })),
                                ]}
                            />
                            {checkIfUserIsAdmin() && (
                                <>
                                    <Box
                                        component="button"
                                        type="button"
                                        onClick={() => setEditing(true)}
                                        sx={pillHeight(secondaryButtonSx)}
                                    >
                                        Edit team
                                    </Box>
                                    <Box
                                        component={Link}
                                        to={`/team-appearance/${teamId}`}
                                        sx={pillHeight(secondaryButtonSx)}
                                    >
                                        Edit appearance
                                    </Box>
                                </>
                            )}
                        </>
                    }
                />
            </Box>

            {shownTab === 'overview' && (
                <>
                    <SectionTitle title="Program history" />
                    <TileGrid minTile={130}>
                        <StatTile
                            compact
                            label="All-time record"
                            value={`${team.overall_wins || 0}-${team.overall_losses || 0}`}
                            caption={`${team.overall_conference_wins || 0}-${team.overall_conference_losses || 0} conference`}
                        />
                        <StatTile compact label="National titles" value={team.national_championship_wins || 0} />
                        <StatTile
                            compact
                            label="Playoff record"
                            value={`${team.playoff_wins || 0}-${team.playoff_losses || 0}`}
                        />
                        <StatTile
                            compact
                            label="Bowl record"
                            value={`${team.bowl_wins || 0}-${team.bowl_losses || 0}`}
                        />
                        <StatTile compact label="Conference titles" value={team.conference_championship_wins || 0} />
                        <StatTile
                            compact
                            label="All-time ELO"
                            value={team.overall_elo != null ? Math.round(team.overall_elo) : '-'}
                        />
                    </TileGrid>
                    {!isAllTime && (
                        <>
                            <SectionTitle title="Computer Rankings" note={rangeLabel} />
                            {metricsLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                    <CircularProgress size={22} />
                                </Box>
                            ) : Object.values(metricStats.values).some((value) => value != null) ? (
                                <TileGrid
                                    minTile={100}
                                    sx={{
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 130px))',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {RANKING_METRIC_TYPES.filter(
                                        (entry) => metricStats.values[entry.value] != null
                                    ).map((entry) => (
                                        <StatTile
                                            key={entry.value}
                                            compact
                                            label={rankingMetricLabel(entry.value)}
                                            value={metricStats.values[entry.value].toFixed(2)}
                                            caption={
                                                metricStats.ranks[entry.value] != null
                                                    ? `#${metricStats.ranks[entry.value]} of ${metricStats.totals[entry.value]}`
                                                    : undefined
                                            }
                                        />
                                    ))}
                                </TileGrid>
                            ) : (
                                <Panel>
                                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                                        Computer rankings for Season {seasonView} aren&apos;t available yet, check back
                                        once games have been played this season.
                                    </Box>
                                </Panel>
                            )}
                        </>
                    )}
                </>
            )}
            {shownTab === 'schedule' && (
                <TeamSchedule
                    teamName={team.name}
                    schedule={schedule}
                    season={seasonView}
                    teamsMap={teamsMap}
                    loading={seasonLoading}
                    showSeason={isAllTime}
                    subtitle={isAllTime ? 'Last 12 games' : undefined}
                />
            )}
            {shownTab === 'trends' && !hasTrends && (
                <Panel>
                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                        Trends need at least two weeks of data.
                    </Box>
                </Panel>
            )}
            {shownTab === 'trends' && hasTrends && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: '16px',
                    }}
                >
                    {eloTrend.length > 1 && (
                        <Panel header="ELO trend" more={rangeLabel}>
                            <Box sx={{ p: 2 }}>
                                <MiniTrendChart
                                    data={eloTrend}
                                    color={lineColor}
                                    formatLabel={(p) => `Season ${p.season}, Week ${p.realWeek}, ELO ${p.value}`}
                                />
                            </Box>
                        </Panel>
                    )}
                    {rankTrend.length > 1 && (
                        <Panel header="Coaches Poll trend" more={rangeLabel}>
                            <Box sx={{ p: 2 }}>
                                <MiniTrendChart
                                    data={rankTrend}
                                    color={lineColor}
                                    reversed
                                    formatLabel={(p) => `Season ${p.season}, Week ${p.realWeek}, #${p.value}`}
                                />
                            </Box>
                        </Panel>
                    )}
                    {!isAllTime && metricTrendsLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={26} />
                        </Box>
                    )}
                    {!isAllTime &&
                        !metricTrendsLoading &&
                        RANKING_METRIC_TYPES.map((entry) => {
                            const { points = [], maxTeams = 25 } = metricTrends[entry.value] || {};
                            if (points.length < 2) {
                                return null;
                            }
                            return (
                                <Panel
                                    key={entry.value}
                                    header={rankingMetricShortLabel(entry.value)}
                                    more={`${points.length} weeks`}
                                >
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
            {shownTab === 'trends' && !isAllTime && !metricTrendsLoading && waitingTrends.length > 0 && (
                <Box sx={{ mt: '12px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    Waiting on more data: {waitingTrends.join(', ')}.
                </Box>
            )}
            {shownTab === 'stats' && (
                <Panel>
                    {seasonLoading && !isAllTime ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={26} />
                        </Box>
                    ) : activeStats ? (
                        <SeasonStatTable stats={activeStats} />
                    ) : (
                        <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No statistics.</Box>
                    )}
                </Panel>
            )}
            {shownTab === 'coaches' &&
                (teamCoachHistory.length > 0 ? (
                    <DataTable minWidth={420}>
                        <thead>
                            <tr>
                                <th className="lft stick">Coach</th>
                                <th className="lft">Position</th>
                                <th className="lft">From</th>
                                <th className="lft">To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamCoachHistory.map((stint, index) => {
                                const active = !stint.endDate;
                                return (
                                    <tr key={`${stint.coach}-${stint.position}-${index}`}>
                                        <td className="lft stick">
                                            <Box
                                                component={Link}
                                                to={`/user-details/${stint.coach}`}
                                                sx={{
                                                    color: 'var(--brand)',
                                                    fontWeight: 700,
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                @{stint.coach}
                                            </Box>
                                            {active && (
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        ml: '8px',
                                                        fontSize: '0.56rem',
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.04em',
                                                        color: 'var(--field)',
                                                        border: '1px solid color-mix(in srgb, var(--field) 55%, var(--line))',
                                                        borderRadius: 'var(--r-sm)',
                                                        px: '5px',
                                                        py: '2px',
                                                    }}
                                                >
                                                    Current
                                                </Box>
                                            )}
                                        </td>
                                        <td className="lft">
                                            {formatPosition(stint.position)}
                                            {stint.interim && ' (interim)'}
                                        </td>
                                        <td className="lft">
                                            {stint.startDate ? formatStintDate(stint.startDate) : 'Unknown'}
                                        </td>
                                        <td className="lft" style={{ color: active ? 'var(--field)' : undefined }}>
                                            {active ? 'Present' : formatStintDate(stint.endDate)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </DataTable>
                ) : (
                    <Panel>
                        <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                            No coaching history on record.
                        </Box>
                    </Panel>
                ))}
            {editing && (
                <TeamEditDialog
                    teamId={teamId}
                    onClose={() => setEditing(false)}
                    onSaved={() => {
                        setEditing(false);
                        setVersion((current) => current + 1);
                    }}
                />
            )}
        </PageWrap>
    );
};

export default TeamDetails;
