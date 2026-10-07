import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { getTeamAppearanceThumbUrl } from '../../api/teamAppearanceApi';

const TeamUniformThumb = ({ team, view = 'UNIFORM', height = 120 }) => {
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    return (
        <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
            {!failed && (
                <Box
                    component="img"
                    src={getTeamAppearanceThumbUrl(team, view)}
                    alt={`${team} ${view.toLowerCase()}`}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setLoaded(true)}
                    onError={() => setFailed(true)}
                    sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', display: loaded ? 'block' : 'none' }}
                />
            )}
            {!loaded && !failed && <CircularProgress size={22} />}
            {failed && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>No preview</Box>}
        </Box>
    );
};

TeamUniformThumb.propTypes = {
    team: PropTypes.string.isRequired,
    view: PropTypes.oneOf(['UNIFORM', 'HELMET', 'FIELD', 'AWAY_UNIFORM', 'SECONDARY_HELMET', 'JERSEY', 'AWAY_JERSEY']),
    height: PropTypes.number,
};

export default TeamUniformThumb;
