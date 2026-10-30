import React from 'react';
import { Box, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PropTypes from 'prop-types';

const FieldLabel = ({ label, help, unavailable }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            height: '18px',
            mb: '4px',
            fontSize: '0.64rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 800,
            color: 'var(--text-dim)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        }}
    >
        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
        </Box>
        {unavailable && (
            <Box component="span" sx={{ textTransform: 'none', letterSpacing: 0, fontWeight: 600, opacity: 0.75 }}>
                (unavailable)
            </Box>
        )}
        {help && (
            <Tooltip title={help} enterTouchDelay={0} leaveTouchDelay={4000} placement="top" arrow>
                <Box
                    component="span"
                    tabIndex={0}
                    role="note"
                    aria-label={`${label}: ${help}`}
                    sx={{ display: 'inline-flex', cursor: 'help', color: unavailable ? 'var(--brand)' : 'inherit' }}
                >
                    <InfoOutlinedIcon sx={{ fontSize: '0.9rem' }} />
                </Box>
            </Tooltip>
        )}
    </Box>
);

FieldLabel.propTypes = {
    label: PropTypes.node,
    help: PropTypes.node,
    unavailable: PropTypes.bool,
};

export default FieldLabel;
