import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import TeamMark from './TeamMark';

const TeamName = ({ name, size = 18, label, sx }) =>
    name ? (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '7px', minWidth: 0, ...sx }}>
            <TeamMark team={{ name }} size={size} decorative />
            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {label ?? name}
            </Box>
        </Box>
    ) : null;

TeamName.propTypes = {
    name: PropTypes.string,
    size: PropTypes.number,
    label: PropTypes.node,
    sx: PropTypes.object,
};

export default TeamName;
