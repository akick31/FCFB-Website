import React from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography, CardMedia, Pagination } from '@mui/material';
import { StyledPaper } from '../../styles/GridStyles';
import PropTypes from 'prop-types';

const ScorebugGrid = ({ games, onPageChange, totalGames, currentPage }) => {
    const navigate = useNavigate();

    const handleCardClick = (gameId) => {
        navigate(`/game-details/${gameId}`);
    };

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalGames / 20); // Assuming 20 items per page

    const handlePaginationChange = (event, page) => {
        onPageChange(page - 1); // Page is 1-based, but your `filters.page` is 0-based
    };

    return (
        <StyledPaper>
            <Grid container spacing={2} justifycontent="center">
                {games.map((game) => (
                    <Grid item xs={12} sm={6} md={2.4} key={game["game_id"]}>
                        <Box
                            onClick={() => handleCardClick(game["game_id"])}
                            sx={{
                                cursor: 'pointer',
                                width: "125px",
                                height: "140px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "transparent",
                                boxShadow: "none",
                                border: "none",
                                margin: "auto",
                            }}
                        >
                            {game.scorebug ? (
                                <CardMedia
                                    display="flex"
                                    justifycontent="center"
                                    component="img"
                                    height="140"
                                    width="140"
                                    image={`data:image/png;base64,${game.scorebug}`}
                                    alt={`${game["home_team"]} vs ${game["away_team"]}`}
                                    sx={{ objectFit: 'contain', boxShadow: 5 }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: 140,
                                        backgroundColor: 'grey.200',
                                    }}
                                >
                                    <Typography variant="h6" color="textSecondary">
                                        No Scorebug Available
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage + 1} // Page is 1-based in Pagination component
                        onChange={handlePaginationChange}
                        color="#004260"
                    />
                </Box>
            )}
        </StyledPaper>
    );
};

ScorebugGrid.propTypes = {
    games: PropTypes.array.isRequired,
    onPageChange: PropTypes.func.isRequired,
    totalGames: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
};

export default ScorebugGrid;