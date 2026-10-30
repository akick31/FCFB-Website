import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const fadeSx = (side, color) => ({
    position: 'absolute',
    top: 0,
    bottom: 0,
    [side]: 0,
    width: 28,
    pointerEvents: 'none',
    zIndex: 4,
    background: `linear-gradient(to ${side === 'right' ? 'left' : 'right'}, ${color}, transparent)`,
});

const ScrollFade = ({ edges, color = 'var(--surface)' }) => (
    <>
        {edges.start && <Box aria-hidden sx={fadeSx('left', color)} />}
        {edges.end && <Box aria-hidden sx={fadeSx('right', color)} />}
    </>
);

ScrollFade.propTypes = {
    edges: PropTypes.shape({ start: PropTypes.bool, end: PropTypes.bool }).isRequired,
    color: PropTypes.string,
};

export default ScrollFade;
