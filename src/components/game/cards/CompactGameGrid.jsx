import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import CompactGameTile from './CompactGameTile';

const CompactGameGrid = ({ games, minTile = 220 }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${minTile}px, 1fr))`, gap: '8px' }}>
        {games.map((game) => (
            <CompactGameTile key={game.game_id} game={game} />
        ))}
    </Box>
);

CompactGameGrid.propTypes = {
    games: PropTypes.arrayOf(PropTypes.object).isRequired,
    minTile: PropTypes.number,
};

export default CompactGameGrid;
