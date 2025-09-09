import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {Box, Typography, Card, CardContent, Chip, useTheme, IconButton, Grid, Button, CircularProgress, Alert} from "@mui/material";
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

const GameDetails = ({ user, isAdmin }) => {
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
    const [order, setOrder] = useState('asc');
    const [generatingStats, setGeneratingStats] = useState(false);
    const [generateError, setGenerateError] = useState(null);
    const [endingGame, setEndingGame] = useState(false);
    const [chewingGame, setChewingGame] = useState(false);
    const [gameControlError, setGameControlError] = useState(null);

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const gameResponse = await getGameById(gameId);
                console.log(gameResponse);
                setGame(gameResponse);

                const scorebugResponse = await getLatestScorebugByGameId(gameId);
                setScorebug(scorebugResponse);

                const homeTeamResponse = await getTeamByName(gameResponse.home_team);
                const awayTeamResponse = await getTeamByName(gameResponse.away_team);
                setHomeTeam(homeTeamResponse);
                setAwayTeam(awayTeamResponse);

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
            <Box sx={{ mb: 3 }}>
                <IconButton
                    onClick={() => navigate('/scoreboard')}
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
                    {awayTeam?.name || game.away_team} vs {homeTeam?.name || game.home_team}
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
                </Box>

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