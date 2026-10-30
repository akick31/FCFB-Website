import React from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { secondaryButtonSx } from '../../../styles/controls';

const stepSx = { ...secondaryButtonSx, px: '12px' };
const disabledSx = { ...stepSx, opacity: 0.4, pointerEvents: 'none' };

const Step = ({ playId, label, children }) =>
    playId ? (
        <Box component={Link} to={`/play-details/${playId}`} aria-label={label} sx={stepSx}>
            {children}
        </Box>
    ) : (
        <Box component="span" aria-hidden sx={disabledSx}>
            {children}
        </Box>
    );

Step.propTypes = { playId: PropTypes.number, label: PropTypes.string.isRequired, children: PropTypes.node };

const PlayStepper = ({ previousId, nextId, label }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Step playId={previousId} label="Previous play">
            ‹
        </Step>
        <Box sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {label}
        </Box>
        <Step playId={nextId} label="Next play">
            ›
        </Step>
    </Box>
);

PlayStepper.propTypes = { previousId: PropTypes.number, nextId: PropTypes.number, label: PropTypes.string.isRequired };

export default PlayStepper;
