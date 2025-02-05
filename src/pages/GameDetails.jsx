import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {Box, Typography, CardMedia, useTheme, Card} from "@mui/material";
import { getAllPlaysForGame } from "../api/playApi";
import { getGameById } from "../api/gameApi";
import { getLatestScorebugByGameId } from "../api/scorebugApi";
import PlaysTable from "../components/game/PlaysTable";
import LoadingSpinner from "../components/icons/LoadingSpinner";
import ErrorMessage from "../components/message/ErrorMessage";
import GameInfo from "../components/game/GameInfo";
import {Header} from "../styles/GamesStyles";

const GameDetails = () => {
    const theme = useTheme();
    const { gameId } = useParams();
    const [plays, setPlays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [game, setGame] = useState(null);
    const [scorebug, setScorebug] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('play_number');
    const [order, setOrder] = useState('asc');

    // Fetch game details and scorebug
    useEffect(() => {
        const fetchGame = async () => {
            try {
                const gameResponse = await getGameById(gameId);
                setGame(gameResponse.data);

                const scorebugResponse = await getLatestScorebugByGameId(gameId);
                setScorebug(scorebugResponse);

                setLoading(false);
            } catch (error) {
                setError("Failed to load game");
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
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <Box sx={theme.root}>
            <Card sx={theme.standardCard}>
                {/* Header Section */}
                <Header>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#004260' }}>
                        Game Details
                    </Typography>
                </Header>
                <Box sx={{
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: 4,
                    width: '100%',
                }}>
                    {scorebug && (
                        <CardMedia
                            component="img"
                            image={scorebug}
                            alt={`${game["home_team"]} vs ${game["away_team"]}`}
                            sx={{
                                width: 160,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            }}
                        />
                    )}
                </Box>

                {/* Game Info Section */}
                {game && (
                    <Box sx={{ mb: 4, mt: 4 }}>
                        <GameInfo game={game} />
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
            </Card>
        </Box>
    );
};

export default GameDetails;