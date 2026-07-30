import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { getAllTeams } from '../../api/teamApi';
import { getFilteredGames } from '../../api/gameApi';
import { getRankings, getRankingWeeks } from '../../api/rankingApi';
import { getCurrentSeason, getLatestCompletedSeason } from '../../api/seasonApi';
import { getPostseasonSchedule } from '../../api/scheduleApi';
import { isRealTeam } from '../../utils/teamDataUtils';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { CONFERENCE_ORDER, conferenceLabel } from '../../components/constants/conferences';
import PageWrap from '../../components/layout/PageWrap';
import SectionTitle from '../../components/ui/SectionTitle';
import Panel from '../../components/ui/Panel';
import StatTile, { TileGrid } from '../../components/ui/StatTile';
import TeamMark from '../../components/ui/TeamMark';
import ConferenceMark from '../../components/ui/ConferenceMark';
import GameCard from '../../components/game/cards/GameCard';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';
import logo from '../../assets/graphics/main_logo.png';
import trophy from '../../assets/graphics/trophy.png';

const resolveCurrentSeason = async () => {
    try {
        return await getCurrentSeason();
    } catch {
        return null;
    }
};

const buttonSx = (variant) => ({
    borderRadius: 'var(--r-sm)', px: '16px', py: '10px', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', border: 0,
    ...(variant === 'primary'
        ? { background: '#fff', color: 'var(--brand-deep)' }
        : { background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.35)' }),
});

const MiniRow = ({ onClick, children }) => (
    <Box
        onClick={onClick}
        sx={{ display: 'flex', alignItems: 'center', gap: '10px', px: '14px', py: '8px', borderBottom: '1px solid var(--line-soft)', cursor: onClick ? 'pointer' : 'default', '&:last-of-type': { borderBottom: 0 }, '&:hover': onClick ? { background: 'var(--surface-2)' } : {} }}
    >
        {children}
    </Box>
);

MiniRow.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.node,
};

const Home = () => {
    const navigate = useNavigate();
    const teamsMap = useTeamsMap();
    useSeo(ROUTE_META['/']);

    const [teams, setTeams] = useState([]);
    const [games, setGames] = useState([]);
    const [gamesLive, setGamesLive] = useState(false);
    const [rankings, setRankings] = useState([]);
    const [season, setSeason] = useState(null);
    const [champion, setChampion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [allTeams, current, latest] = await Promise.all([
                    getAllTeams().catch(() => []),
                    resolveCurrentSeason(),
                    getLatestCompletedSeason().catch(() => null),
                ]);
                if (!active) return;
                setTeams(allTeams.filter((team) => team.active && isRealTeam(team)));

                const seasonNumber = current ?? latest?.season_number ?? latest?.seasonNumber ?? null;
                setSeason(seasonNumber);

                const weeks = seasonNumber ? await getRankingWeeks(seasonNumber, 'COACHES_POLL').catch(() => []) : [];
                const week = weeks.length ? Math.max(...weeks) : null;
                const poll = week ? await getRankings(seasonNumber, week, 'COACHES_POLL').catch(() => []) : [];
                if (active) setRankings(poll || []);

                const ongoing = await getFilteredGames({ category: 'ONGOING', sort: 'CLOSEST_TO_END', page: 0, size: 4 }).catch(() => null);
                let list = ongoing?.content || [];
                let live = list.length > 0;
                if (!live) {
                    const past = await getFilteredGames({ category: 'PAST', sort: 'MOST_TIME_REMAINING', page: 0, size: 4 }).catch(() => null);
                    list = past?.content || [];
                }
                if (active) { setGames(list); setGamesLive(live); }

                const champTeam = latest?.national_championship_winning_team ?? latest?.nationalChampionshipWinningTeam;
                if (champTeam && latest) {
                    const postseason = await getPostseasonSchedule(latest.season_number ?? latest.seasonNumber).catch(() => []);
                    const game = (postseason || []).find((entry) => entry.game_type === 'NATIONAL_CHAMPIONSHIP');
                    if (active) {
                        if (game) {
                            const homeWon = (game.home_score || 0) > (game.away_score || 0);
                            setChampion({
                                season: latest.season_number ?? latest.seasonNumber,
                                winner: homeWon ? game.home_team : game.away_team,
                                loser: homeWon ? game.away_team : game.home_team,
                                winScore: homeWon ? game.home_score : game.away_score,
                                loseScore: homeWon ? game.away_score : game.home_score,
                                gameId: game.game_id,
                            });
                        } else {
                            setChampion({ season: latest.season_number ?? latest.seasonNumber, winner: champTeam });
                        }
                    }
                }
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const stats = useMemo(() => {
        const openCount = teams.filter((team) => !(team.coach_usernames && team.coach_usernames.length)).length;
        const conferences = new Set(teams.map((team) => team.conference).filter(Boolean));
        const topElo = teams.reduce((best, team) => ((team.current_elo || 0) > (best?.current_elo || 0) ? team : best), null);
        return { programs: teams.length, open: openCount, conferences: conferences.size, topElo };
    }, [teams]);

    const conferenceLeaders = useMemo(() => {
        const byConference = {};
        teams.forEach((team) => {
            if (!team.conference) return;
            const rate = (team.current_conference_wins || 0) + (team.current_conference_losses || 0) > 0
                ? (team.current_conference_wins || 0) / ((team.current_conference_wins || 0) + (team.current_conference_losses || 0))
                : 0;
            const current = byConference[team.conference];
            if (!current || rate > current.rate || (rate === current.rate && (team.current_conference_wins || 0) > (current.team.current_conference_wins || 0))) {
                byConference[team.conference] = { team, rate };
            }
        });
        return CONFERENCE_ORDER.filter((conference) => byConference[conference]).map((conference) => ({ conference, team: byConference[conference].team }));
    }, [teams]);

    if (loading) {
        return <PageWrap><Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box></PageWrap>;
    }

    return (
        <PageWrap>
            <Box sx={{
                position: 'relative', background: 'linear-gradient(160deg, var(--brand-deep), #01293b)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden', p: '30px', display: 'flex', alignItems: 'center', gap: '26px', flexWrap: 'wrap',
                '&::before': { content: '""', position: 'absolute', right: '-60px', top: '-40px', bottom: '-40px', width: '230px', background: 'var(--live)', transform: 'skewX(-11deg)', opacity: 0.9 },
                '&::after': { content: '""', position: 'absolute', right: '120px', top: '-40px', bottom: '-40px', width: '18px', background: '#b9c2c8', transform: 'skewX(-11deg)', opacity: 0.6 },
            }}>
                <Box component="img" src={logo} alt="FCFB" sx={{ height: 118, width: 'auto', zIndex: 2, filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))' }} />
                <Box sx={{ zIndex: 2, flex: 1, minWidth: 260 }}>
                    <Box sx={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, color: '#9fd6ec' }}>
                        {season ? `Season ${season}` : 'Fake College Football'}
                    </Box>
                    <Box component="h1" sx={{ fontFamily: 'var(--cond)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em', color: '#fff', fontSize: 'clamp(1.9rem, 4vw, 2.9rem)', lineHeight: 0.98, m: '8px 0 14px' }}>
                        College football,<br />one number at a time
                    </Box>
                    <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Box component="button" onClick={() => navigate('/scoreboard')} sx={buttonSx('primary')}>Scores</Box>
                        <Box component="button" onClick={() => navigate('/rankings')} sx={buttonSx('secondary')}>Rankings</Box>
                    </Box>
                </Box>
            </Box>

            {champion && (
                <Box
                    onClick={() => champion.gameId && navigate(`/game-details/${champion.gameId}`)}
                    sx={{
                        display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(120deg, var(--brand-deep), #01293b)', border: '1px solid color-mix(in srgb, var(--gold) 40%, var(--line))', borderRadius: 'var(--r-lg)', p: '16px 20px', cursor: champion.gameId ? 'pointer' : 'default', mt: '16px', position: 'relative', overflow: 'hidden',
                        '&::after': { content: '""', position: 'absolute', right: '-40px', top: '-20px', bottom: '-20px', width: '120px', background: 'var(--gold)', opacity: 0.1, transform: 'skewX(-11deg)' },
                    }}
                >
                    <Box component="img" src={trophy} alt="Trophy" sx={{ height: 52, width: 'auto', zIndex: 1 }} />
                    <Box sx={{ zIndex: 1, minWidth: 0 }}>
                        <Box sx={{ fontSize: '0.66rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, color: 'var(--gold)' }}>
                            Season {champion.season} National Champion
                        </Box>
                        <Box component="h2" sx={{ fontFamily: 'var(--cond)', color: '#fff', fontSize: '1.3rem', m: '3px 0 2px' }}>
                            Congratulations to {champion.winner}
                        </Box>
                        {champion.loser && (
                            <Box sx={{ color: '#cfe3ee', fontSize: '0.82rem' }}>
                                {champion.winner} defeated {champion.loser} {champion.winScore}-{champion.loseScore} for the Season {champion.season} national championship.
                            </Box>
                        )}
                    </Box>
                    {champion.loser && (
                        <Box sx={{ ml: 'auto', zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            <TeamMark team={teamsMap[champion.loser]} size={40} />
                            <Box sx={{ color: 'var(--text-dim)', fontWeight: 800 }}>{champion.loseScore}-{champion.winScore}</Box>
                            <TeamMark team={teamsMap[champion.winner]} size={40} />
                        </Box>
                    )}
                </Box>
            )}

            <TileGrid sx={{ mt: '16px' }}>
                <StatTile label="Programs" value={stats.programs} caption={`${stats.open} open`} />
                <StatTile label="Conferences" value={stats.conferences} />
                <StatTile label="Top ELO" value={stats.topElo ? Math.round(stats.topElo.current_elo) : '-'} caption={stats.topElo?.name} />
                {rankings[0] && <StatTile label="#1 Coaches Poll" value={rankings[0].teamName} />}
            </TileGrid>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.5fr 1fr' }, gap: '16px', mt: '16px' }}>
                <Box>
                    <SectionTitle title={gamesLive ? 'Live games' : 'Recent results'} />
                    {games.length > 0 ? (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                            {games.map((game) => (
                                <GameCard key={game.game_id} game={game} teamsMap={teamsMap} compact />
                            ))}
                        </Box>
                    ) : (
                        <Panel><Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No games to show.</Box></Panel>
                    )}
                </Box>

                <Box>
                    <SectionTitle title="Top 25" />
                    <Panel>
                        {rankings.slice(0, 8).map((row) => (
                            <MiniRow key={row.rank} onClick={() => row.teamId && navigate(`/team-details/${row.teamId}`)}>
                                <Box sx={{ color: 'var(--gold)', fontWeight: 800, fontSize: '0.72rem', width: 22 }}>#{row.rank}</Box>
                                <TeamMark team={teamsMap[row.teamName]} size={22} />
                                <Box sx={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.teamName}</Box>
                                <Box sx={{ ml: 'auto', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600 }}>{row.wins}-{row.losses}</Box>
                            </MiniRow>
                        ))}
                        <MiniRow onClick={() => navigate('/rankings')}>
                            <Box sx={{ width: '100%', textAlign: 'center', color: 'var(--brand)', fontWeight: 700, fontSize: '0.78rem' }}>Full Top 25</Box>
                        </MiniRow>
                    </Panel>

                    <SectionTitle title="Conference leaders" />
                    <Panel>
                        {conferenceLeaders.map(({ conference, team }) => (
                            <MiniRow key={conference} onClick={() => team.id && navigate(`/team-details/${team.id}`)}>
                                <ConferenceMark conference={conference} size={22} />
                                <Box sx={{ fontWeight: 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</Box>
                                <Box sx={{ ml: 'auto', color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 600 }}>
                                    {conferenceLabel(conference)} · {team.current_conference_wins || 0}-{team.current_conference_losses || 0}
                                </Box>
                            </MiniRow>
                        ))}
                    </Panel>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', mt: '26px' }}>
                <Box component="a" href="https://discord.gg/fcfb" target="_blank" rel="noopener noreferrer" sx={{ ...buttonSx('secondary'), background: 'var(--disc, #5865F2)', border: 0, textDecoration: 'none' }}>Join the Discord</Box>
                <Box component="a" href="https://www.patreon.com/fakecfb" target="_blank" rel="noopener noreferrer" sx={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '16px', py: '10px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>Support on Patreon</Box>
                <Box component="a" href="https://www.buymeacoffee.com/flying_porygon" target="_blank" rel="noopener noreferrer" sx={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '16px', py: '10px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>Buy me a coffee</Box>
            </Box>
        </PageWrap>
    );
};

export default Home;
