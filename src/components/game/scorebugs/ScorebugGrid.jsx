import React from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography, CardMedia } from '@mui/material';
import { StyledPaper } from '../../../styles/GridStyles';
import PropTypes from 'prop-types';

const ScorebugGrid = ({ games }) => {
    const navigate = useNavigate();

    const handleCardClick = (gameId) => {
        navigate(`/game-details/${gameId}`);
    };

    return (
        <StyledPaper>
            <Grid container spacing={2} justifycontent="center">
                {games.map((game) => (
                    <Grid item xs={12} sm={6} md={2.4} key={game.gameId}>
                        <Box
                            onClick={() => handleCardClick(game.gameId)}
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
                                    alt={`${game.homeTeam} vs ${game.awayTeam}`}
                                    sx={{ objectFit: 'contain' }}
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
        </StyledPaper>
    );
};

ScorebugGrid.propTypes = {
    games: PropTypes.array.isRequired,
};

export default ScorebugGrid;