import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {Box, Typography, useTheme, CircularProgress} from "@mui/material";
import { getAllPlaysForGame } from "../api/playApi";
import { getGameById } from "../api/gameApi";
import PlaysTable from "../components/game/plays/PlaysTable";
import ErrorMessage from "../components/message/ErrorMessage";
import GameInfo from "../components/game/GameInfo";
import {Header} from "../styles/GamesStyles";
import {getGameStatsByIdAndTeam} from "../api/gameStatsApi";
import GameStats from "../components/game/stats/GameStats";
import {getTeamByName} from "../api/teamApi";
import ScoreSummary from "../components/game/scoreboard/ScoreSummary";

const GameDetails = () => {
    const theme = useTheme();
    const { gameId } = useParams();
    const [plays, setPlays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [game, setGame] = useState(null);
    const [gameStats, setGameStats] = useState({ home: null, away: null });
    const [homeTeam, setHomeTeam] = useState(null);
    const [awayTeam, setAwayTeam] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('play_number');
    const [order, setOrder] = useState('asc');

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const gameResponse = await getGameById(gameId);
                setGame(gameResponse.data);

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
                    const response = await getAllPlaysForGame(gameId);
                    const sortedPlays = response.data.sort((a, b) =>
                        a[orderBy] > b[orderBy] ? (order === 'asc' ? 1 : -1) :
                            a[orderBy] < b[orderBy] ? (order === 'asc' ? -1 : 1) : 0
                    );
                    setPlays(sortedPlays);
                    setLoading(false);
                } catch (error) {
                    setError("Failed to load plays");
                    setLoading(false);
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
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <Box>
            {/* Header Section */}
            <Header>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#004260' }}>
                    Game Details
                </Typography>
            </Header>
            {game && homeTeam && awayTeam && gameStats.home && gameStats.away && (
                <Box sx={{
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: 4,
                    width: '100%',
                }}>
                    <ScoreSummary
                        game={game}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                        homeStats={gameStats.home}
                        awayStats={gameStats.away}
                    />
                </Box>
            )}

            {/* Game Info Section */}
            {game && homeTeam && awayTeam && (
                <Box sx={{ mb: 4, mt: 4 }}>
                    <GameInfo
                        game={game}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                    />
                </Box>
            )}

            {/* Game Stats Section */}
            {gameStats.home && gameStats.away && homeTeam && awayTeam && (
                <Box sx={{ mb: 4, mt: 4 }}>
                    <GameStats
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                        homeStats={gameStats.home}
                        awayStats={gameStats.away}
                    />
                </Box>
            )}

            {/* Plays Table Section */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Play-by-Play
                </Typography>
                <PlaysTable
                    plays={plays}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    orderBy={orderBy}
                    order={order}
                    handleRequestSort={handleRequestSort}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Box>
        </Box>
    );
};

export default GameDetails;