import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {Box, Typography, Card, CardContent, Chip, useTheme, IconButton, Grid, Button, CircularProgress, Alert, Avatar} from "@mui/material";
import { ArrowBack, Assessment, Stop, AccessTime } from "@mui/icons-material";
import { getAllPlaysByGameId } from "../../api/playApi";
import { getGameById } from "../../api/gameApi";
import { getLatestScorebugByGameId } from "../../api/scorebugApi";
import PlaysTable from "../../components/game/plays/PlaysTable";
import ErrorMessage from "../../components/message/ErrorMessage";
import GameInfo from "../../components/game/GameInfo";
import {getGameStatsByIdAndTeam} from "../../api/gameStatsApi";
import GameStatsTable from "../../components/game/stats/GameStatsTable";
import {getTeamByName} from "../../api/teamApi";
import CustomScorebug from "../../components/game/CustomScorebug";
import { formatGameType } from "../../utils/gameUtils";
import PageLayout from "../../components/layout/PageLayout";
import LoadingSpinner from "../../components/icons/LoadingSpinner";
import { generateGameStats } from "../../api/gameStatsApi";
import { endGameByGameId, chewGameByGameId } from "../../api/gameApi";
import {
    AreaChart, Area, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip as RechartsTooltip,
    ReferenceLine, ResponsiveContainer
} from 'recharts';

const GameDetails = ({ isAdmin }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { gameId } = useParams();
    
    const [plays, setPlays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [game, setGame] = useState(null);
    const [gameStats, setGameStats] = useState({ home: null, away: null });
    const [homeTeam, setHomeTeam] = useState(null);
    const [awayTeam, setAwayTeam] = useState(null);
    const [scorebug, setScorebug] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('play_number');
    const [order, setOrder] = useState('desc');
    const [generatingStats, setGeneratingStats] = useState(false);
    const [generateError, setGenerateError] = useState(null);
    const [endingGame, setEndingGame] = useState(false);
    const [chewingGame, setChewingGame] = useState(false);
    const [gameControlError, setGameControlError] = useState(null);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const gameResponse = await getGameById(gameId);
                setGame(gameResponse);

                const scorebugResponse = await getLatestScorebugByGameId(gameId);
                setScorebug(scorebugResponse);

                const homeTeamResponse = await getTeamByName(gameResponse.home_team);
                const awayTeamResponse = await getTeamByName(gameResponse.away_team);
                setHomeTeam(homeTeamResponse);
                setAwayTeam(awayTeamResponse);
                document.title = `FCFB | ${gameResponse.away_team} vs ${gameResponse.home_team}`;

                const [homeStats, awayStats] = await Promise.all([
                    getGameStatsByIdAndTeam(gameId, gameResponse.home_team),
                    getGameStatsByIdAndTeam(gameId, gameResponse.away_team)
                ]);
                setGameStats({
                    home: homeStats.data,
                    away: awayStats.data
                });

                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };
        fetchGame();
    }, [gameId]);

    // Fetch plays for the game
    useEffect(() => {
        const fetchPlays = async () => {
            if (game) {
                try {
                    const response = await getAllPlaysByGameId(gameId);
                    const sortedPlays = response.sort((a, b) =>
                        a[orderBy] > b[orderBy] ? (order === 'asc' ? 1 : -1) :
                            a[orderBy] < b[orderBy] ? (order === 'asc' ? -1 : 1) : 0
                    );
                    setPlays(sortedPlays);
                } catch (error) {
                    console.error("Failed to load plays:", error);
                }
            }
        };
        fetchPlays();
    }, [game, gameId, orderBy, order]);

    // Compute chart data from plays (sorted ascending by play_number)
    const chartData = useMemo(() => {
        if (!plays || plays.length === 0) return { scoreData: [], wpData: [] };

        const sorted = [...plays].sort((a, b) => (a.play_number || 0) - (b.play_number || 0));

        const scoreData = [];
        const wpData = [];

        sorted.forEach((play, idx) => {
            const label = `P${play.play_number || idx + 1}`;
            const homeScore = play.home_score ?? play.homeScore ?? 0;
            const awayScore = play.away_score ?? play.awayScore ?? 0;

            scoreData.push({ play: label, home: homeScore, away: awayScore });

            const wp = play.win_probability != null ? parseFloat(play.win_probability) : null;
            if (wp != null) {
                const poss = play.possession || '';
                const homeWP = poss === 'HOME' ? wp * 100 : poss === 'AWAY' ? (1 - wp) * 100 : null;
                if (homeWP != null) {
                    const awayWP = 100 - homeWP;
                    wpData.push({ play: label, homeWP: Math.round(homeWP), awayWP: Math.round(awayWP) });
                }
            }
        });

        return { scoreData, wpData };
    }, [plays]);

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleGenerateStats = async () => {
        if (!gameId) return;
        
        setGeneratingStats(true);
        setGenerateError(null);
        
        try {
            await generateGameStats(parseInt(gameId));
            // Optionally refresh the game data after generation
            window.location.reload();
        } catch (error) {
            console.error('Error generating game stats:', error);
            setGenerateError(error.response?.data?.message || error.message || 'Failed to generate game stats');
        } finally {
            setGeneratingStats(false);
        }
    };

    const handleEndGame = async () => {
        if (!gameId) return;
        
        setEndingGame(true);
        setGameControlError(null);
        
        try {
            await endGameByGameId(parseInt(gameId));
            // Refresh the game data after ending
            window.location.reload();
        } catch (error) {
            console.error('Error ending game:', error);
            setGameControlError(error.response?.data?.message || error.message || 'Failed to end game');
        } finally {
            setEndingGame(false);
        }
    };

    const handleChewGame = async () => {
        if (!gameId) return;
        
        setChewingGame(true);
        setGameControlError(null);
        
        try {
            await chewGameByGameId(parseInt(gameId));
            // Refresh the game data after chewing
            window.location.reload();
        } catch (error) {
            console.error('Error chewing game:', error);
            setGameControlError(error.response?.data?.message || error.message || 'Failed to chew game');
        } finally {
            setChewingGame(false);
        }
    };

    if (loading) {
        return (
            <PageLayout
                title="Game Details"
                subtitle="Loading game information..."
            >
                <LoadingSpinner />
            </PageLayout>
        );
    }

    if (error || !game) {
        return (
            <PageLayout
                title="Game Details"
                subtitle="Error loading game"
            >
                <ErrorMessage message={error || 'Game not found'} />
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title=""
            subtitle=""
        >
            {/* Back Button */}
            <Box component="a" href="/scoreboard" onClick={(e) => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); navigate('/scoreboard'); } }} sx={{ mb: 3, display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                <IconButton
                    sx={{
                        color: theme.palette.primary.main,
                        '&:hover': { backgroundColor: theme.palette.primary.light + '20' }
                    }}
                >
                    <ArrowBack />
                </IconButton>
                <Typography variant="body2" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                    Back to Scoreboard
                </Typography>
            </Box>

            {/* Game Header with Scorebug */}
            <Box sx={{
                mb: 4,
                p: { xs: 2, md: 4 },
                backgroundColor: 'background.paper',
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[2],
                textAlign: 'center'
            }}>
                <Typography variant="h3" sx={{
                    fontWeight: 700,
                    mb: 1,
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                    color: theme.palette.primary.main
                }}>
                    <Box
                        component="a"
                        href={awayTeam?.id ? `/team-details/${awayTeam.id}` : undefined}
                        onClick={(e) => { if (awayTeam?.id) { if (!e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); navigate(`/team-details/${awayTeam.id}`); } } }}
                        sx={{
                            cursor: awayTeam?.id ? 'pointer' : 'default',
                            color: 'inherit', textDecoration: 'none',
                            '&:hover': awayTeam?.id ? { textDecoration: 'underline' } : {},
                        }}
                    >
                        {awayTeam?.name || game.away_team}
                    </Box>
                    {' vs '}
                    <Box
                        component="a"
                        href={homeTeam?.id ? `/team-details/${homeTeam.id}` : undefined}
                        onClick={(e) => { if (homeTeam?.id) { if (!e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); navigate(`/team-details/${homeTeam.id}`); } } }}
                        sx={{
                            cursor: homeTeam?.id ? 'pointer' : 'default',
                            color: 'inherit', textDecoration: 'none',
                            '&:hover': homeTeam?.id ? { textDecoration: 'underline' } : {},
                        }}
                    >
                        {homeTeam?.name || game.home_team}
                    </Box>
                </Typography>

                {/* Season, Week, Game Type, and Spread Chips */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                    {game.season && (
                        <Chip
                            label={`Season ${game.season}`}
                            variant="outlined"
                            sx={{ fontWeight: 600, borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}
                        />
                    )}
                    {game.week && (
                        <Chip
                            label={`Week ${game.week}`}
                            variant="outlined"
                            sx={{ fontWeight: 600, borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}
                        />
                    )}
                    {game.game_type && (
                        <Chip
                            label={formatGameType(game.game_type)}
                            variant="outlined"
                            sx={{ fontWeight: 600, borderColor: theme.palette.primary.main, color: theme.palette.primary.main }}
                        />
                    )}
                    {game.home_vegas_spread !== null && game.home_vegas_spread !== undefined && (
                        <Chip
                            label={`${homeTeam?.abbreviation || game.home_team} ${game.home_vegas_spread > 0 ? '+' : ''}${game.home_vegas_spread}`}
                            variant="outlined"
                            sx={{ 
                                fontWeight: 600, 
                                borderColor: theme.palette.secondary.main, 
                                color: theme.palette.secondary.main,
                                backgroundColor: theme.palette.secondary.light + '20'
                            }}
                        />
                    )}
                    {(game.game_mode === 'CHEW') && (
                        <Chip
                            label="Chew Mode"
                            variant="filled"
                            sx={{ 
                                fontWeight: 600, 
                                backgroundColor: theme.palette.error.main,
                                color: 'white'
                            }}
                        />
                    )}
                </Box>

                {/* Postseason Game Logo - shown for bowl/playoff/conference championship/national championship games */}
                {game?.postseason_game_logo && (game?.game_type === 'BOWL' || game?.game_type === 'PLAYOFFS' || game?.game_type === 'CONFERENCE_CHAMPIONSHIP' || game?.game_type === 'NATIONAL_CHAMPIONSHIP') && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Avatar
                            src={`${process.env.REACT_APP_API_URL || 'http://localhost:1313'}/images/${game.postseason_game_logo}`}
                            sx={{ width: 120, height: 120 }}
                            variant="rounded"
                        />
                    </Box>
                )}

                {/* Game ID and Number of Plays */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 2,
                    flexWrap: 'wrap'
                }}>
                    <Typography variant="body2" sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                    }}>
                        Game ID: {game?.game_id || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                    }}>
                        |
                    </Typography>
                    <Typography variant="body2" sx={{ 
                        color: 'text.secondary',
                        fontSize: '0.875rem'
                    }}>
                        Plays: {game?.num_plays || 'N/A'}
                    </Typography>
                </Box>

                {/* Admin Controls */}
                {isAdmin && (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: 2,
                        mb: 2,
                        flexWrap: 'wrap'
                    }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleGenerateStats}
                            disabled={generatingStats}
                            startIcon={generatingStats ? <CircularProgress size={20} /> : <Assessment />}
                            sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            {generatingStats ? 'Generating Stats...' : 'Generate Game Stats'}
                        </Button>
                        {game?.game_status !== 'FINAL' && (
                            <>
                                <Button
                                    variant="contained"
                                    color="warning"
                                    onClick={handleChewGame}
                                    disabled={chewingGame}
                                    startIcon={chewingGame ? <CircularProgress size={20} /> : <AccessTime />}
                                    sx={{ 
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    {chewingGame ? 'Chewing Game...' : 'Chew Game'}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleEndGame}
                                    disabled={endingGame}
                                    startIcon={endingGame ? <CircularProgress size={20} /> : <Stop />}
                                    sx={{ 
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    {endingGame ? 'Ending Game...' : 'End Game'}
                                </Button>
                            </>
                        )}
                    </Box>
                )}

                {(generateError || gameControlError) && (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 2
                    }}>
                        <Alert 
                            severity="error" 
                            onClose={() => {
                                setGenerateError(null);
                                setGameControlError(null);
                            }}
                        >
                            {generateError || gameControlError}
                        </Alert>
                    </Box>
                )}

                {scorebug && (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mt: 1
                    }}>
                        <CustomScorebug
                            game={game}
                            homeTeam={homeTeam}
                            awayTeam={awayTeam}
                        />
                    </Box>
                )}
            </Box>

            {/* ─── Charts: Score + Win Probability ─── */}
            {(chartData.scoreData.length > 0 || chartData.wpData.length > 0) && (() => {
                const homeColor = homeTeam?.primary_color || theme.palette.primary.main;
                const awayColor = awayTeam?.primary_color || theme.palette.error.main;

                return (
                    <Box sx={{ mb: 4 }}>
                        <Grid container spacing={3}>
                            {/* Score Chart */}
                            {chartData.scoreData.length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[1] }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: '1rem', color: theme.palette.primary.main }}>
                                                Score by Play
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Box sx={{ width: 14, height: 3, backgroundColor: homeColor, borderRadius: 1 }} />
                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{homeTeam?.name || game.home_team}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Box sx={{ width: 14, height: 3, backgroundColor: awayColor, borderRadius: 1 }} />
                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{awayTeam?.name || game.away_team}</Typography>
                                                </Box>
                                            </Box>
                                            <ResponsiveContainer width="100%" height={240}>
                                                <LineChart data={chartData.scoreData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                                    <XAxis dataKey="play" tick={false} axisLine={false} />
                                                    <YAxis fontSize={11} />
                                                    <RechartsTooltip
                                                        formatter={(value, name) => [value, name === 'home' ? (homeTeam?.name || game.home_team) : (awayTeam?.name || game.away_team)]}
                                                        labelFormatter={(label) => `Play ${label?.replace('P', '')}`}
                                                    />
                                                    <Line type="stepAfter" dataKey="home" name="home" stroke={homeColor} strokeWidth={2} dot={false} />
                                                    <Line type="stepAfter" dataKey="away" name="away" stroke={awayColor} strokeWidth={2} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}

                            {/* Win Probability Chart */}
                            {chartData.wpData.length > 0 && (
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[1] }}>
                                        <CardContent>
                                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: '1rem', color: theme.palette.primary.main }}>
                                                Win Probability
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: homeColor }} />
                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{homeTeam?.name || game.home_team}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: awayColor }} />
                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>{awayTeam?.name || game.away_team}</Typography>
                                                </Box>
                                            </Box>
                                            <ResponsiveContainer width="100%" height={240}>
                                                <AreaChart data={chartData.wpData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                                                    <defs>
                                                        <linearGradient id="wpFillGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor={homeColor} stopOpacity={0.5} />
                                                            <stop offset="50%" stopColor={homeColor} stopOpacity={0.15} />
                                                            <stop offset="50%" stopColor={awayColor} stopOpacity={0.15} />
                                                            <stop offset="100%" stopColor={awayColor} stopOpacity={0.5} />
                                                        </linearGradient>
                                                        <linearGradient id="wpStrokeGradient" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="0%" stopColor={homeColor} />
                                                            <stop offset="50%" stopColor={homeColor} />
                                                            <stop offset="50%" stopColor={awayColor} />
                                                            <stop offset="100%" stopColor={awayColor} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                                    <XAxis dataKey="play" tick={false} axisLine={false} />
                                                    <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={v => `${v}%`} fontSize={11} />
                                                    <ReferenceLine y={50} stroke={theme.palette.text.disabled} strokeDasharray="4 4" strokeWidth={1.5} />
                                                    <RechartsTooltip
                                                        formatter={(value) => {
                                                            const isHomeFavored = value >= 50;
                                                            const teamName = isHomeFavored
                                                                ? (homeTeam?.name || game.home_team)
                                                                : (awayTeam?.name || game.away_team);
                                                            const pct = isHomeFavored ? value : 100 - value;
                                                            return [`${pct}%`, `${teamName} Win Prob`];
                                                        }}
                                                        labelFormatter={(label) => `Play ${label?.replace('P', '')}`}
                                                    />
                                                    <Area type="monotone" dataKey="homeWP" stroke="url(#wpStrokeGradient)" strokeWidth={2.5} fill="url(#wpFillGradient)" baseValue={50} dot={false} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                );
            })()}

            {/* Game Info and Stats */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ p: 0, borderRadius: 3, boxShadow: theme.shadows[2], height: '100%' }}>
                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                <Typography variant="h5" sx={{
                                    fontWeight: 700,
                                    mb: 3,
                                    textAlign: 'center',
                                    color: theme.palette.primary.main
                                }}>
                                    Game Information
                                </Typography>
                                <GameInfo game={game} homeTeam={homeTeam} awayTeam={awayTeam} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ p: 0, borderRadius: 3, boxShadow: theme.shadows[2], height: '100%' }}>
                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                <Typography variant="h5" sx={{
                                    fontWeight: 700,
                                    mb: 3,
                                    textAlign: 'center',
                                    color: theme.palette.primary.main
                                }}>
                                    Game Statistics
                                </Typography>
                                <GameStatsTable
                                    homeTeam={homeTeam}
                                    awayTeam={awayTeam}
                                    homeStats={gameStats.home}
                                    awayStats={gameStats.away}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Plays Table */}
            <Card sx={{ p: 0, borderRadius: 3, boxShadow: theme.shadows[2], overflow: 'hidden' }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography variant="h5" sx={{
                        fontWeight: 700,
                        mb: 3,
                        textAlign: 'center',
                        color: theme.palette.primary.main
                    }}>
                        Game Plays
                    </Typography>
                    <PlaysTable
                        plays={plays}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        handleChangePage={handleChangePage}
                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                        orderBy={orderBy}
                        order={order}
                        handleRequestSort={handleRequestSort}
                    />
                </CardContent>
            </Card>
        </PageLayout>
    );
};

export default GameDetails;