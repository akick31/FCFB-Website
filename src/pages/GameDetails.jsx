import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    CircularProgress,
    TableBody,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableSortLabel,
    Typography,
    Box
} from "@mui/material";
import {
    CenteredContainer,
    ErrorText,
    InfoText
} from "../styles/GamesStyles";
import { getAllPlaysForGame } from "../api/playApi";
import TablePagination from '@mui/material/TablePagination';
import { getGameStatsForTeam } from "../api/gameStatsApi";
import { getGameById } from "../api/gameApi"; // Assuming this is your stats API

const GameDetails = () => {
    const { gameId } = useParams();
    const [plays, setPlays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [game, setGame] = useState(null);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Sorting state
    const [orderBy, setOrderBy] = useState('play_number');
    const [order, setOrder] = useState('asc');

    useEffect(() => {
        const fetchGame = async (gameId) => {
            try {
                const response = await getGameById(gameId);
                setGame(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching game:", error);
                setError("Failed to load game");
                setLoading(false);
            }
        };

        fetchGame(gameId);
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
                    console.error("Error fetching plays:", error);
                    setError("Failed to load plays");
                    setLoading(false);
                }
            }
        };

        fetchPlays();
    }, [game, gameId, orderBy, order]); // Dependency on game so it triggers when game is available

    useEffect(() => {
        if (game) {
            const fetchStats = async (team) => {
                try {
                    const response = await getGameStatsForTeam(gameId, team); // Or 'away', depending on which team you want stats for
                    setStats((prevStats) => ({ ...prevStats, [team]: response.data }));
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching stats:", error);
                    setError("Failed to load stats");
                    setLoading(false);
                }
            };

            fetchStats(game.home_team);
            fetchStats(game.away_team);
        }
    }, [game, gameId]);

    // Sorting handler
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Compute game summary
    const computeGameSummary = () => {
        if (plays.length === 0) return null;

        const lastPlay = plays[plays.length - 1];

        return {
            totalPlays: plays.length,
            homeScore: lastPlay.home_score,
            awayScore: lastPlay.away_score,
        };
    };

    if (loading) {
        return (
            <CenteredContainer>
                <CircularProgress />
            </CenteredContainer>
        );
    }

    if (error) {
        return (
            <CenteredContainer>
                <ErrorText>{error}</ErrorText>
            </CenteredContainer>
        );
    }

    if (plays.length === 0) {
        return (
            <CenteredContainer>
                <InfoText>No plays available for this game</InfoText>
            </CenteredContainer>
        );
    }

    if (!game) {
        return (
            <CenteredContainer>
                <ErrorText>Game data is still loading...</ErrorText>
            </CenteredContainer>
        );
    }

    const gameSummary = computeGameSummary();

    return (
        <Box sx={{ width: '100%', padding: 2 }}>
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    marginBottom: 3
                }}
            >
                Game Details
            </Typography>

            {gameSummary && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: 3
                    }}
                >
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            marginRight: 2,
                            fontWeight: 'medium'
                        }}
                    >
                        Total Plays: {gameSummary.totalPlays}
                    </Typography>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            fontWeight: 'medium'
                        }}
                    >
                        Final Score: {gameSummary.homeScore} - {gameSummary.awayScore}
                    </Typography>
                </Box>
            )}

            {/* Displaying stats table */}
            {stats && Object.keys(stats).map((statKey) => (
                <TableContainer component={Paper} sx={{ width: '100%', marginBottom: 3 }} key={statKey}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                            <TableRow>
                                <TableCell>{statKey.replace(/_/g, ' ').toUpperCase()}</TableCell>
                                <TableCell>{stats[statKey]}</TableCell>
                            </TableRow>
                        </TableHead>
                    </Table>
                </TableContainer>
            ))}

            {/* Displaying plays table */}
            <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                        <TableRow>
                            {[
                                'play_number', 'home_score', 'away_score', 'quarter',
                                'clock', 'ball_location', 'possession', 'down',
                                'yards_to_go', 'defensive_number', 'offensive_number',
                                'difference', 'defensive_submitter', 'offensive_submitter',
                                'play_call', 'result', 'actual_result', 'yards',
                                'play_time', 'runoff_time', 'win_probability',
                                'win_probability_added', 'offensive_response_speed',
                                'defensive_response_speed'
                            ].map((headCell) => (
                                <TableCell key={headCell}>
                                    <TableSortLabel
                                        active={orderBy === headCell}
                                        direction={orderBy === headCell ? order : 'asc'}
                                        onClick={() => handleRequestSort(headCell)}
                                    >
                                        {headCell.replace(/_/g, ' ').toUpperCase()}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plays
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((play) => (
                                <TableRow
                                    key={play.play_number}
                                    hover
                                    sx={{
                                        backgroundColor:
                                            play.result === 'Touchdown' ? '#e6f2e6' :
                                                play.result === 'Turnover' ? '#f2e6e6' : 'inherit'
                                    }}
                                >
                                    <TableCell>{play.play_number}</TableCell>
                                    <TableCell>{play.home_score}</TableCell>
                                    <TableCell>{play.away_score}</TableCell>
                                    <TableCell>{play.quarter}</TableCell>
                                    <TableCell>{play.clock}</TableCell>
                                    <TableCell>{play.ball_location}</TableCell>
                                    <TableCell>{play.possession}</TableCell>
                                    <TableCell>{play.down}</TableCell>
                                    <TableCell>{play.yards_to_go}</TableCell>
                                    <TableCell>{play.defensive_number}</TableCell>
                                    <TableCell>{play.offensive_number}</TableCell>
                                    <TableCell>{play.difference}</TableCell>
                                    <TableCell>{play.defensive_submitter}</TableCell>
                                    <TableCell>{play.offensive_submitter}</TableCell>
                                    <TableCell>{play.play_call}</TableCell>
                                    <TableCell>{play.result}</TableCell>
                                    <TableCell>{play.actual_result}</TableCell>
                                    <TableCell>{play.yards}</TableCell>
                                    <TableCell>{play.play_time}</TableCell>
                                    <TableCell>{play.runoff_time}</TableCell>
                                    <TableCell>{play.win_probability}</TableCell>
                                    <TableCell>{play.win_probability_added}</TableCell>
                                    <TableCell>{play.offensive_response_speed}</TableCell>
                                    <TableCell>{play.defensive_response_speed}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={plays.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </Box>
    );
};

export default GameDetails;
