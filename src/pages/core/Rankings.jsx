import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import SegTabs from '../../components/ui/SegTabs';
import SelectPill from '../../components/ui/SelectPill';
import DataTable from '../../components/ui/DataTable';
import LinkCell from '../../components/ui/LinkCell';
import TeamMark from '../../components/ui/TeamMark';
import ConferenceMark from '../../components/ui/ConferenceMark';
import { useConferencesMap, seasonConferenceList, conferenceLabel } from '../../components/constants/conferences';
import { getAllTeamsIncludingInactive } from '../../api/teamApi';
import { getTeamSeasonConference } from '../../api/teamSeasonConferenceApi';
import { getFilteredGames } from '../../api/gameApi';
import { getRankings, getRankingWeeks } from '../../api/rankingApi';
import { getRankingMetrics, getRankingMetricWeeks } from '../../api/rankingMetricApi';
import { getEloHistory } from '../../api/eloHistoryApi.jsx';
import { getAllSeasons, getCurrentSeasonOrLatest } from '../../api/seasonApi';
import { useTeamsMap, ensureTeam } from '../../hooks/useTeamsMap';
import { eloWeekBuckets, eloByTeamForWeek, eloRankingForWeek } from '../../utils/eloRankings';
import { RANKING_METRIC_TYPES, rankingMetricLabel, rankingMetricShortLabel, rankingMetricHigherIsBetter, rankingMetricDescription } from '../../constants/rankingMetrics';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';

const POLL_TYPE = { coaches: 'COACHES_POLL', committee: 'PLAYOFF_COMMITTEE' };
const FIXED_TAB_LABEL = { coaches: 'Coaches Poll', committee: 'Playoff Committee', elo: 'ELO' };
const METRIC_VALUES = new Set(RANKING_METRIC_TYPES.map((entry) => entry.value));
const isMetricMode = (mode) => METRIC_VALUES.has(mode);
const hasShowFilter = (mode) => isMetricMode(mode) || mode === 'elo';
const tabLabel = (tab) => FIXED_TAB_LABEL[tab] || rankingMetricLabel(tab);
const slugForMode = (mode) => (isMetricMode(mode) ? mode.toLowerCase().replace(/_/g, '-') : mode);
const modeForSlug = (slug) => {
    if (!slug) return slug;
    const upper = slug.toUpperCase().replace(/-/g, '_');
    return METRIC_VALUES.has(upper) ? upper : slug;
};

const pythagoreanRecord = (value, wins, losses) => {
    if (value == null || wins == null || losses == null) return null;
    const gamesPlayed = wins + losses;
    const pythagWins = Math.min(gamesPlayed, Math.max(0, Math.round(value)));
    return `${pythagWins}-${gamesPlayed - pythagWins}`;
};

const rankMetricEntries = (entries, higherIsBetter) => {
    const sorted = [...entries].sort((a, b) => (higherIsBetter ? b.value - a.value : a.value - b.value));
    const rankByTeamId = {};
    sorted.forEach((entry, index) => { rankByTeamId[entry.teamId] = index + 1; });
    return { sorted, rankByTeamId };
};
const weekLabel = (week) => {
    if (week >= 14) return 'Postseason';
    if (week === 13) return 'Conference Championship Week';
    return `Week ${week}`;
};
const granularWeekLabel = (week) => (week === 13 ? 'Conference Championship Week' : `Week ${week}`);

const RankDelta = ({ prev, rank }) => {
    if (prev == null) return <span className="flat">-</span>;
    const move = prev - rank;
    if (move > 0) return <span className="up">▲ {move}</span>;
    if (move < 0) return <span className="down">▼ {Math.abs(move)}</span>;
    return <span className="flat">-</span>;
};

RankDelta.propTypes = { prev: PropTypes.number, rank: PropTypes.number.isRequired };

const Rankings = () => {
    useSeo(ROUTE_META['/rankings']);

    const { type } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const teamsMap = useTeamsMap();
    const conferencesMap = useConferencesMap();

    const [season, setSeason] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [teams, setTeams] = useState([]);
    const [eloHistory, setEloHistory] = useState([]);
    const [weeksByPoll, setWeeksByPoll] = useState({ COACHES_POLL: [], PLAYOFF_COMMITTEE: [] });
    const [weeksByMetric, setWeeksByMetric] = useState({});
    const [week, setWeek] = useState(null);
    const [pollData, setPollData] = useState({ current: [], prevRankByTeamId: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAll, setShowAll] = useState(() => searchParams.get('all') !== '0');
    const [teamSearch, setTeamSearch] = useState(() => searchParams.get('q') || '');
    const [conference, setConference] = useState(() => searchParams.get('conference')?.toUpperCase() || 'ALL');

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [seasonsData, teamsData, elo] = await Promise.all([
                    getAllSeasons(),
                    getAllTeamsIncludingInactive(),
                    getEloHistory('all').catch(() => []),
                ]);
                if (!active) return;
                const seasonNumbers = [...new Set(seasonsData
                    .map((entry) => entry.season_number ?? entry.seasonNumber)
                    .filter((value) => value != null))].sort((a, b) => b - a);
                setSeasons(seasonNumbers);
                setTeams(teamsData);
                setEloHistory(elo);

                const urlSeason = Number(searchParams.get('season'));
                if (urlSeason && seasonNumbers.includes(urlSeason)) {
                    if (active) setSeason(urlSeason);
                } else {
                    const currentSeason = await getCurrentSeasonOrLatest().catch(() => null);
                    const defaultSeason = seasonNumbers.includes(currentSeason) ? currentSeason : (seasonNumbers[0] ?? null);
                    if (active) setSeason(defaultSeason);
                }
            } catch {
                if (active) setError('Failed to load rankings data. Please try again.');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (season == null) return undefined;
        let active = true;
        Promise.all([
            getRankingWeeks(season, 'COACHES_POLL').catch(() => []),
            getRankingWeeks(season, 'PLAYOFF_COMMITTEE').catch(() => []),
        ]).then(([coaches, committee]) => {
            if (active) setWeeksByPoll({ COACHES_POLL: coaches || [], PLAYOFF_COMMITTEE: committee || [] });
        });
        Promise.all(
            RANKING_METRIC_TYPES.map((entry) => getRankingMetricWeeks(season, entry.value).catch(() => [])),
        ).then((results) => {
            if (!active) return;
            const next = {};
            RANKING_METRIC_TYPES.forEach((entry, index) => { next[entry.value] = results[index] || []; });
            setWeeksByMetric(next);
        });
        return () => { active = false; };
    }, [season]);

    const changeSeason = (next) => { setSeason(next); setConference('ALL'); };

    const eloWeeks = useMemo(() => eloWeekBuckets(eloHistory, season), [eloHistory, season]);

    const tabs = useMemo(() => {
        const list = [];
        if (weeksByPoll.COACHES_POLL.length) list.push('coaches');
        if (weeksByPoll.PLAYOFF_COMMITTEE.length) list.push('committee');
        if (eloWeeks.length) list.push('elo');
        RANKING_METRIC_TYPES.forEach((entry) => {
            if ((weeksByMetric[entry.value] || []).length) list.push(entry.value);
        });
        return list.length ? list : ['coaches'];
    }, [weeksByPoll, eloWeeks, weeksByMetric]);

    const weeksForTab = (candidate) => {
        if (candidate === 'elo') return eloWeeks;
        if (isMetricMode(candidate)) return weeksByMetric[candidate] || [];
        return weeksByPoll[POLL_TYPE[candidate]] || [];
    };

    const defaultMode = useMemo(() => {
        const overallMaxWeek = Math.max(0, ...tabs.map(weeksForTab).flat());
        return tabs.find((t) => weeksForTab(t).includes(overallMaxWeek)) || tabs[0];
    }, [tabs, weeksByPoll, eloWeeks, weeksByMetric]);

    const requestedMode = modeForSlug(type);
    const mode = tabs.includes(requestedMode) ? requestedMode : defaultMode;

    useEffect(() => {
        if (loading || tabs.length === 0) return;
        if (!tabs.includes(requestedMode)) {
            navigate({ pathname: `/rankings/${slugForMode(defaultMode)}`, search: searchParams.toString() }, { replace: true });
        }
    }, [requestedMode, tabs, defaultMode, loading, navigate]);

    const weeksForMode = useMemo(() => {
        if (mode === 'elo') return eloWeeks;
        if (isMetricMode(mode)) return weeksByMetric[mode] || [];
        return weeksByPoll[POLL_TYPE[mode]] || [];
    }, [mode, eloWeeks, weeksByPoll, weeksByMetric]);

    useEffect(() => {
        setWeek((current) => {
            if (!weeksForMode.length) return null;
            if (current == null) {
                const urlWeek = Number(searchParams.get('week'));
                if (urlWeek && weeksForMode.includes(urlWeek)) return urlWeek;
            }
            if (current == null || !weeksForMode.includes(current)) return weeksForMode[weeksForMode.length - 1];
            return current;
        });
    }, [weeksForMode]);

    useEffect(() => {
        if (mode === 'elo' || isMetricMode(mode) || season == null || week == null) return undefined;
        const pollType = POLL_TYPE[mode];
        const index = weeksForMode.indexOf(week);
        const prevWeek = index > 0 ? weeksForMode[index - 1] : null;
        let active = true;
        Promise.all([
            getRankings(season, week, pollType),
            prevWeek != null ? getRankings(season, prevWeek, pollType) : Promise.resolve([]),
        ]).then(([current, prev]) => {
            if (!active) return;
            const prevRankByTeamId = {};
            prev.forEach((entry) => { prevRankByTeamId[entry.teamId] = entry.rank; });
            setPollData({ current, prevRankByTeamId });
        }).catch(() => { if (active) setPollData({ current: [], prevRankByTeamId: {} }); });
        return () => { active = false; };
    }, [mode, season, week, weeksForMode]);

    const [metricData, setMetricData] = useState({ current: [], prevRankByTeamId: {} });

    useEffect(() => {
        if (!isMetricMode(mode) || season == null || week == null) return undefined;
        const higherIsBetter = rankingMetricHigherIsBetter(mode);
        const index = weeksForMode.indexOf(week);
        const prevWeek = index > 0 ? weeksForMode[index - 1] : null;
        let active = true;
        Promise.all([
            getRankingMetrics(season, week, mode),
            prevWeek != null ? getRankingMetrics(season, prevWeek, mode) : Promise.resolve([]),
        ]).then(([current, prev]) => {
            if (!active) return;
            const { sorted, rankByTeamId } = rankMetricEntries(current, higherIsBetter);
            const { rankByTeamId: prevRankByTeamId } = rankMetricEntries(prev, higherIsBetter);
            setMetricData({
                current: sorted.map((entry) => ({ ...entry, rank: rankByTeamId[entry.teamId] })),
                prevRankByTeamId,
            });
        }).catch(() => { if (active) setMetricData({ current: [], prevRankByTeamId: {} }); });
        return () => { active = false; };
    }, [mode, season, week, weeksForMode]);

    const [seasonConferenceByTeam, setSeasonConferenceByTeam] = useState({});

    useEffect(() => {
        if (season == null) { setSeasonConferenceByTeam({}); return undefined; }
        let active = true;
        getTeamSeasonConference(season).then((map) => {
            if (active) setSeasonConferenceByTeam(map || {});
        }).catch(() => { if (active) setSeasonConferenceByTeam({}); });
        return () => { active = false; };
    }, [season]);

    const [coachHistoryByTeam, setCoachHistoryByTeam] = useState({});

    useEffect(() => {
        if (season == null) { setCoachHistoryByTeam({}); return undefined; }
        let active = true;
        getFilteredGames({ season, page: 0, size: 1000 }).then((res) => {
            if (!active) return;
            const rows = res?.content || (Array.isArray(res) ? res : []);
            const history = {};
            rows.forEach((game) => {
                if (game.week == null) return;
                [[game.home_team, game.home_coaches?.[0]], [game.away_team, game.away_coaches?.[0]]].forEach(([team, coach]) => {
                    if (!team || !coach) return;
                    (history[team] = history[team] || []).push({ week: game.week, coach });
                });
            });
            Object.values(history).forEach((entries) => entries.sort((a, b) => a.week - b.week));
            setCoachHistoryByTeam(history);
        }).catch(() => { if (active) setCoachHistoryByTeam({}); });
        return () => { active = false; };
    }, [season]);

    const coachByTeam = useMemo(() => {
        if (week == null) return {};
        const map = {};
        Object.entries(coachHistoryByTeam).forEach(([team, entries]) => {
            const asOfWeek = [...entries].reverse().find((entry) => entry.week <= week);
            if (asOfWeek) map[team] = asOfWeek.coach;
        });
        return map;
    }, [coachHistoryByTeam, week]);

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
        apply('week', week != null ? String(week) : null);
        apply('conference', conference !== 'ALL' ? conference.toLowerCase() : null);
        apply('all', showAll ? null : '0');
        apply('q', teamSearch || null);
        if (changed) setSearchParams(next, { replace: true });
    }, [season, week, conference, showAll, teamSearch]);

    const teamById = useMemo(() => Object.fromEntries(teams.map((team) => [team.id, team])), [teams]);
    const teamByName = useMemo(() => Object.fromEntries(teams.map((team) => [team.name, team])), [teams]);
    const eloByTeam = useMemo(
        () => (season != null && week != null ? eloByTeamForWeek(eloHistory, season, week) : {}),
        [eloHistory, season, week],
    );

    const rows = useMemo(() => {
        if (mode === 'elo') {
            if (season == null || week == null) return [];
            const { ordered } = eloRankingForWeek(eloHistory, season, week);
            const prevWeek = eloWeeks[eloWeeks.indexOf(week) - 1];
            const prevRankByTeam = prevWeek != null ? eloRankingForWeek(eloHistory, season, prevWeek).rankByTeam : {};
            return ordered.map((entry) => ({
                rank: entry.rank,
                team: teamByName[entry.team] || { name: entry.team },
                prev: prevRankByTeam[entry.team],
                elo: Math.round(entry.elo),
                wins: entry.wins,
                losses: entry.losses,
            }));
        }
        if (isMetricMode(mode)) {
            return (metricData.current || []).map((entry) => {
                const team = teamById[entry.teamId] || { name: entry.teamName };
                return {
                    rank: entry.rank,
                    team,
                    prev: metricData.prevRankByTeamId[entry.teamId],
                    elo: entry.value,
                    wins: entry.wins,
                    losses: entry.losses,
                };
            });
        }
        return (pollData.current || []).map((entry) => {
            const team = teamById[entry.teamId] || { name: entry.teamName };
            const elo = eloByTeam[team.name] ?? team.current_elo;
            return {
                rank: entry.rank,
                team,
                prev: pollData.prevRankByTeamId[entry.teamId],
                elo: elo != null ? Math.round(elo) : null,
                wins: entry.wins,
                losses: entry.losses,
            };
        });
    }, [mode, pollData, metricData, teamById, teamByName, eloByTeam, eloHistory, season, week, eloWeeks]);

    const availableConferences = useMemo(() => {
        const present = new Set(rows.map((row) => seasonConferenceByTeam[row.team.name] ?? row.team.conference));
        return seasonConferenceList(Object.values(seasonConferenceByTeam)).filter((c) => present.has(c.code)).map((c) => c.code);
    }, [rows, seasonConferenceByTeam, conferencesMap]);

    const conferenceRows = useMemo(
        () => (conference === 'ALL' ? rows : rows.filter((row) => (seasonConferenceByTeam[row.team.name] ?? row.team.conference) === conference)),
        [rows, conference, seasonConferenceByTeam],
    );

    const displayRows = useMemo(() => {
        if (!hasShowFilter(mode)) return conferenceRows;
        const query = teamSearch.trim().toLowerCase();
        if (query) return conferenceRows.filter((row) => row.team.name?.toLowerCase().includes(query));
        if (conference !== 'ALL') return conferenceRows;
        return showAll ? conferenceRows : conferenceRows.slice(0, 25);
    }, [mode, conferenceRows, teamSearch, showAll, conference]);

    if (loading) {
        return <PageWrap><Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box></PageWrap>;
    }

    if (error) {
        return <PageWrap><Alert severity="error">{error}</Alert></PageWrap>;
    }

    return (
        <PageWrap>
            <PageHeading eyebrow="Top 25" title="Rankings">
                <SegTabs
                    ariaLabel="Ranking type"
                    value={mode}
                    onChange={(next) => navigate({ pathname: `/rankings/${slugForMode(next)}`, search: searchParams.toString() })}
                    options={tabs.map((tab) => ({ value: tab, label: tabLabel(tab) }))}
                    buttonSx={{ height: '38px' }}
                />
                {season != null && seasons.length > 0 && (
                    <SelectPill
                        label="Season"
                        value={season}
                        onChange={(next) => changeSeason(Number(next))}
                        options={seasons.map((option) => ({ value: option, label: `Season ${option}` }))}
                        sx={{ height: '38px', boxSizing: 'border-box' }}
                    />
                )}
                {season != null && !hasShowFilter(mode) && (
                    <SelectPill
                        label="Conference"
                        value={conference}
                        onChange={setConference}
                        options={[{ value: 'ALL', label: 'All conferences' }, ...availableConferences.map((conf) => ({ value: conf, label: conferenceLabel(conf) }))]}
                        sx={{ height: '38px', boxSizing: 'border-box' }}
                    />
                )}
                {hasShowFilter(mode) && (
                    <SelectPill
                        label="Show"
                        value={conference !== 'ALL' ? conference : (showAll ? 'all' : 'top25')}
                        onChange={(next) => {
                            if (next === 'top25') { setShowAll(false); setConference('ALL'); }
                            else if (next === 'all') { setShowAll(true); setConference('ALL'); }
                            else { setConference(next); setShowAll(true); }
                        }}
                        options={[
                            { value: 'top25', label: 'Top 25' },
                            { value: 'all', label: 'All teams' },
                            ...availableConferences.map((conf) => ({ value: conf, label: conferenceLabel(conf) })),
                        ]}
                        sx={{ height: '38px', boxSizing: 'border-box' }}
                    />
                )}
                {hasShowFilter(mode) && (
                    <Box
                        component="input"
                        placeholder="Search teams…"
                        aria-label="Search teams"
                        value={teamSearch}
                        onChange={(event) => setTeamSearch(event.target.value)}
                        sx={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', padding: '6px 10px', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, minWidth: 190, height: '38px', boxSizing: 'border-box', '&::placeholder': { color: 'var(--text-dim)', fontWeight: 400 } }}
                    />
                )}
                {week != null && weeksForMode.length > 0 && (
                    <SelectPill
                        label="Week"
                        value={week}
                        onChange={(next) => setWeek(Number(next))}
                        options={weeksForMode.map((option) => ({ value: option, label: (isMetricMode(mode) || mode === 'elo' ? granularWeekLabel : weekLabel)(option) }))}
                        sx={{ height: '38px', boxSizing: 'border-box' }}
                    />
                )}
            </PageHeading>

            {isMetricMode(mode) && (
                <Box sx={{ color: 'var(--text-muted)', fontSize: '0.82rem', mb: '16px' }}>
                    {rankingMetricDescription(mode)}
                </Box>
            )}

            <DataTable minWidth={640} tableLayout="fixed">
                <thead>
                    <tr>
                        <th className="lft stick" style={{ width: '6%' }}>Rk</th>
                        <th className="lft" style={{ width: '24%' }}>Team</th>
                        <th style={{ width: '11%', textAlign: 'center' }}>Record</th>
                        <th style={{ width: '11%', textAlign: 'center' }}>Conference</th>
                        <th style={{ width: '11%', textAlign: 'center' }}>Previous</th>
                        <th style={{ width: '9%', textAlign: 'center' }}>Δ</th>
                        <th style={{ width: '10%' }}>{isMetricMode(mode) ? rankingMetricShortLabel(mode) : 'ELO'}</th>
                        {mode === 'EQUIVALENT_WINS' && <th style={{ width: '11%', textAlign: 'center' }}>Pythag Record</th>}
                        <th style={{ width: mode === 'EQUIVALENT_WINS' ? '13%' : '18%' }}>Coach</th>
                    </tr>
                </thead>
                <tbody>
                    {displayRows.length === 0 && hasShowFilter(mode) && teamSearch.trim() && (
                        <tr>
                            <Box component="td" colSpan={mode === 'EQUIVALENT_WINS' ? 9 : 8} sx={{ textAlign: 'center', color: 'var(--text-muted)', py: 3 }}>
                                No teams match &quot;{teamSearch.trim()}&quot;.
                            </Box>
                        </tr>
                    )}
                    {displayRows.map(({ rank, team, prev, elo, wins, losses }) => {
                        if (!teamsMap[team.name]) ensureTeam(team.name);
                        const mark = teamsMap[team.name] || { name: team.name, abbreviation: team.abbreviation };
                        const coach = coachByTeam[team.name] ?? team.coach_usernames?.[0];
                        const teamHref = team.id != null ? `/team-details/${team.id}` : null;
                        return (
                            <tr key={team.id ?? team.name}>
                                <LinkCell to={teamHref} className="lft stick">
                                    <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '1rem' }}>{rank}</span>
                                </LinkCell>
                                <LinkCell to={teamHref} className="lft">
                                    <div className="teamcell">
                                        <TeamMark team={mark} size={22} />
                                        <span className="nm">{team.name}</span>
                                    </div>
                                </LinkCell>
                                <LinkCell to={teamHref} className="num" sx={{ textAlign: 'center' }}>{wins != null ? `${wins}-${losses ?? 0}` : '-'}</LinkCell>
                                <LinkCell to={teamHref} sx={{ textAlign: 'center' }}><ConferenceMark conference={seasonConferenceByTeam[team.name] ?? team.conference} /></LinkCell>
                                <LinkCell to={teamHref} className="num" sx={{ textAlign: 'center' }}>{prev != null ? prev : '-'}</LinkCell>
                                <LinkCell to={teamHref} className="num" sx={{ textAlign: 'center' }}><RankDelta prev={prev} rank={rank} /></LinkCell>
                                <LinkCell to={teamHref} className="num">{elo != null ? (isMetricMode(mode) ? elo.toFixed(3) : elo) : '-'}</LinkCell>
                                {mode === 'EQUIVALENT_WINS' && (
                                    <LinkCell to={teamHref} className="num" sx={{ textAlign: 'center' }}>{pythagoreanRecord(elo, wins, losses) ?? '-'}</LinkCell>
                                )}
                                <LinkCell to={teamHref}>
                                    {coach ? (
                                        <Box
                                            component={Link}
                                            to={`/user-details/${coach}`}
                                            sx={{ position: 'relative', zIndex: 3, color: 'var(--brand)', fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}
                                        >
                                            @{coach}
                                        </Box>
                                    ) : '-'}
                                </LinkCell>
                            </tr>
                        );
                    })}
                </tbody>
            </DataTable>
        </PageWrap>
    );
};

export default Rankings;
