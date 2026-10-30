import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import usePlayAnimation from '../../../hooks/usePlayAnimation';

const PlayAnimation = ({ playId, description, sx }) => {
    const { status, url } = usePlayAnimation(playId);
    if (status === 'loading') {
        return (
            <Box sx={{ display: 'grid', placeItems: 'center', aspectRatio: '16 / 9', ...sx }}>
                <CircularProgress size={28} aria-label="Loading replay" />
            </Box>
        );
    }
    if (status === 'failed') {
        return (
            <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                No replay for this play.
            </Box>
        );
    }
    return (
        <Box
            component="img"
            src={url}
            alt={`Replay of ${description}`}
            sx={{ width: '100%', display: 'block', ...sx }}
        />
    );
};

PlayAnimation.propTypes = {
    playId: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    sx: PropTypes.object,
};

export default PlayAnimation;
