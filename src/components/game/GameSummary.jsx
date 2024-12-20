import React from 'react';
import { Box, Typography } from "@mui/material";
import PropTypes from 'prop-types';

const GameSummary = ({ plays }) => {
    const lastPlay = plays[plays.length - 1];
    const totalPlays = plays.length;
    const homeScore = lastPlay ? lastPlay.home_score : 0;
    const awayScore = lastPlay ? lastPlay.away_score : 0;

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>
            <Typography variant="h6" sx={{ marginRight: 2 }}>
                Total Plays: {totalPlays}
            </Typography>
            <Typography variant="h6">
                Score: {homeScore} - {awayScore}
            </Typography>
        </Box>
    );
};

GameSummary.propTypes = {
    plays: PropTypes.array.isRequired,
}

export default GameSummary;