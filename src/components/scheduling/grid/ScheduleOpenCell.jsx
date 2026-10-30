import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const ScheduleOpenCell = ({ locked, dropState, blockedReason, onClick, onDrop }) => {
    const dropColor = dropState === 'valid' ? 'var(--field)' : 'var(--live)';
    const dropping = dropState !== 'none';
    return (
        <Box
            onClick={() => !locked && onClick()}
            onDragOver={(event) => dropState === 'valid' && event.preventDefault()}
            onDrop={(event) => {
                if (dropState !== 'valid') {
                    return;
                }
                event.preventDefault();
                onDrop();
            }}
            title={blockedReason}
            sx={{
                py: '3px',
                borderRadius: 'var(--r-sm)',
                color: 'var(--text-dim)',
                cursor: locked ? 'default' : dropState === 'invalid' ? 'not-allowed' : 'pointer',
                outline: dropping ? `2px dashed ${dropColor}` : 'none',
                background: dropping ? `color-mix(in srgb, ${dropColor} 12%, transparent)` : 'transparent',
                fontWeight: 800,
                '& span': { opacity: 0 },
                '&:hover': locked ? {} : { background: 'var(--surface-2)', '& span': { opacity: 1 } },
            }}
        >
            <span>{locked ? '' : '+'}</span>
        </Box>
    );
};

ScheduleOpenCell.propTypes = {
    locked: PropTypes.bool,
    dropState: PropTypes.oneOf(['none', 'valid', 'invalid']).isRequired,
    blockedReason: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    onDrop: PropTypes.func.isRequired,
};

export default ScheduleOpenCell;
