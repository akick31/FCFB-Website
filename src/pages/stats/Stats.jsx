import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import SegTabs from '../../components/ui/SegTabs';
import SelectPill from '../../components/ui/SelectPill';
import Panel from '../../components/ui/Panel';
import SectionTitle from '../../components/ui/SectionTitle';
import DataTable from '../../components/ui/DataTable';
import StatTile, { TileGrid } from '../../components/ui/StatTile';
import ConferenceMark from '../../components/ui/ConferenceMark';
import StatLeaderboardCard from '../../components/stats/StatLeaderboardCard';
import StatLeaderboardDetail from '../../components/stats/StatLeaderboardDetail';
import Pager from '../../components/ui/Pager';
import { getFilteredSeasonStats } from '../../api/seasonStatsApi';
import { getFilteredLeagueStats } from '../../api/leagueStatsApi';
import { getFilteredConferenceStats } from '../../api/conferenceStatsApi';
import { getFilteredPlaybookStats } from '../../api/playbookStatsApi';
import { getAllSeasons } from '../../api/seasonApi';
import { conferenceLabel } from '../../components/constants/conferences';
import { formatOffensivePlaybook } from '../../utils/formatText';
import { STAT_CATALOG, STAT_BY_KEY, buildLeaderboard, seasonHasStarted, formatValue, LEAGUE_STAT_GROUPS, CONFERENCE_COLUMNS, aggregateAllTimeStats, aggregateStatRows, aggregateStatRowsByKey } from '../../utils/statsCatalog';
import { useSeo } from '../../hooks/useSeo';

const SUB_TABS = [
    { value: 'leaderboard', label: 'Leaderboard' },
    { value: 'league', label: 'League' },
    { value: 'conference', label: 'Conference' },
    { value: 'playbooks', label: 'Playbooks' },
];
const SUB_VALUES = SUB_TABS.map((tab) => tab.value);
const CARDS_PER_PAGE = 9;

const LEAGUE_FIELD_AGGS = {
    total_teams: 'latest',
    total_yards: { agg: 'sum' }, pass_yards: { agg: 'sum' }, rush_yards: { agg: 'sum' },
    pass_touchdowns: { agg: 'sum' }, rush_touchdowns: { agg: 'sum' }, first_downs: { agg: 'sum' },
    average_yards_per_play: { agg: 'ypp', yards: 'total_yards' },
    pass_attempts: { agg: 'sum' }, pass_completions: { agg: 'sum' }, pass_completion_percentage: { agg: 'rate', num: 'pass_completions', den: 'pass_attempts' },
    pass_successes: { agg: 'sum' }, pass_success_percentage: { agg: 'rate', num: 'pass_successes', den: 'pass_attempts' },
    pass_interceptions: { agg: 'sum' }, longest_pass: { agg: 'max' },
    rush_attempts: { agg: 'sum' }, rush_successes: { agg: 'sum' }, rush_success_percentage: { agg: 'rate', num: 'rush_successes', den: 'rush_attempts' }, longest_run: { agg: 'max' },
    sacks_forced: { agg: 'sum' }, sacks_allowed: { agg: 'sum' }, interceptions_forced: { agg: 'sum' },
    fumbles_forced: { agg: 'sum' }, fumbles_recovered: { agg: 'sum' }, defensive_touchdowns: { agg: 'sum' },
    field_goals_made: { agg: 'sum' }, field_goals_attempted: { agg: 'sum' }, field_goal_percentage: { agg: 'rate', num: 'field_goals_made', den: 'field_goals_attempted' },
    longest_field_goal: { agg: 'max' }, punts: { agg: 'sum' }, longest_punt: { agg: 'max' },
    kickoff_return_touchdowns: { agg: 'sum' }, punt_return_touchdowns: { agg: 'sum' },
    average_offensive_diff: { agg: 'mean' }, average_defensive_diff: { agg: 'mean' },
    average_offensive_special_teams_diff: { agg: 'mean' }, average_defensive_special_teams_diff: { agg: 'mean' },
    average_diff: { agg: 'mean' }, average_response_speed: { agg: 'mean' },
};

const CONFERENCE_FIELD_AGGS = {
    total_teams: 'latest',
    total_yards: { agg: 'sum' }, average_yards_per_play: { agg: 'ypp', yards: 'total_yards' },
    pass_touchdowns: { agg: 'sum' }, rush_touchdowns: { agg: 'sum' }, first_downs: { agg: 'sum' },
    third_down_conversion_percentage: { agg: 'rate', num: 'third_down_conversion_success', den: 'third_down_conversion_attempts' },
    red_zone_success_percentage: { agg: 'rate', num: 'red_zone_successes', den: 'red_zone_attempts' },
    sacks_forced: { agg: 'sum' }, interceptions_forced: { agg: 'sum' }, turnover_differential: { agg: 'sum' },
    longest_field_goal: { agg: 'max' }, average_punt_length: { agg: 'wavg', weight: 'punts_attempted' },
    average_response_speed: { agg: 'mean' }, average_offensive_diff: { agg: 'mean' }, average_defensive_diff: { agg: 'mean' },
};

const fmt = (value) => (value == null ? '-' : Number(value).toLocaleString());
const dec = (value, places = 2) => (value == null ? '-' : Number(value).toFixed(places));

const confValue = (conference) => (typeof conference === 'string' ? conference : conference?.name);
const unwrapContent = (result) => (Array.isArray(result?.content) ? result.content : Array.isArray(result) ? result : []);

const Stats = () => {
    const { sub, statKey } = useParams();
    const navigate = useNavigate();
    const activeSub = SUB_VALUES.includes(sub) ? sub : 'leaderboard';

    const [seasons, setSeasons] = useState([]);
    const [season, setSeason] = useState(null);
    const [statFilter, setStatFilter] = useState('');
    const [cardPage, setCardPage] = useState(0);
    const [count, setCount] = useState(5);

    const [seasonStatRows, setSeasonStatRows] = useState([]);
    const [league, setLeague] = useState(null);
    const [conferences, setConferences] = useState([]);
    const [playbooks, setPlaybooks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useSeo({ title: 'Stats | FCFB', description: 'League leaderboards, records, and conference and playbook statistics in Fake College Football.' });

    useEffect(() => {
        if (!sub) navigate('/stats/leaderboard', { replace: true });
    }, [sub, navigate]);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const all = await getAllSeasons();
                if (!active) return;
                const started = all.filter(seasonHasStarted).map((entry) => entry.season_number ?? entry.seasonNumber).filter((value) => value != null).sort((a, b) => b - a);
                setSeasons(started);
                setSeason(started[0] ?? 11);
            } catch {
                if (active) setSeason(11);
            }
        })();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (season == null) return;
        let active = true;
        (async () => {
            try {
                setLoading(true);
                setError('');
                if (activeSub === 'leaderboard' && season === 'all') {
                    const perSeason = await Promise.all(seasons.map((number) => getFilteredSeasonStats(null, null, number, null, 0, 1000)));
                    const rows = perSeason.flatMap((result) => unwrapContent(result));
                    if (active) setSeasonStatRows(aggregateAllTimeStats(rows));
                } else if (activeSub === 'leaderboard') {
                    const rows = unwrapContent(await getFilteredSeasonStats(null, null, season, null, 0, 1000));
                    if (active) setSeasonStatRows(rows);
                } else if (activeSub === 'league' && season === 'all') {
                    const perSeason = await Promise.all(seasons.map((number) => getFilteredLeagueStats(null, number, 0, 1000)));
                    const rows = perSeason.flatMap((result) => unwrapContent(result));
                    if (active) setLeague(rows.length ? aggregateStatRows(rows, LEAGUE_FIELD_AGGS) : null);
                } else if (activeSub === 'league') {
                    const rows = unwrapContent(await getFilteredLeagueStats(null, season, 0, 1000));
                    if (active) setLeague(rows[0] || null);
                } else if (activeSub === 'conference' && season === 'all') {
                    const perSeason = await Promise.all(seasons.map((number) => getFilteredConferenceStats(null, number, null, 0, 1000)));
                    const rows = perSeason.flatMap((result) => unwrapContent(result));
                    if (active) setConferences(aggregateStatRowsByKey(rows, 'conference', CONFERENCE_FIELD_AGGS));
                } else if (activeSub === 'conference') {
                    const rows = unwrapContent(await getFilteredConferenceStats(null, season, null, 0, 1000));
                    if (active) setConferences(rows);
                } else if (activeSub === 'playbooks' && season === 'all') {
                    const perSeason = await Promise.all(seasons.map((number) => getFilteredPlaybookStats(null, null, number, 0, 1000)));
                    const rows = perSeason.flatMap((result) => unwrapContent(result));
                    if (active) setPlaybooks(rows);
                } else if (activeSub === 'playbooks') {
                    const rows = unwrapContent(await getFilteredPlaybookStats(null, null, season, 0, 1000));
                    if (active) setPlaybooks(rows);
                }
            } catch {
                if (active) setError('Failed to load stats. Please try again.');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [activeSub, season, seasons]);

    useEffect(() => { setCardPage(0); }, [statFilter, season]);

    const filteredCatalog = useMemo(() => (statFilter && STAT_BY_KEY[statFilter] ? [STAT_BY_KEY[statFilter]] : STAT_CATALOG), [statFilter]);

    const aggregatedPlaybooks = useMemo(() => {
        const byPlaybook = new Map();
        playbooks.forEach((row) => {
            const key = row.offensive_playbook;
            const current = byPlaybook.get(key) || { offensive_playbook: key, total_teams: 0, total_games: 0, total_yards: 0, pass_yards: 0, rush_yards: 0, pass_touchdowns: 0, rush_touchdowns: 0, diffWeight: 0, diffSum: 0 };
            current.total_teams += row.total_teams || 0;
            current.total_games += row.total_games || 0;
            current.total_yards += row.total_yards || 0;
            current.pass_yards += row.pass_yards || 0;
            current.rush_yards += row.rush_yards || 0;
            current.pass_touchdowns += row.pass_touchdowns || 0;
            current.rush_touchdowns += row.rush_touchdowns || 0;
            if (row.average_offensive_diff != null && row.total_teams) {
                current.diffSum += row.average_offensive_diff * row.total_teams;
                current.diffWeight += row.total_teams;
            }
            byPlaybook.set(key, current);
        });
        return [...byPlaybook.values()]
            .map((row) => ({ ...row, yards_per_play: row.total_games ? row.total_yards / (row.total_games * 130) : null, average_offensive_diff: row.diffWeight ? row.diffSum / row.diffWeight : null }))
            .sort((a, b) => b.total_yards - a.total_yards);
    }, [playbooks]);

    const maxPlaybookYards = useMemo(() => Math.max(1, ...aggregatedPlaybooks.map((row) => row.total_yards)), [aggregatedPlaybooks]);
    const sortedConferences = useMemo(() => [...conferences].sort((a, b) => (b.average_offensive_diff || 0) - (a.average_offensive_diff || 0)), [conferences]);

    const controlSx = { flex: '1 1 200px', minWidth: 180, height: 38 };
    const seasonOptions = [
        { value: 'all', label: 'All-time' },
        ...seasons.map((number) => ({ value: number, label: `Season ${number}` })),
    ];
    const seasonControl = season != null && seasons.length > 0 && (
        <SelectPill label="Season" value={season} onChange={(value) => setSeason(value === 'all' ? 'all' : Number(value))} options={seasonOptions} sx={controlSx} />
    );

    const detailStat = statKey ? STAT_BY_KEY[statKey] : null;

    const renderLeaderboard = () => {
        if (detailStat) {
            return <StatLeaderboardDetail stat={detailStat} rows={buildLeaderboard(seasonStatRows, detailStat)} onBack={() => navigate('/stats/leaderboard')} />;
        }
        const pageCount = Math.max(1, Math.ceil(filteredCatalog.length / CARDS_PER_PAGE));
        const page = Math.min(cardPage, pageCount - 1);
        const visible = filteredCatalog.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);
        const statOptions = [{ value: '', label: 'All stats' }, ...STAT_CATALOG.map((stat) => ({ value: stat.key, label: stat.label }))];
        return (
            <>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    {seasonControl}
                    <SelectPill label="Stat" value={statFilter} onChange={setStatFilter} options={statOptions} sx={controlSx} ariaLabel="Choose a stat" />
                    <SelectPill label="Show" value={count} onChange={(value) => setCount(Number(value))} options={[{ value: 5, label: 'Top 5' }, { value: 10, label: 'Top 10' }, { value: 25, label: 'Top 25' }]} sx={{ height: 38 }} />
                </Box>
                <Box sx={{ color: 'var(--text-muted)', fontSize: '0.8rem', mb: 2 }}>Click a stat title to open its full leaderboard.</Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {visible.map((stat) => (
                        <StatLeaderboardCard key={stat.key} title={stat.label} statKey={stat.key} rows={buildLeaderboard(seasonStatRows, stat)} count={count} format={stat.format} onOpen={() => navigate(`/stats/leaderboard/${stat.key}`)} />
                    ))}
                </Box>
                <Pager page={page} pageCount={pageCount} onChange={setCardPage} />
            </>
        );
    };

    const leagueStatRow = (key, label, type) => (
        <Box key={key} sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 1, px: 1.75, py: 0.9, borderBottom: '1px solid var(--line-soft)', fontSize: '0.84rem' }}>
            <Box component="span" sx={{ color: 'var(--text-muted)' }}>{label}</Box>
            <Box component="span" className="num" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatValue(league[key], type)}</Box>
        </Box>
    );

    const renderLeague = () => {
        if (!league) return <Box sx={{ color: 'var(--text-muted)', py: 4, textAlign: 'center' }}>No league data available.</Box>;
        return (
            <>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>{seasonControl}</Box>
                <TileGrid sx={{ mb: '16px' }}>
                    <StatTile label="Teams" value={fmt(league.total_teams)} />
                    <StatTile label="Total yards" value={fmt(league.total_yards)} />
                    <StatTile label="Yards / play" value={dec(league.average_yards_per_play)} />
                    <StatTile label="Passing yards" value={fmt(league.pass_yards)} />
                    <StatTile label="Rushing yards" value={fmt(league.rush_yards)} />
                    <StatTile label="Average response time" value={formatValue(league.average_response_speed, 'time')} />
                </TileGrid>
                {LEAGUE_STAT_GROUPS.filter(([group]) => group === 'Ratings & pace').map(([group, rows]) => (
                    <Box key={group} sx={{ mb: '16px' }}>
                        <Panel header={group}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                                {rows.map(([key, label, type]) => leagueStatRow(key, label, type))}
                            </Box>
                        </Panel>
                    </Box>
                ))}
                <Box sx={{ columnCount: { xs: 1, md: 2 }, columnGap: '16px' }}>
                    {LEAGUE_STAT_GROUPS.filter(([group]) => group !== 'Ratings & pace').map(([group, rows]) => (
                        <Box key={group} sx={{ breakInside: 'avoid', mb: '16px' }}>
                            <Panel header={group}>
                                {rows.map(([key, label, type]) => leagueStatRow(key, label, type))}
                            </Panel>
                        </Box>
                    ))}
                </Box>
            </>
        );
    };

    const renderConference = () => (
        <>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>{seasonControl}</Box>
            <DataTable minWidth={1100}>
                <thead>
                    <tr>
                        <th className="lft stick">Conference</th>
                        {CONFERENCE_COLUMNS.map(([key, label]) => <th key={key}>{label}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {sortedConferences.map((row) => {
                        const value = confValue(row.conference);
                        return (
                            <tr key={value}>
                                <td className="lft stick">
                                    <div className="teamcell"><ConferenceMark conference={value} size={20} /><span className="nm">{conferenceLabel(value)}</span></div>
                                </td>
                                {CONFERENCE_COLUMNS.map(([key, , type]) => <td key={key} className="num">{formatValue(row[key], type)}</td>)}
                            </tr>
                        );
                    })}
                </tbody>
            </DataTable>
        </>
    );

    const renderPlaybooks = () => (
        <>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>{seasonControl}</Box>
            <DataTable minWidth={760}>
                <thead>
                    <tr>
                        <th className="lft stick">Offensive Playbook</th>
                        <th>Teams</th><th>Games</th><th>Total Yds</th><th>Pass Yds</th><th>Rush Yds</th><th>Yds/Play</th><th>Pass TD</th><th>Rush TD</th><th>Off Diff</th>
                    </tr>
                </thead>
                <tbody>
                    {aggregatedPlaybooks.map((row) => (
                        <tr key={row.offensive_playbook}>
                            <td className="lft stick"><span className="nm">{formatOffensivePlaybook(row.offensive_playbook)}</span></td>
                            <td className="num">{fmt(row.total_teams)}</td>
                            <td className="num">{fmt(row.total_games)}</td>
                            <td className="num">{fmt(row.total_yards)}</td>
                            <td className="num">{fmt(row.pass_yards)}</td>
                            <td className="num">{fmt(row.rush_yards)}</td>
                            <td className="num">{dec(row.yards_per_play)}</td>
                            <td className="num">{fmt(row.pass_touchdowns)}</td>
                            <td className="num">{fmt(row.rush_touchdowns)}</td>
                            <td className="num">{dec(row.average_offensive_diff, 0)}</td>
                        </tr>
                    ))}
                </tbody>
            </DataTable>
            <SectionTitle title="Total yards by playbook" />
            <Panel>
                <Box sx={{ p: 2 }}>
                    {aggregatedPlaybooks.map((row) => (
                        <Box key={row.offensive_playbook} sx={{ display: 'grid', gridTemplateColumns: { xs: '110px 1fr 50px', sm: '170px 1fr 66px' }, alignItems: 'center', gap: 1.25, py: 0.75, fontSize: '0.8rem' }}>
                            <Box component="span" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatOffensivePlaybook(row.offensive_playbook)}</Box>
                            <Box sx={{ height: 16, background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
                                <Box sx={{ height: '100%', borderRadius: '3px', width: `${(row.total_yards / maxPlaybookYards) * 100}%`, background: 'var(--brand)' }} />
                            </Box>
                            <Box component="span" className="num" sx={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{(row.total_yards / 1000).toFixed(1)}k</Box>
                        </Box>
                    ))}
                </Box>
            </Panel>
        </>
    );

    return (
        <PageWrap>
            <PageHeading title="Stats">
                <SegTabs value={activeSub} onChange={(value) => navigate(`/stats/${value}`)} options={SUB_TABS} ariaLabel="Stats view" />
            </PageHeading>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
            ) : (
                <>
                    {activeSub === 'leaderboard' && renderLeaderboard()}
                    {activeSub === 'league' && renderLeague()}
                    {activeSub === 'conference' && renderConference()}
                    {activeSub === 'playbooks' && renderPlaybooks()}
                </>
            )}
        </PageWrap>
    );
};

export default Stats;
