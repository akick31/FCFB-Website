import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { getAllPlaysForGame } from "../api/playApi";
import { getGameById } from "../api/gameApi";
import GameSummary from "../components/game/GameSummary";
import PlaysTable from "../components/game/PlaysTable";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

const GameDetails = () => {
    const { gameId } = useParams();
    const [plays, setPlays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [game, setGame] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('play_number');
    const [order, setOrder] = useState('asc');

    useEffect(() => {
        const fetchGame = async () => {
            try {
                const response = await getGameById(gameId);
                setGame(response.data);
                setLoading(false);
            } catch (error) {
                setError("Failed to load game");
                setLoading(false);
            }
        };
        fetchGame();
    }, [gameId]);

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
        <Box sx={{ width: '100%', padding: 2 }}>
            <Typography variant="h4" component="h1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>Game Details</Typography>

            {game && <GameSummary game={game} plays={plays} />}

            <PlaysTable plays={plays} page={page} rowsPerPage={rowsPerPage} orderBy={orderBy} order={order}
                        handleRequestSort={handleRequestSort} handleChangePage={handleChangePage} handleChangeRowsPerPage={handleChangeRowsPerPage} />
        </Box>
    );
};

export default GameDetails;