import React from 'react';
import { Box } from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { legendSwatch } from './cellTone';

const Item = ({ marker, children }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {marker}
        {children}
    </Box>
);

Item.propTypes = { marker: PropTypes.node.isRequired, children: PropTypes.node.isRequired };

const ScheduleLegend = ({ independent, numConferenceGames }) => (
    <Box
        sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px 16px',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
        }}
    >
        <Item marker={<Box sx={legendSwatch('var(--brand)', 30)} />}>Conference</Item>
        {!independent && <Item marker={<Box sx={legendSwatch('var(--gold)', 30)} />}>Out of conference</Item>}
        <Item marker={<Box sx={legendSwatch('var(--disc)', 45)} />}>Neutral site</Item>
        <Item marker={<Box sx={{ color: 'var(--text-dim)' }}>vs / @</Box>}>Home / away</Item>
        <Item marker={<WarningAmber sx={{ color: 'var(--live)', fontSize: '0.85rem' }} />}>
            Under {numConferenceGames} conference games
        </Item>
        <Box sx={{ color: 'var(--text-dim)' }}>Click a cell to add, move or delete</Box>
    </Box>
);

ScheduleLegend.propTypes = {
    independent: PropTypes.bool,
    numConferenceGames: PropTypes.number.isRequired,
};

export default ScheduleLegend;
