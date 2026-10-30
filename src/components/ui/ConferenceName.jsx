import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import ConferenceMark from './ConferenceMark';
import { conferenceLabel } from '../../hooks/useConferencesMap';

const ConferenceName = ({ code, label, size = 16, sx }) => (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: 0, ...sx }}>
        <ConferenceMark conference={code} size={size} />
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {label ?? conferenceLabel(code)}
        </Box>
    </Box>
);

ConferenceName.propTypes = {
    code: PropTypes.string,
    label: PropTypes.node,
    size: PropTypes.number,
    sx: PropTypes.object,
};

export default ConferenceName;
