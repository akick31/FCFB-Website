import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getFilteredGames } from '../../api/gameApi';
import { getPostseasonSchedule } from '../../api/scheduleApi';
import { getCurrentSeason, getCurrentWeek, getAllSeasons, getLatestCompletedSeason } from '../../api/seasonApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { useConferencesMap, activeConferenceCodes, conferenceLabel } from '../../components/constants/conferences';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import SegTabs from '../../components/ui/SegTabs';
import SelectPill from '../../components/ui/SelectPill';
import Panel from '../../components/ui/Panel';
import Pager from '../../components/ui/Pager';
import GameCard from '../../components/game/cards/GameCard';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';
import { weekLabel } from '../../utils/formatText';

const TABS = [{ value: 'live', label: 'Live' }, { value: 'final', label: 'Final' }, { value: 'scrimmages', label: 'Scrimmages' }];
const PAGE_SIZE = 12;
const SEARCH_SIZE = 100;
const REGULAR_WEEKS = Array.from({ length: 13 }, (_, index) => index + 1);

const resolveCurrentSeason = async () => {
    try {
        return await getCurrentSeason();
    } catch {
        return null;
    }
};

const EmptyPanel = ({ title, note }) => (
    <Panel>
        <Box sx={{ textAlign: 'center', py: 6, px: 2, color: 'var(--text-muted)' }}>
            <Box sx={{ fontWeight: 800, color: 'var(--text)', mb: 0.5 }}>{title}</Box>
            {note && <Box sx={{ fontSize: '0.8rem' }}>{note}</Box>}
        </Box>
    </Panel>
);

EmptyPanel.propTypes = { title: PropTypes.string.isRequired, note: PropTypes.string };

const Scoreboard = () => {
    const { tab, season: seasonParam, week: weekParam } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const teamsMap = useTeamsMap();
    const conferencesMap = useConferencesMap();
    useSeo(ROUTE_META['/scoreboard']);

    const activeTab = TABS.some((option) => option.value === tab) ? tab : 'live';

    const parsedPage = parseInt(searchParams.get('page'), 10);

    const [season, setSeason] = useState(seasonParam ? parseInt(seasonParam, 10) : null);
    const [offseason, setOffseason] = useState(false);
    const [week, setWeek] = useState(weekParam ? (weekParam === 'postseason' ? 'postseason' : parseInt(weekParam, 10)) : 'postseason');
    const [games, setGames] = useState([]);
    const [page, setPage] = useState(Number.isFinite(parsedPage) && parsedPage >= 0 ? parsedPage : 0);
    const [pageCount, setPageCount] = useState(1);
    const [loading, setLoading] = useState(true);
    const [conference, setConference] = useState(searchParams.get('conference') || 'ALL');
    const [rankedOnly, setRankedOnly] = useState(searchParams.get('ranked') === '1');
    const [searchTeam, setSearchTeam] = useState(searchParams.get('team') || '');
    const [allSeasons, setAllSeasons] = useState([]);

    const changePage = (nextPage) => {
        setPage(nextPage);
        const next = new URLSearchParams(searchParams);
        if (nextPage > 0) next.set('page', String(nextPage)); else next.delete('page');
        setSearchParams(next, { replace: true });
    };

    const changeConference = (value) => {
        setConference(value);
        setPage(0);
        const next = new URLSearchParams(searchParams);
        if (value && value !== 'ALL') next.set('conference', value); else next.delete('conference');
        next.delete('page');
        setSearchParams(next, { replace: true });
    };

    const changeRanked = (value) => {
        const ranked = value === 'ranked';
        setRankedOnly(ranked);
        setPage(0);
        const next = new URLSearchParams(searchParams);
        if (ranked) next.set('ranked', '1'); else next.delete('ranked');
        next.delete('page');
        setSearchParams(next, { replace: true });
    };

    const changeSearchTeam = (value) => {
        setSearchTeam(value);
        setPage(0);
        const next = new URLSearchParams(searchParams);
        if (value) next.set('team', value); else next.delete('team');
        next.delete('page');
        setSearchParams(next, { replace: true });
    };

    const changeTab = (nextTab) => {
        setPage(0);
        navigate(season != null && week != null ? `/scoreboard/${nextTab}/${season}/${week}` : `/scoreboard/${nextTab}`);
    };

    const changeWeek = (nextWeek) => {
        setWeek(nextWeek);
        setPage(0);
        navigate(`/scoreboard/${activeTab}/${season}/${nextWeek}`, { replace: true });
    };

    const changeSeason = (nextSeason) => {
        setSeason(nextSeason);
        setPage(0);
        navigate(`/scoreboard/${activeTab}/${nextSeason}/${week}`, { replace: true });
    };

    useEffect(() => {
        if (!tab) navigate('/scoreboard/live', { replace: true });
    }, [tab, navigate]);

    useEffect(() => {
        if (!tab || season == null || week == null) return;
        if (!seasonParam || !weekParam) {
            navigate(`/scoreboard/${activeTab}/${season}/${week}`, { replace: true });
        }
    }, [tab, activeTab, season, week, seasonParam, weekParam, navigate]);

    useEffect(() => {
        (async () => {
            const [current, rawWeek] = await Promise.all([resolveCurrentSeason(), getCurrentWeek().catch(() => null)]);
            setOffseason(current == null);
            if (current == null) {
                const latest = await getLatestCompletedSeason().catch(() => null);
                if (!seasonParam) setSeason(latest?.season_number ?? latest?.seasonNumber ?? null);
                if (!weekParam) setWeek('postseason');
                return;
            }
            const weekNumber = typeof rawWeek === 'number' ? rawWeek : (rawWeek?.week ?? rawWeek?.current_week ?? rawWeek?.currentWeek ?? null);
            if (!seasonParam) setSeason(current);
            if (!weekParam) setWeek(weekNumber != null ? Math.min(Math.max(weekNumber, 1), 13) : 1);
        })();
    }, []);

    useEffect(() => {
        getAllSeasons()
            .then((data) => {
                const numbers = (data || [])
                    .map((entry) => entry.season_number ?? entry.seasonNumber)
                    .filter((value) => value != null)
                    .sort((a, b) => b - a);
                setAllSeasons(numbers);
            })
            .catch(() => setAllSeasons([]));
    }, []);

    useEffect(() => {
        if (season == null) return undefined;
        let active = true;
        setLoading(true);
        const searchesTeams = (activeTab === 'live' || activeTab === 'final') && searchTeam.trim() !== '';
        const query = searchTeam.trim().toLowerCase();
        const matchesSearch = (game) => !searchesTeams
            || game.home_team.toLowerCase().includes(query)
            || game.away_team.toLowerCase().includes(query)
            || teamsMap[game.home_team]?.abbreviation?.toLowerCase().includes(query)
            || teamsMap[game.away_team]?.abbreviation?.toLowerCase().includes(query);

        const timeout = setTimeout(() => {
            (async () => {
                try {
                    const conferenceParam = conference !== 'ALL' ? conference : undefined;
                    const filterParams = rankedOnly ? ['RANKED_GAME'] : undefined;
                    const fetchSize = searchesTeams ? SEARCH_SIZE : PAGE_SIZE;
                    const fetchPage = searchesTeams ? 0 : page;
                    if (activeTab === 'live') {
                        const response = await getFilteredGames({ category: 'ONGOING', sort: 'CLOSEST_TO_END', page: fetchPage, size: fetchSize, conference: conferenceParam, filters: filterParams }).catch(() => null);
                        if (active) {
                            setGames((response?.content || []).filter(matchesSearch));
                            setPageCount(searchesTeams ? 1 : (response?.total_pages || 1));
                        }
                    } else if (activeTab === 'scrimmages') {
                        const response = await getFilteredGames({ category: 'SCRIMMAGE', sort: 'CLOSEST_TO_END', page, size: PAGE_SIZE, conference: conferenceParam, filters: filterParams }).catch(() => null);
                        if (active) { setGames(response?.content || []); setPageCount(response?.total_pages || 1); }
                    } else if (week === 'postseason') {
                        const post = await getPostseasonSchedule(season).catch(() => []);
                        const finals = (post || [])
                            .filter((game) => game.game_status === 'FINAL' || game.home_score != null)
                            .filter((game) => !conferenceParam || teamsMap[game.home_team]?.conference === conferenceParam || teamsMap[game.away_team]?.conference === conferenceParam)
                            .filter((game) => !rankedOnly
                                || (game.home_team_rank >= 1 && game.home_team_rank <= 25)
                                || (game.away_team_rank >= 1 && game.away_team_rank <= 25))
                            .filter(matchesSearch);
                        if (active) {
                            setPageCount(Math.max(1, Math.ceil(finals.length / PAGE_SIZE)));
                            setGames(finals.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE));
                        }
                    } else {
                        const response = await getFilteredGames({ category: 'PAST', season, week, sort: 'NEWEST', page: fetchPage, size: fetchSize, conference: conferenceParam, filters: filterParams }).catch(() => null);
                        if (active) {
                            setGames((response?.content || []).filter(matchesSearch));
                            setPageCount(searchesTeams ? 1 : (response?.total_pages || 1));
                        }
                    }
                } finally {
                    if (active) setLoading(false);
                }
            })();
        }, searchesTeams ? 300 : 0);
        return () => { active = false; clearTimeout(timeout); };
    }, [activeTab, season, week, page, conference, rankedOnly, searchTeam]);

    const weekOptions = useMemo(() => [
        ...REGULAR_WEEKS.map((value) => ({ value, label: weekLabel(value) })),
        { value: 'postseason', label: 'Postseason' },
    ], []);

    const conferenceOptions = useMemo(() => [
        { value: 'ALL', label: 'All conferences' },
        ...activeConferenceCodes().map((conf) => ({ value: conf, label: conferenceLabel(conf) })),
    ], [conferencesMap]);

    const teamOptions = useMemo(() => Object.values(teamsMap).sort((a, b) => a.name.localeCompare(b.name)), [teamsMap]);

    const emptyCopy = {
        live: { title: 'No live games right now', note: offseason ? 'The league is between seasons.' : 'Check back when games are in progress.' },
        scrimmages: { title: 'No scrimmages right now', note: 'Scrimmages appear here when they are running.' },
        final: { title: 'No games to show', note: 'Try another week.' },
    }[activeTab];

    return (
        <PageWrap>
            <PageHeading eyebrow={season ? `Season ${season}` : 'Fake College Football'} title="Scoreboard">
                <SegTabs
                    value={activeTab}
                    onChange={changeTab}
                    options={TABS}
                    ariaLabel="Scoreboard filter"
                />
                {activeTab === 'final' && allSeasons.length > 0 && (
                    <SelectPill
                        label="Season"
                        value={season ?? ''}
                        onChange={(next) => changeSeason(Number(next))}
                        options={allSeasons.map((value) => ({ value, label: `Season ${value}` }))}
                    />
                )}
                {activeTab === 'final' && (
                    <SelectPill
                        label="Week"
                        value={week}
                        onChange={(next) => changeWeek(next === 'postseason' ? 'postseason' : Number(next))}
                        options={weekOptions}
                    />
                )}
                <SelectPill
                    label="Conference"
                    value={conference}
                    onChange={changeConference}
                    options={conferenceOptions}
                />
                <SelectPill
                    label="Rank"
                    value={rankedOnly ? 'ranked' : 'all'}
                    onChange={changeRanked}
                    options={[{ value: 'all', label: 'All games' }, { value: 'ranked', label: 'Top 25 only' }]}
                />
                {(activeTab === 'live' || activeTab === 'final') && (
                    <>
                        <Box
                            component="input"
                            list="scoreboard-team-options"
                            placeholder="Search team…"
                            aria-label="Search team"
                            value={searchTeam}
                            onChange={(event) => changeSearchTeam(event.target.value)}
                            sx={{ height: '34px', boxSizing: 'border-box', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', padding: '0 10px', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, minWidth: 170, '&::placeholder': { color: 'var(--text-dim)', fontWeight: 400 } }}
                        />
                        <datalist id="scoreboard-team-options">
                            {teamOptions.map((team) => <option key={team.name} value={team.name} />)}
                        </datalist>
                    </>
                )}
            </PageHeading>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
            ) : games.length === 0 ? (
                <EmptyPanel title={emptyCopy.title} note={emptyCopy.note} />
            ) : (
                <>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: '14px' }}>
                        {games.map((game) => (
                            <GameCard key={game.game_id} game={game} teamsMap={teamsMap} />
                        ))}
                    </Box>
                    {pageCount > 1 && (
                        <Box sx={{ mt: '18px' }}>
                            <Pager page={page} pageCount={pageCount} onChange={changePage} />
                        </Box>
                    )}
                </>
            )}
        </PageWrap>
    );
};

export default Scoreboard;
