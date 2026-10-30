import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import RetireStadiumButton from './RetireStadiumButton';
import StadiumHistoryButton from './StadiumHistoryButton';

const StadiumAdminTools = ({ stadium, onChanged }) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <StadiumHistoryButton stadium={stadium.name} canRevert onReverted={onChanged} />
        <RetireStadiumButton stadium={stadium} onChanged={onChanged} />
    </Box>
);

StadiumAdminTools.propTypes = {
    stadium: PropTypes.shape({ name: PropTypes.string.isRequired, active: PropTypes.bool.isRequired }).isRequired,
    onChanged: PropTypes.func.isRequired,
};

export default StadiumAdminTools;
