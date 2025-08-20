import React from 'react';
import { Box, Grid } from '@mui/material';
import PropTypes from 'prop-types';
import TeamDetailsCard from './TeamDetailsCard';
import GameDetailsCard from './GameDetailsCard';

const GameInfo = ({ game, homeTeam, awayTeam }) => {
    if (!game) return null;

    return (
        <Box sx={{ p: 0 }}>
            {/* Team Details Section - First Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Home Team Details (Left) */}
                <Grid item xs={12} lg={6}>
                    <TeamDetailsCard
                        team={homeTeam}
                        game={game}
                        isHomeTeam={true}
                    />
                </Grid>

                {/* Away Team Details (Right) */}
                <Grid item xs={12} lg={6}>
                    <TeamDetailsCard
                        team={awayTeam}
                        game={game}
                        isHomeTeam={false}
                    />
                </Grid>
            </Grid>

            {/* Game Details Section - Second Row */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <GameDetailsCard
                        game={game}
                        homeTeam={homeTeam}
                        awayTeam={awayTeam}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

GameInfo.propTypes = {
    game: PropTypes.object.isRequired,
    homeTeam: PropTypes.object,
    awayTeam: PropTypes.object
};

export default GameInfo;