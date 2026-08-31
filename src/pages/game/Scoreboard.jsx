import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getFilteredGames } from '../../api/gameApi';
import { getPostseasonSchedule } from '../../api/scheduleApi';
import { getCurrentSeason, getLatestCompletedSeason } from '../../api/seasonApi';
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
const REGULAR_WEEKS = Array.from({ length: 13 }, (_, index) => 13 - index);

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

    const changeTab = (nextTab) => {
        setPage(0);
        navigate(season != null && week != null ? `/scoreboard/${nextTab}/${season}/${week}` : `/scoreboard/${nextTab}`);
    };

    const changeWeek = (nextWeek) => {
        setWeek(nextWeek);
        setPage(0);
        navigate(`/scoreboard/${activeTab}/${season}/${nextWeek}`, { replace: true });
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
            const [current, latest] = await Promise.all([resolveCurrentSeason(), getLatestCompletedSeason().catch(() => null)]);
            setOffseason(current == null);
            if (!seasonParam) setSeason(current ?? latest?.season_number ?? latest?.seasonNumber ?? null);
            if (!weekParam) setWeek(current == null ? 'postseason' : Math.min(latest?.current_week ?? latest?.currentWeek ?? 13, 13));
        })();
    }, []);

    useEffect(() => {
        if (season == null) return undefined;
        let active = true;
        setLoading(true);
        (async () => {
            try {
                const conferenceParam = conference !== 'ALL' ? conference : undefined;
                const filterParams = rankedOnly ? ['RANKED_GAME'] : undefined;
                if (activeTab === 'live') {
                    const response = await getFilteredGames({ category: 'ONGOING', sort: 'CLOSEST_TO_END', page, size: PAGE_SIZE, conference: conferenceParam, filters: filterParams }).catch(() => null);
                    if (active) { setGames(response?.content || []); setPageCount(response?.total_pages || 1); }
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
                            || (game.away_team_rank >= 1 && game.away_team_rank <= 25));
                    if (active) {
                        setPageCount(Math.max(1, Math.ceil(finals.length / PAGE_SIZE)));
                        setGames(finals.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE));
                    }
                } else {
                    const response = await getFilteredGames({ category: 'PAST', season, week, sort: 'NEWEST', page, size: PAGE_SIZE, conference: conferenceParam, filters: filterParams }).catch(() => null);
                    if (active) {
                        setGames(response?.content || []);
                        setPageCount(response?.total_pages || 1);
                    }
                }
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [activeTab, season, week, page, conference, rankedOnly]);

    const weekOptions = useMemo(() => [
        { value: 'postseason', label: 'Postseason' },
        ...REGULAR_WEEKS.map((value) => ({ value, label: weekLabel(value) })),
    ], []);

    const conferenceOptions = useMemo(() => [
        { value: 'ALL', label: 'All conferences' },
        ...activeConferenceCodes().map((conf) => ({ value: conf, label: conferenceLabel(conf) })),
    ], [conferencesMap]);

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
