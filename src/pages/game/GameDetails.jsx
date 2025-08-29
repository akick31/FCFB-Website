import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {Box, Typography, Card, CardContent, Chip, useTheme, IconButton, Grid} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
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

const GameDetails = () => {
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

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const gameResponse = await getGameById(gameId);
                setGame(gameResponse.data);

                const scorebugResponse = await getLatestScorebugByGameId(gameId);
                setScorebug(scorebugResponse);

                const homeTeamResponse = await getTeamByName(gameResponse.data.home_team);
                const awayTeamResponse = await getTeamByName(gameResponse.data.away_team);
                setHomeTeam(homeTeamResponse);
                setAwayTeam(awayTeamResponse);

                const [homeStats, awayStats] = await Promise.all([
                    getGameStatsByIdAndTeam(gameId, gameResponse.data.home_team),
                    getGameStatsByIdAndTeam(gameId, gameResponse.data.away_team)
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
                    const sortedPlays = response.data.sort((a, b) =>
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

                {/* Season, Week, and Game Type Chips */}
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