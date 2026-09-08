import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { LineChart, Line, BarChart, Bar, Cell, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import Panel from '../../components/ui/Panel';
import SectionTitle from '../../components/ui/SectionTitle';
import SearchableSelect from '../../components/ui/SearchableSelect';
import SelectPill from '../../components/ui/SelectPill';
import TeamMark from '../../components/ui/TeamMark';
import { TileGrid } from '../../components/ui/StatTile';
import { useTeamsMap, toEntry } from '../../hooks/useTeamsMap';
import { useColorMode } from '../../theme/ColorModeContext';
import { pickTeamColor } from '../../utils/teamColor';
import { getAllTeamsIncludingInactive } from '../../api/teamApi';
import { getAllUsers } from '../../api/userApi';
import { getAllPlaysByTeam, getAllPlaysByDiscordId } from '../../api/playApi';
import { getGamesByIds } from '../../api/gameApi';
import { getFilteredSeasonStats } from '../../api/seasonStatsApi';
import { getCoachStats } from '../../api/coachStatsApi';
import { getRankingsHistory } from '../../api/rankingsHistoryApi.jsx';
import { orderedGameIdsFromPlays } from '../../utils/scoutingReport';
import { buildTeamRankings, buildCoachRankings, ordinal } from '../../utils/leagueRankings';
import { buildMatchupHistory, matchupCurrentStreak, matchupLongestStreak, matchupLargestMargin } from '../../utils/headToHead';
import { useSeo } from '../../hooks/useSeo';

const statsRows = (result) => {
    if (Array.isArray(result)) return result;
    if (result?.content) return result.content;
    return result ? [result] : [];
};

const CONTROL_HEIGHT = '34px';
const inputSx = { height: CONTROL_HEIGHT, boxSizing: 'border-box', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: 0, font: 'inherit', fontSize: '0.8rem' };
const btnSx = { height: CONTROL_HEIGHT, boxSizing: 'border-box', display: 'flex', alignItems: 'center', border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.5, cursor: 'not-allowed' } };
const labelSx = { fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' };
const pct = (value) => (value == null ? '-' : value.toFixed(3).replace(/^0/, ''));
const seasonRange = (start, end) => (start === end ? `Season ${start}` : `Season ${start}-Season ${end}`);
const MODE_OPTIONS = [{ value: 'team', label: 'Team' }, { value: 'coach', label: 'Coach' }];

const RankCard = ({ label, value, rank, totalEntities, accent }) => (
    <Box sx={{ background: 'var(--surface)', border: '1px solid var(--line)', borderTop: `3px solid ${accent}`, borderRadius: 'var(--r)', p: '14px', textAlign: 'center' }}>
        <Box sx={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>{label}</Box>
        {value != null && <Box sx={{ fontSize: '0.7rem', color: 'var(--text-muted)', mt: '2px' }}>{value}</Box>}
        <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, fontSize: '2.1rem', lineHeight: 1, mt: '6px', color: 'var(--text)' }}>{ordinal(rank)}</Box>
        <Box sx={{ fontSize: '0.66rem', color: 'var(--text-dim)', mt: '2px' }}>of {totalEntities}</Box>
    </Box>
);

RankCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.node,
    rank: PropTypes.number,
    totalEntities: PropTypes.number.isRequired,
    accent: PropTypes.string.isRequired,
};

const EntityRankGrid = ({ entityName, rankings, accent, rankLabel }) => {
    if (!rankings) return <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No ranking data for {entityName}.</Box>;
    const cards = [
        { label: 'All-time record', value: `${pct(rankings.winPct.value)} · ${rankings.record.wins}-${rankings.record.losses}`, rank: rankings.winPct.rank },
        { label: 'National championships', value: rankings.nationalChampionships.value, rank: rankings.nationalChampionships.rank },
        { label: 'Conference championships', value: rankings.conferenceChampionships.value, rank: rankings.conferenceChampionships.rank },
        { label: 'Bowl games', value: rankings.bowlGames.value, rank: rankings.bowlGames.rank },
        { label: 'Wins all time', value: rankings.wins.value, rank: rankings.wins.rank },
        { label: 'Losses all time', value: rankings.losses.value, rank: rankings.losses.rank },
        { label: 'Bowl record', value: `${pct(rankings.bowlWinPct.value)} · ${rankings.bowlRecord.wins}-${rankings.bowlRecord.losses}`, rank: rankings.bowlWinPct.rank },
        { label: 'Weeks in coaches poll', value: rankings.weeksRanked.value, rank: rankings.weeksRanked.rank },
        { label: 'Weeks at #1', value: rankings.weeksAtOne.value, rank: rankings.weeksAtOne.rank },
    ];
    return (
        <>
            <Box sx={{ ...labelSx, mb: '8px' }}>{rankLabel}</Box>
            <TileGrid minTile={140}>
                {cards.map((card) => (
                    <RankCard key={card.label} label={card.label} value={card.value} rank={card.rank} totalEntities={rankings.totalEntities} accent={accent} />
                ))}
            </TileGrid>
        </>
    );
};

EntityRankGrid.propTypes = { entityName: PropTypes.string.isRequired, rankings: PropTypes.object, accent: PropTypes.string.isRequired, rankLabel: PropTypes.string.isRequired };

const WinPctTrendChart = ({ seriesA, seriesB, nameA, nameB, colorA, colorB }) => {
    const seasons = [...new Set([...seriesA, ...seriesB].map((row) => row.season_number))].sort((a, b) => a - b);
    const data = seasons.map((season) => {
        const rowA = seriesA.find((row) => row.season_number === season);
        const rowB = seriesB.find((row) => row.season_number === season);
        return {
            season,
            [nameA]: rowA ? rowA.wins / (rowA.wins + rowA.losses || 1) : null,
            [nameB]: rowB ? rowB.wins / (rowB.wins + rowB.losses || 1) : null,
        };
    });
    return (
        <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 14, bottom: 20, left: 4 }}>
                    <CartesianGrid stroke="var(--line-soft)" vertical={false} />
                    <XAxis dataKey="season" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} axisLine={false} label={{ value: 'Season', position: 'insideBottom', offset: -8, fontSize: 11, fill: 'var(--text-dim)' }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} axisLine={false} width={46} label={{ value: 'Win %', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--text-dim)' }} />
                    <Tooltip labelFormatter={(season) => `Season ${season}`} formatter={(value) => (value == null ? '-' : value.toFixed(3))} />
                    <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: '0.72rem' }} />
                    <Line type="monotone" dataKey={nameA} stroke={colorA} strokeWidth={2.4} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
                    <Line type="monotone" dataKey={nameB} stroke={colorB} strokeWidth={2.4} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};

WinPctTrendChart.propTypes = {
    seriesA: PropTypes.array.isRequired,
    seriesB: PropTypes.array.isRequired,
    nameA: PropTypes.string.isRequired,
    nameB: PropTypes.string.isRequired,
    colorA: PropTypes.string.isRequired,
    colorB: PropTypes.string.isRequired,
};

const MarginBarChart = ({ matchups, colorA, colorB }) => {
    const data = matchups.map((matchup, index) => ({
        index,
        season: matchup.season,
        margin: matchup.winner === 'A' ? -Math.abs(matchup.scoreA - matchup.scoreB) : Math.abs(matchup.scoreA - matchup.scoreB),
        winner: matchup.winner,
    }));
    return (
        <Box sx={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 14, bottom: 20, left: 4 }}>
                    <CartesianGrid stroke="var(--line-soft)" vertical={false} />
                    <XAxis dataKey="season" tick={{ fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} axisLine={false} label={{ value: 'Season', position: 'insideBottom', offset: -8, fontSize: 11, fill: 'var(--text-dim)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-dim)' }} tickLine={false} axisLine={false} width={46} label={{ value: 'Margin of victory', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--text-dim)' }} />
                    <ReferenceLine y={0} stroke="var(--text-dim)" />
                    <Tooltip labelFormatter={(season) => `Season ${season}`} formatter={(value, name, item) => [`${Math.abs(value)} pts`, item.payload.winner === 'A' ? 'A' : 'B']} />
                    <Bar dataKey="margin" isAnimationActive={false}>
                        {data.map((entry) => <Cell key={entry.index} fill={entry.winner === 'A' ? colorA : colorB} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};

MarginBarChart.propTypes = { matchups: PropTypes.array.isRequired, colorA: PropTypes.string.isRequired, colorB: PropTypes.string.isRequired };

const HeadToHead = () => {
    useSeo({ title: 'Winsipedia | Fake College Football', description: "Compare two teams or coaches' all-time standing and their history against each other." });

    const teamsMap = useTeamsMap();
    const { mode } = useColorMode();
    const [searchParams, setSearchParams] = useSearchParams();
    const autoRanRef = useRef(false);

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
        Promise.all([
            getAllTeamsIncludingInactive().catch(() => []),
            getAllUsers().catch(() => []),
            getRankingsHistory('all').catch(() => []),
        ])
            .then(([allTeams, allUsers, rankedGames]) => {
                setTeams(allTeams || []);
                setUsers(allUsers || []);
                setTeamRankings(buildTeamRankings(allTeams || [], rankedGames || []));
                setCoachRankings(buildCoachRankings(allUsers || [], rankedGames || []));
            })
            .finally(() => setLoadingLookups(false));
    }, []);

    const teamOptions = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)).map((team) => ({ value: team.name, label: team.name })), [teams]);
    const coachLabel = (user) => (user.team ? `${user.username} (${user.team})` : user.username);
    const coachOptions = useMemo(
        () => users.filter((user) => user.discord_id).map((user) => ({ value: user.discord_id, label: coachLabel(user) })).sort((a, b) => a.label.localeCompare(b.label)),
        [users],
    );

    const optionsFor = (entityMode) => (entityMode === 'coach' ? coachOptions : teamOptions);
    const resolvedA = useMemo(() => optionsFor(modeA).find((option) => option.label === labelA)?.value ?? null, [modeA, teamOptions, coachOptions, labelA]);
    const resolvedB = useMemo(() => optionsFor(modeB).find((option) => option.label === labelB)?.value ?? null, [modeB, teamOptions, coachOptions, labelB]);

    const userByDiscordId = useMemo(() => {
        const map = new Map();
        users.forEach((user) => { if (user.discord_id) map.set(user.discord_id, user); });
        return map;
    }, [users]);

    const markFor = (name) => teamsMap[name] || toEntry({ name });
    const colorFor = (name) => pickTeamColor(markFor(name), mode);

    const entityColor = (entityMode, id) => (entityMode === 'coach' ? colorFor(userByDiscordId.get(id)?.team) : colorFor(id));
    const entityDisplayName = (entityMode, id) => (entityMode === 'coach' ? (userByDiscordId.get(id)?.username || id) : id);

    const compare = async (overrideModeA = modeA, overrideModeB = modeB, overrideA = resolvedA, overrideB = resolvedB) => {
        if (!overrideA || !overrideB) {
            setError('Pick two teams or coaches first.');
            return;
        }
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
                overrideModeA === 'coach' ? getAllPlaysByDiscordId(overrideA).catch(() => []) : getAllPlaysByTeam(overrideA).catch(() => []),
                overrideModeB === 'coach' ? getAllPlaysByDiscordId(overrideB).catch(() => []) : getAllPlaysByTeam(overrideB).catch(() => []),
            ]);
            const gameIds = [...new Set([...orderedGameIdsFromPlays(playsA), ...orderedGameIdsFromPlays(playsB)])];
            const games = gameIds.length > 0 ? await getGamesByIds(gameIds) : [];
            const entityA = { mode: overrideModeA, id: overrideA };
            const entityB = { mode: overrideModeB, id: overrideB };
            const matchupHistory = buildMatchupHistory(games, entityA, entityB, playsA, playsB);

            setResultA({ mode: overrideModeA, id: overrideA, seasonRows: statsRows(seasonRowsA) });
            setResultB({ mode: overrideModeB, id: overrideB, seasonRows: statsRows(seasonRowsB) });
            setMatchups(matchupHistory);
            setSearchParams({ aType: overrideModeA, a: overrideA, bType: overrideModeB, b: overrideB }, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoRanRef.current || teamOptions.length === 0 || coachOptions.length === 0) return;
        autoRanRef.current = true;
        const urlModeA = searchParams.get('aType') === 'coach' ? 'coach' : 'team';
        const urlModeB = searchParams.get('bType') === 'coach' ? 'coach' : 'team';
        const urlA = searchParams.get('a');
        const urlB = searchParams.get('b');
        const optionA = optionsFor(urlModeA).find((option) => option.value === urlA);
        const optionB = optionsFor(urlModeB).find((option) => option.value === urlB);
        setModeA(urlModeA);
        setModeB(urlModeB);
        if (optionA) setLabelA(optionA.label);
        if (optionB) setLabelB(optionB.label);
        if (optionA && optionB) compare(urlModeA, urlModeB, optionA.value, optionB.value);
    }, [teamOptions, coachOptions]);

    const seriesTotals = useMemo(() => {
        if (!matchups || !resultA || !resultB) return null;
        let winsA = 0;
        let winsB = 0;
        let ties = 0;
        matchups.forEach((matchup) => {
            if (matchup.winner === 'A') winsA += 1;
            else if (matchup.winner === 'B') winsB += 1;
            else ties += 1;
        });
        return { winsA, winsB, ties, total: matchups.length };
    }, [matchups, resultA, resultB]);

    const streak = useMemo(() => (matchups ? matchupCurrentStreak(matchups) : null), [matchups]);
    const longestA = useMemo(() => (matchups ? matchupLongestStreak(matchups, 'A') : null), [matchups]);
    const longestB = useMemo(() => (matchups ? matchupLongestStreak(matchups, 'B') : null), [matchups]);
    const marginA = useMemo(() => (matchups ? matchupLargestMargin(matchups, 'A') : null), [matchups]);
    const marginB = useMemo(() => (matchups ? matchupLargestMargin(matchups, 'B') : null), [matchups]);

    const entityHeader = (result) => {
        const name = entityDisplayName(result.mode, result.id);
        if (result.mode === 'coach') {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                    <Box component="span">@{name}</Box>
                </Box>
            );
        }
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                <TeamMark team={markFor(name)} size={26} />
                <Box component="span">{name}</Box>
            </Box>
        );
    };

    const streakLabel = (side) => (side === 'A' ? entityDisplayName(resultA.mode, resultA.id) : entityDisplayName(resultB.mode, resultB.id));
    const streakColor = (side) => (side === 'A' ? entityColor(resultA.mode, resultA.id) : entityColor(resultB.mode, resultB.id));

    return (
        <PageWrap>
            <PageHeading eyebrow="Tools" title="Winsipedia" />
            <Box sx={{ fontSize: '0.82rem', color: 'var(--text-muted)', mt: '-10px', mb: '4px' }}>
                Winsipedia-style standings and head-to-head history for teams and coaches.
            </Box>
            <Box sx={{ fontSize: '0.68rem', color: 'var(--text-dim)', mb: '16px' }}>
                Covers the Discord bot era only. Data from the Reddit bot era is not included.
            </Box>

            <Panel sx={{ mb: '16px' }}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <Box sx={{ flex: '1 1 260px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={labelSx}>Side A</Box>
                                <SelectPill value={modeA} onChange={(next) => { setModeA(next); setLabelA(''); }} options={MODE_OPTIONS} ariaLabel="Side A type" />
                            </Box>
                            {loadingLookups ? <Box sx={{ ...inputSx, color: 'var(--text-dim)' }}>Loading…</Box> : (
                                <SearchableSelect id="h2h-a" value={labelA} onChange={setLabelA} options={optionsFor(modeA)} placeholder={modeA === 'coach' ? 'Search coaches…' : 'Search teams…'} />
                            )}
                        </Box>
                        <Box sx={{ flex: '1 1 260px', minWidth: 220, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={labelSx}>Side B</Box>
                                <SelectPill value={modeB} onChange={(next) => { setModeB(next); setLabelB(''); }} options={MODE_OPTIONS} ariaLabel="Side B type" />
                            </Box>
                            {loadingLookups ? <Box sx={{ ...inputSx, color: 'var(--text-dim)' }}>Loading…</Box> : (
                                <SearchableSelect id="h2h-b" value={labelB} onChange={setLabelB} options={optionsFor(modeB)} placeholder={modeB === 'coach' ? 'Search coaches…' : 'Search teams…'} />
                            )}
                        </Box>
                        <Box component="button" type="button" onClick={() => compare()} disabled={loading || !resolvedA || !resolvedB} sx={btnSx}>
                            {loading ? 'Comparing…' : 'Compare'}
                        </Box>
                    </Box>
                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
            </Panel>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}

            {!loading && resultA && resultB && (
                <>
                    <SectionTitle title="Standings" />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '16px', mb: '16px' }}>
                        <Box>
                            <Box sx={{ mb: '10px' }}>{entityHeader(resultA)}</Box>
                            <EntityRankGrid
                                entityName={entityDisplayName(resultA.mode, resultA.id)}
                                rankings={(resultA.mode === 'coach' ? coachRankings : teamRankings).get(resultA.id)}
                                accent={entityColor(resultA.mode, resultA.id)}
                                rankLabel={resultA.mode === 'coach' ? 'Coach ranks' : 'Team ranks'}
                            />
                        </Box>
                        <Box>
                            <Box sx={{ mb: '10px' }}>{entityHeader(resultB)}</Box>
                            <EntityRankGrid
                                entityName={entityDisplayName(resultB.mode, resultB.id)}
                                rankings={(resultB.mode === 'coach' ? coachRankings : teamRankings).get(resultB.id)}
                                accent={entityColor(resultB.mode, resultB.id)}
                                rankLabel={resultB.mode === 'coach' ? 'Coach ranks' : 'Team ranks'}
                            />
                        </Box>
                    </Box>

                    <SectionTitle title="Record (win %)" />
                    <Panel sx={{ mb: '16px' }}>
                        <Box sx={{ p: 2 }}>
                            <WinPctTrendChart
                                seriesA={resultA.seasonRows}
                                seriesB={resultB.seasonRows}
                                nameA={entityDisplayName(resultA.mode, resultA.id)}
                                nameB={entityDisplayName(resultB.mode, resultB.id)}
                                colorA={entityColor(resultA.mode, resultA.id)}
                                colorB={entityColor(resultB.mode, resultB.id)}
                            />
                        </Box>
                    </Panel>

                    <SectionTitle title="Head-to-head" />
                    <Panel sx={{ mb: '16px' }}>
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {seriesTotals && seriesTotals.total > 0 ? (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 70 }}>
                                            {resultA.mode === 'team' && <TeamMark team={markFor(resultA.id)} size={32} />}
                                            <Box sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{seriesTotals.winsA}</Box>
                                            <Box sx={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>Wins ({pct(seriesTotals.winsA / seriesTotals.total)})</Box>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', height: 26, borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--line)' }}>
                                                <Box sx={{ width: `${(seriesTotals.winsA / seriesTotals.total) * 100}%`, background: entityColor(resultA.mode, resultA.id) }} />
                                                {seriesTotals.ties > 0 && <Box sx={{ width: `${(seriesTotals.ties / seriesTotals.total) * 100}%`, background: 'var(--text-dim)' }} />}
                                                <Box sx={{ width: `${(seriesTotals.winsB / seriesTotals.total) * 100}%`, background: entityColor(resultB.mode, resultB.id) }} />
                                            </Box>
                                            {seriesTotals.ties > 0 && (
                                                <Box sx={{ textAlign: 'center', fontSize: '0.66rem', color: 'var(--text-dim)', mt: '4px' }}>{seriesTotals.ties} tie{seriesTotals.ties !== 1 ? 's' : ''}</Box>
                                            )}
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 70 }}>
                                            {resultB.mode === 'team' && <TeamMark team={markFor(resultB.id)} size={32} />}
                                            <Box sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{seriesTotals.winsB}</Box>
                                            <Box sx={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>Wins ({pct(seriesTotals.winsB / seriesTotals.total)})</Box>
                                        </Box>
                                    </Box>

                                    {streak && (
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Box sx={{ ...labelSx, mb: '4px' }}>Current win streak</Box>
                                            <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, fontSize: '1.4rem', color: streakColor(streak.winner) }}>
                                                {streak.length} · {streakLabel(streak.winner)} ({seasonRange(streak.startSeason, streak.endSeason)})
                                            </Box>
                                        </Box>
                                    )}

                                    <Box>
                                        <Box sx={{ ...labelSx, mb: '8px', textAlign: 'center' }}>Head-to-head results</Box>
                                        <MarginBarChart matchups={matchups} colorA={entityColor(resultA.mode, resultA.id)} colorB={entityColor(resultB.mode, resultB.id)} />
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><Box sx={{ width: 11, height: 11, borderRadius: '2px', background: entityColor(resultA.mode, resultA.id) }} />{entityDisplayName(resultA.mode, resultA.id)}</Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><Box sx={{ width: 11, height: 11, borderRadius: '2px', background: entityColor(resultB.mode, resultB.id) }} />{entityDisplayName(resultB.mode, resultB.id)}</Box>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: '12px', textAlign: 'center' }}>
                                        <Box>
                                            <Box sx={{ ...labelSx, mb: '4px' }}>Largest margin ({streakLabel('A')})</Box>
                                            {marginA ? (
                                                <Box component={Link} to={`/game-details/${marginA.gameId}`} sx={{ color: entityColor(resultA.mode, resultA.id), textDecoration: 'none', fontFamily: 'var(--cond)', fontWeight: 800, fontSize: '1.6rem', display: 'block' }}>
                                                    {marginA.margin}
                                                    <Box sx={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontFamily: 'inherit', fontWeight: 700 }}>Season {marginA.season}, Wk {marginA.week}</Box>
                                                </Box>
                                            ) : <Box sx={{ color: 'var(--text-dim)' }}>-</Box>}
                                        </Box>
                                        <Box>
                                            <Box sx={{ ...labelSx, mb: '4px' }}>Longest streak ({streakLabel('A')})</Box>
                                            <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, fontSize: '1.6rem', color: entityColor(resultA.mode, resultA.id) }}>{longestA?.length || 0}</Box>
                                            {longestA?.length > 0 && <Box sx={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>{seasonRange(longestA.startSeason, longestA.endSeason)}</Box>}
                                        </Box>
                                        <Box>
                                            <Box sx={{ ...labelSx, mb: '4px' }}>Largest margin ({streakLabel('B')})</Box>
                                            {marginB ? (
                                                <Box component={Link} to={`/game-details/${marginB.gameId}`} sx={{ color: entityColor(resultB.mode, resultB.id), textDecoration: 'none', fontFamily: 'var(--cond)', fontWeight: 800, fontSize: '1.6rem', display: 'block' }}>
                                                    {marginB.margin}
                                                    <Box sx={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontFamily: 'inherit', fontWeight: 700 }}>Season {marginB.season}, Wk {marginB.week}</Box>
                                                </Box>
                                            ) : <Box sx={{ color: 'var(--text-dim)' }}>-</Box>}
                                        </Box>
                                        <Box>
                                            <Box sx={{ ...labelSx, mb: '4px' }}>Longest streak ({streakLabel('B')})</Box>
                                            <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, fontSize: '1.6rem', color: entityColor(resultB.mode, resultB.id) }}>{longestB?.length || 0}</Box>
                                            {longestB?.length > 0 && <Box sx={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>{seasonRange(longestB.startSeason, longestB.endSeason)}</Box>}
                                        </Box>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ p: 2, textAlign: 'center', color: 'var(--text-muted)' }}>No meetings on record between these two.</Box>
                            )}
                        </Box>
                    </Panel>
                </>
            )}
        </PageWrap>
    );
};

export default HeadToHead;
