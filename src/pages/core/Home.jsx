import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getAllTeams } from '../../api/teamApi';
import { getFilteredGames } from '../../api/gameApi';
import { getCurrentSeason, getLatestCompletedSeason } from '../../api/seasonApi';
import { getPostseasonSchedule } from '../../api/scheduleApi';
import { isRealTeam } from '../../utils/teamDataUtils';
import { useConferencesMap, activeConferenceCodes } from '../../hooks/useConferencesMap';
import PageWrap from '../../components/layout/PageWrap';
import useFitCount from '../../hooks/useFitCount';
import TeamName from '../../components/ui/TeamName';
import { conferenceLeaders } from '../../utils/conferenceLeaders';
import useWeekHighlights from '../../hooks/useWeekHighlights';
import UpsetsTile from '../../components/home/UpsetsTile';
import SwingTile from '../../components/home/SwingTile';
import MoversPanel from '../../components/home/MoversPanel';
import OpenJobsPanel from '../../components/home/OpenJobsPanel';
import ColumnSwitch from '../../components/home/ColumnSwitch';
import { getStorageItem } from '../../utils/utils';
import HomeHeader from '../../components/home/HomeHeader';
import HomeGameRow from '../../components/home/HomeGameRow';
import ScoreboardLink from '../../components/home/ScoreboardLink';
import TopRankingsPanel from '../../components/home/TopRankingsPanel';
import ConferenceLeadersPanel from '../../components/home/ConferenceLeadersPanel';
import Panel from '../../components/ui/Panel';
import StatTile, { TileGrid } from '../../components/ui/StatTile';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';

const resolveCurrentSeason = async () => {
    try {
        return await getCurrentSeason();
    } catch {
        return null;
    }
};

const GAMES_FETCHED = 10;

const Home = () => {
    useSeo(ROUTE_META['/']);
    const [gamesFitRef, gamesShown] = useFitCount({
        itemSelector: '[data-home-game]',
        rowHeight: 74,
        minRows: 3,
        maxRows: GAMES_FETCHED,
        initialRows: 5,
        phoneCount: 5,
        ownBottom: true,
    });

    const [teams, setTeams] = useState([]);
    const [games, setGames] = useState([]);
    const [gamesLive, setGamesLive] = useState(false);
    const [season, setSeason] = useState(null);
    const [confChampions, setConfChampions] = useState(null);
    const [loading, setLoading] = useState(true);
    const conferencesMap = useConferencesMap();
    const highlights = useWeekHighlights(season);
    const rankings = highlights.rankings;
    const [gamesView, setGamesView] = useState('marquee');
    const [pollView, setPollView] = useState('top25');
    const [sideView, setSideView] = useState('jobs');

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [allTeams, current, latest] = await Promise.all([
                    getAllTeams().catch(() => []),
                    resolveCurrentSeason(),
                    getLatestCompletedSeason().catch(() => null),
                ]);
                if (!active) {
                    return;
                }
                setTeams(allTeams.filter((team) => team.active && isRealTeam(team)));

                const seasonNumber = current ?? latest?.season_number ?? latest?.seasonNumber ?? null;
                setSeason(seasonNumber);

                const gamesChain = (async () => {
                    const [ongoing, past] = await Promise.all([
                        getFilteredGames({
                            category: 'ONGOING',
                            sort: 'CLOSEST_TO_END',
                            page: 0,
                            size: GAMES_FETCHED,
                        }).catch(() => null),
                        getFilteredGames({ category: 'PAST', sort: 'NEWEST', page: 0, size: GAMES_FETCHED }).catch(
                            () => null
                        ),
                    ]);
                    if (!active) {
                        return;
                    }
                    const ongoingList = ongoing?.content || [];
                    const live = ongoingList.length > 0;
                    setGames(live ? ongoingList : past?.content || []);
                    setGamesLive(live);
                })();

                const postseasonChain = (async () => {
                    if (!latest) {
                        return;
                    }
                    const postseason = await getPostseasonSchedule(latest.season_number ?? latest.seasonNumber).catch(
                        () => []
                    );
                    if (!active) {
                        return;
                    }

                    if (current == null) {
                        const champions = {};
                        (postseason || [])
                            .filter((entry) => entry.game_type === 'CONFERENCE_CHAMPIONSHIP')
                            .forEach((entry) => {
                                const homeWon = (entry.home_score || 0) > (entry.away_score || 0);
                                const winner = homeWon ? entry.home_team : entry.away_team;
                                const conference = teamsByName[winner]?.conference;
                                if (conference) {
                                    champions[conference] = winner;
                                }
                            });
                        setConfChampions(champions);
                    }
                })();

                await Promise.all([gamesChain, postseasonChain]);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const teamsByName = useMemo(() => Object.fromEntries(teams.map((team) => [team.name, team])), [teams]);

    const stats = useMemo(() => {
        const openCount = teams.filter((team) => !team.is_taken).length;
        const topElo = teams.reduce(
            (best, team) => ((team.current_elo || 0) > (best?.current_elo || 0) ? team : best),
            null
        );
        return { programs: teams.length, open: openCount, topElo };
    }, [teams]);

    const openTeams = useMemo(
        () => teams.filter((team) => !team.is_taken).sort((a, b) => a.name.localeCompare(b.name)),
        [teams]
    );

    const showChampions = confChampions && Object.keys(confChampions).length > 0;

    const conferenceRows = useMemo(() => {
        if (showChampions) {
            return activeConferenceCodes()
                .filter((conference) => confChampions[conference])
                .map((conference) => ({
                    key: conference,
                    conference,
                    team: teamsByName[confChampions[conference]],
                    champion: true,
                }));
        }
        return conferenceLeaders(teams, activeConferenceCodes()).map((leader) => ({ ...leader, champion: false }));
    }, [teams, teamsByName, confChampions, showChampions, conferencesMap]);

    if (loading) {
        return (
            <PageWrap>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            </PageWrap>
        );
    }

    const liveLabel = gamesLive ? 'Live' : 'Recent';
    const marquee = highlights.marquee;
    const shownGames = gamesView === 'marquee' && marquee?.games.length ? marquee.games : games;
    const signedIn = Boolean(getStorageItem('local', 'token', ''));

    return (
        <PageWrap>
            <HomeHeader season={season} week={highlights.week} />
            <TileGrid minTile={150} sx={{ mt: '10px' }}>
                <StatTile compact label="Open jobs" value={stats.open} caption={`of ${stats.programs} programs`} />
                <StatTile
                    compact
                    label="Games left this week"
                    value={highlights.remaining ?? '-'}
                    caption={highlights.week ? `Week ${highlights.week}` : undefined}
                />
                <UpsetsTile upsets={highlights.upsets} brewing={highlights.brewing} />
                <SwingTile swing={highlights.swing} />
                <StatTile
                    compact
                    label="Top ELO"
                    value={stats.topElo ? Math.round(stats.topElo.current_elo) : '-'}
                    caption={stats.topElo && <TeamName name={stats.topElo.name} size={14} />}
                />
                {rankings[0] && (
                    <StatTile
                        compact
                        label="#1 Coaches Poll"
                        value={<TeamName name={rankings[0].teamName} size={22} />}
                    />
                )}
            </TileGrid>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: '1fr 1fr',
                        lg: 'minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1fr)',
                    },
                    gap: '14px',
                    mt: '10px',
                    alignItems: 'stretch',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <ColumnSwitch
                        value={gamesView}
                        onChange={setGamesView}
                        ariaLabel="Games"
                        options={[
                            { value: 'marquee', label: marquee?.kind === 'close' ? 'Closest games' : 'Marquee' },
                            { value: 'all', label: liveLabel },
                        ]}
                        action={<ScoreboardLink />}
                    />
                    <Panel sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box ref={gamesFitRef}>
                            {shownGames.length > 0 ? (
                                shownGames
                                    .slice(0, gamesShown)
                                    .map((game) => (
                                        <HomeGameRow
                                            key={game.game_id ?? `${game.home_team}-${game.away_team}`}
                                            game={game}
                                        />
                                    ))
                            ) : (
                                <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No games to show.
                                </Box>
                            )}
                        </Box>
                    </Panel>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <ColumnSwitch
                        value={pollView}
                        onChange={setPollView}
                        ariaLabel="Rankings"
                        options={[
                            { value: 'top25', label: 'Top 25' },
                            { value: 'movers', label: 'Movers' },
                        ]}
                    />
                    {pollView === 'top25' ? (
                        <TopRankingsPanel rankings={rankings} dense />
                    ) : (
                        <MoversPanel poll={highlights.pollMoves} elo={highlights.eloMoves} />
                    )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <ColumnSwitch
                        value={sideView}
                        onChange={setSideView}
                        ariaLabel="Programs"
                        options={[
                            { value: 'jobs', label: 'Open jobs' },
                            { value: 'leaders', label: showChampions ? 'Conference champions' : 'Conference leaders' },
                        ]}
                    />
                    {sideView === 'jobs' ? (
                        <OpenJobsPanel teams={openTeams} signedIn={signedIn} />
                    ) : (
                        <ConferenceLeadersPanel rows={conferenceRows} dense />
                    )}
                </Box>
            </Box>
        </PageWrap>
    );
};

export default Home;
