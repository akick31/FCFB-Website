import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { ArrowBack, Assessment, RestaurantMenu, Stop } from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getGameById, chewGameByGameId, endGameByGameId } from '../../api/gameApi';
import { getAllPlaysByGameId } from '../../api/playApi';
import { getGameStatsByIdAndTeam, generateGameStats } from '../../api/gameStatsApi.jsx';
import { getTeamByName } from '../../api/teamApi';
import { useTeamsMap, toEntry } from '../../hooks/useTeamsMap';
import { useColorMode } from '../../theme/ColorModeContext';
import { pickTeamColor } from '../../utils/teamColor';
import { formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';
import { conferenceLabel } from '../../components/constants/conferences';
import { STAT_GROUPS, statCell } from '../../utils/teamStatFields';
import { gameHeaderTitle, gameTypeName, buildWinProbSeries, buildScoreSeries, quarterBoundaries } from '../../utils/gameDetail';
import { goBackOr } from '../../utils/navigation';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import Panel from '../../components/ui/Panel';
import SectionTitle from '../../components/ui/SectionTitle';
import TeamMark from '../../components/ui/TeamMark';
import ConferenceMark from '../../components/ui/ConferenceMark';
import GameScorebug from '../../components/game/detail/GameScorebug';
import ComparisonTable from '../../components/game/detail/ComparisonTable';
import WinProbChart from '../../components/game/detail/WinProbChart';
import ScoreChart from '../../components/game/detail/ScoreChart';
import PlaysPanel from '../../components/game/detail/PlaysPanel';
import { useSeo } from '../../hooks/useSeo';

const unwrap = (result) => {
    const data = result?.data ?? result;
    return Array.isArray(data) ? data[0] : data;
};
const rankLabel = (rank) => (rank && rank <= 25 ? `#${rank}` : 'Unranked');

const markFrom = (teamsMap, name, teamObject) => teamsMap[name] || (teamObject ? toEntry(teamObject) : { name });

const CoachLink = ({ coach }) => {
    if (!coach) return '-';
    return <Box component={Link} to={`/user-details/${coach}`} sx={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>@{coach}</Box>;
};

CoachLink.propTypes = { coach: PropTypes.string };

const GameDetails = ({ isAdmin }) => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const teamsMap = useTeamsMap();
    const { mode } = useColorMode();
    const [adminBusy, setAdminBusy] = useState('');
    const [adminMessage, setAdminMessage] = useState(null);

    const [game, setGame] = useState(null);
    const [plays, setPlays] = useState([]);
    const [awayStats, setAwayStats] = useState(null);
    const [homeStats, setHomeStats] = useState(null);
    const [awayTeam, setAwayTeam] = useState(null);
    const [homeTeam, setHomeTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useSeo({
        title: game ? `${game.away_team} at ${game.home_team} | FCFB` : 'Game Details | FCFB',
        description: game ? `Box score, win probability, and play-by-play for ${game.away_team} at ${game.home_team}.` : 'Game details in Fake College Football.',
    });

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                const gameData = await getGameById(gameId);
                if (!active) return;
                setGame(gameData);
                const [playsRes, awayStatsRes, homeStatsRes, awayTeamData, homeTeamData] = await Promise.all([
                    getAllPlaysByGameId(gameId).catch(() => []),
                    getGameStatsByIdAndTeam(gameId, gameData.away_team).catch(() => null),
                    getGameStatsByIdAndTeam(gameId, gameData.home_team).catch(() => null),
                    getTeamByName(gameData.away_team).catch(() => null),
                    getTeamByName(gameData.home_team).catch(() => null),
                ]);
                if (!active) return;
                const playList = playsRes?.data ?? playsRes;
                setPlays(Array.isArray(playList) ? playList : []);
                setAwayStats(unwrap(awayStatsRes));
                setHomeStats(unwrap(homeStatsRes));
                setAwayTeam(awayTeamData);
                setHomeTeam(homeTeamData);
            } catch {
                if (active) setError('Failed to load game details. Please try again.');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [gameId]);

    const awayMark = useMemo(() => (game ? markFrom(teamsMap, game.away_team, awayTeam) : null), [game, teamsMap, awayTeam]);
    const homeMark = useMemo(() => (game ? markFrom(teamsMap, game.home_team, homeTeam) : null), [game, teamsMap, homeTeam]);

    if (loading) {
        return <PageWrap><Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box></PageWrap>;
    }
    if (error || !game) {
        return <PageWrap><Alert severity="error">{error || 'Game not found.'}</Alert></PageWrap>;
    }

    const awayColor = pickTeamColor(awayMark, mode);
    const homeColor = pickTeamColor(homeMark, mode);
    const headerTitle = gameHeaderTitle(game, conferenceLabel(homeTeam?.conference));
    const isFinal = game.game_status === 'FINAL';
    const homeWin = game.home_score > game.away_score;
    const spreadText = game.home_vegas_spread != null ? `${homeMark?.abbreviation} ${game.home_vegas_spread > 0 ? '+' : ''}${game.home_vegas_spread}` : null;
    const orderedPlays = [...plays].sort((a, b) =>
        ((a.play_number ?? 0) - (b.play_number ?? 0))
        || ((a.quarter ?? 0) - (b.quarter ?? 0))
        || ((b.clock ?? 0) - (a.clock ?? 0))
        || ((a.play_id ?? 0) - (b.play_id ?? 0)));

    const ADMIN_SUCCESS_MESSAGES = {
        chew: 'Chew mode set.',
        stats: 'Game stats regenerated.',
        end: 'Game ended.',
    };

    const runAdmin = async (key, action) => {
        setAdminBusy(key);
        setAdminMessage(null);
        try {
            await action();
            setAdminMessage({ severity: 'success', text: ADMIN_SUCCESS_MESSAGES[key] });
            if (key === 'end') {
                const refreshed = await getGameById(gameId).catch(() => null);
                if (refreshed) setGame(refreshed);
            }
        } catch (actionError) {
            setAdminMessage({ severity: 'error', text: actionError.message });
        } finally {
            setAdminBusy('');
        }
    };

    const hasOt = Boolean(awayStats?.ot_score || homeStats?.ot_score);
    const quarterKeys = ['q1_score', 'q2_score', 'q3_score', 'q4_score', ...(hasOt ? ['ot_score'] : [])];
    const columns = ['Q1', 'Q2', 'Q3', 'Q4', ...(hasOt ? ['OT'] : [])];
    const awayQuarters = quarterKeys.map((key) => awayStats?.[key]);
    const homeQuarters = quarterKeys.map((key) => homeStats?.[key]);
    const showQuarters = Boolean(awayStats && homeStats) && [...awayQuarters, ...homeQuarters].some((value) => value != null);

    const infoRows = [
        { label: 'Conference', away: <ConferenceMark conference={awayTeam?.conference} size={20} />, home: <ConferenceMark conference={homeTeam?.conference} size={20} /> },
        { label: 'Record', away: `${game.away_wins || 0}-${game.away_losses || 0}`, home: `${game.home_wins || 0}-${game.home_losses || 0}` },
        { label: 'Ranking', away: rankLabel(game.away_team_rank), home: rankLabel(game.home_team_rank) },
        { label: 'ELO', away: awayTeam?.current_elo != null ? Math.round(awayTeam.current_elo) : '-', home: homeTeam?.current_elo != null ? Math.round(homeTeam.current_elo) : '-' },
        { label: 'Offense', away: formatOffensivePlaybook(game.away_offensive_playbook), home: formatOffensivePlaybook(game.home_offensive_playbook) },
        { label: 'Defense', away: formatDefensivePlaybook(game.away_defensive_playbook), home: formatDefensivePlaybook(game.home_defensive_playbook) },
        { label: 'Coach', away: <CoachLink coach={game.away_coaches?.[0]} />, home: <CoachLink coach={game.home_coaches?.[0]} /> },
    ];

    const threadLink = game.home_platform === 'DISCORD' && game.home_platform_id
        ? `https://discord.com/channels/862571689342533663/${game.home_platform_id}`
        : null;

    const coinWinner = game.coin_toss_winner === 'HOME' ? homeMark?.abbreviation : game.coin_toss_winner === 'AWAY' ? awayMark?.abbreviation : null;
    const detailRows = [
        ['Coin toss', coinWinner ? `${coinWinner}${game.coin_toss_choice ? `, ${String(game.coin_toss_choice).replace(/_/g, ' ').toLowerCase()}` : ''}` : '-'],
        ['TV', game.tv_channel || '-'],
        ['Vegas spread', game.home_vegas_spread != null ? `${homeMark?.abbreviation} ${game.home_vegas_spread > 0 ? '+' : ''}${game.home_vegas_spread}` : '-'],
        ['Plays', game.num_plays || '-'],
        ['Game type', gameTypeName(game.game_type)],
        ['Game ID', game.game_id],
    ];

    const wpSeries = buildWinProbSeries(orderedPlays);
    const scoreSeries = buildScoreSeries(orderedPlays);
    if (isFinal && wpSeries.length > 0) {
        const last = wpSeries[wpSeries.length - 1];
        const terminal = homeWin ? 100 : 0;
        if (last.homeWinProb !== terminal) {
            wpSeries.push({ ...last, index: last.index + 1, homeWinProb: terminal, clock: '0:00', awayScore: game.away_score, homeScore: game.home_score });
        }
    }
    const wpMarks = quarterBoundaries(wpSeries);
    const teamHeader = (mark, name) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
            <TeamMark team={mark} size={22} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{mark?.name || name}</Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{mark?.abbreviation || name}</Box>
        </Box>
    );

    return (
        <PageWrap>
            <PageHeading eyebrow={headerTitle} title="Game detail">
                <Box component="button" type="button" onClick={() => goBackOr(navigate, '/scoreboard')} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: 1.25, py: 0.6, fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', font: 'inherit' }}>
                    <ArrowBack sx={{ fontSize: 15 }} /> Scoreboard
                </Box>
            </PageHeading>

            <GameScorebug game={game} awayMark={awayMark} homeMark={homeMark} homeTeam={homeTeam} awayColor={awayColor} homeColor={homeColor} spreadText={spreadText} threadLink={threadLink} columns={columns} awayQuarters={awayQuarters} homeQuarters={homeQuarters} showQuarters={showQuarters} />

            {isAdmin && (
                <Box sx={{ mt: '16px' }}>
                    {adminMessage && <Alert severity={adminMessage.severity} sx={{ mb: 1 }} onClose={() => setAdminMessage(null)}>{adminMessage.text}</Alert>}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button variant="outlined" size="small" startIcon={<Assessment />} disabled={adminBusy === 'stats'} onClick={() => runAdmin('stats', () => generateGameStats(game.game_id))}>
                            Generate game stats
                        </Button>
                        {!isFinal && (
                            <Button variant="outlined" size="small" color="warning" startIcon={<RestaurantMenu />} disabled={adminBusy === 'chew'} onClick={() => runAdmin('chew', () => chewGameByGameId(game.game_id))}>
                                Chew game
                            </Button>
                        )}
                        {!isFinal && (
                            <Button variant="outlined" size="small" color="error" startIcon={<Stop />} disabled={adminBusy === 'end'} onClick={() => runAdmin('end', () => endGameByGameId(game.game_id))}>
                                End game
                            </Button>
                        )}
                    </Box>
                </Box>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '16px', mt: '16px', alignItems: 'start' }}>
                <Panel header="Game information">
                    <ComparisonTable awayHeader={teamHeader(awayMark, game.away_team)} homeHeader={teamHeader(homeMark, game.home_team)} sections={[{ rows: infoRows }]} />
                </Panel>
                <Panel header="Game details">
                    {detailRows.map(([label, value]) => (
                        <Box key={label} sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 1, px: 1.75, py: 1.6, borderBottom: '1px solid var(--line-soft)', fontSize: '0.88rem', '&:last-of-type': { borderBottom: 'none' } }}>
                            <Box component="span" sx={{ color: 'var(--text-muted)' }}>{label}</Box>
                            <Box component="span" sx={{ fontWeight: 700, textAlign: 'right' }}>{value}</Box>
                        </Box>
                    ))}
                </Panel>
            </Box>

            {(wpSeries.length > 1 || scoreSeries.length > 1) && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '16px', mt: '16px', alignItems: 'stretch' }}>
                    {wpSeries.length > 1 ? (
                        <Panel header="Win probability" sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <WinProbChart series={wpSeries} homeColor={homeColor} awayColor={awayColor} homeMark={homeMark} awayMark={awayMark} quarterMarks={wpMarks} />
                            </Box>
                        </Panel>
                    ) : <span />}
                    {scoreSeries.length > 1 ? (
                        <Panel header="Score" sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <ScoreChart series={scoreSeries} homeColor={homeColor} awayColor={awayColor} homeAbbr={homeMark?.abbreviation} awayAbbr={awayMark?.abbreviation} />
                                <Box sx={{ display: 'flex', gap: 2, mt: 1, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><Box sx={{ width: 11, height: 3, borderRadius: '2px', background: awayColor }} />{awayMark?.name || game.away_team}</Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><Box sx={{ width: 11, height: 3, borderRadius: '2px', background: homeColor }} />{homeMark?.name || game.home_team}</Box>
                                </Box>
                            </Box>
                        </Panel>
                    ) : <span />}
                </Box>
            )}

            {awayStats && homeStats && (
                <>
                    <SectionTitle title="Game statistics" />
                    <Box sx={{ columnCount: { xs: 1, sm: 2, lg: 3 }, columnGap: '16px' }}>
                        {STAT_GROUPS.map(([group, rows]) => (
                            <Box key={group} sx={{ breakInside: 'avoid', mb: '16px' }}>
                                <Panel header={group}>
                                    <ComparisonTable
                                        awayHeader={<TeamMark team={awayMark} size={20} />}
                                        homeHeader={<TeamMark team={homeMark} size={20} />}
                                        sections={[{ rows: rows.map((row) => ({ label: row.label, away: statCell(row, awayStats), home: statCell(row, homeStats) })) }]}
                                    />
                                </Panel>
                            </Box>
                        ))}
                    </Box>
                </>
            )}

            {plays.length > 0 && (
                <Box sx={{ mt: '16px' }}>
                    <PlaysPanel plays={plays} homeAbbr={homeMark?.abbreviation} awayAbbr={awayMark?.abbreviation} homeName={game.home_team} awayName={game.away_team} />
                </Box>
            )}
        </PageWrap>
    );
};

GameDetails.propTypes = {
    isAdmin: PropTypes.bool,
};

export default GameDetails;
