import React from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography } from '@mui/material';
import { byteArrayToBase64 } from "../utils/image";
import { StyledPaper, GameImage } from '../styles/GridStyles';

const ScorebugGrid = ({ games, scorebugs }) => {
    const navigate = useNavigate();
    return (
        <StyledPaper>
            <Grid container spacing={2} justifyContent="center">
                {games.map((game, index) => {
                    console.log(game.game_id); // Log the game_id to ensure all 18 are being iterated
                    return (
                        <Grid item xs={4} key={game.game_id}>
                            <Box
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                sx={{ width: '365px', height: '150px' }}
                            >
                                {scorebugs[game.game_id] ? (
                                    <GameImage
                                        src={byteArrayToBase64(scorebugs[game.game_id])}
                                        alt={`${game.home_team} vs ${game.away_team}`}
                                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                                        onClick={() => navigate(`/game-details/${game.game_id}`)}
                                    />
                                ) : (
                                    <Typography variant="body2" align="center">
                                        {game.home_team} {game.home_score} | {game.away_team} {game.away_score}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </StyledPaper>
    );
};

export default ScorebugGrid;
