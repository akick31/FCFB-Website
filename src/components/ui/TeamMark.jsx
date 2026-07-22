import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useColorMode } from '../../theme/ColorModeContext';

const TeamMark = ({ team, size = 24, sx }) => {
    const { mode } = useColorMode();

    const candidates = useMemo(() => {
        const ordered = mode === 'dark' ? [team?.logoDark, team?.logo] : [team?.logo, team?.logoDark];
        return [...new Set(ordered.filter(Boolean))];
    }, [team?.logo, team?.logoDark, mode]);

    const [index, setIndex] = useState(0);
    useEffect(() => {
        setIndex(0);
    }, [candidates]);

    const src = candidates[index];

    return (
        <Box
            sx={{
                width: size,
                height: size,
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...sx,
            }}
        >
            {src ? (
                <img
                    src={src}
                    alt={team?.name || ''}
                    onError={() => setIndex((current) => current + 1)}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            ) : (
                <Box
                    component="span"
                    sx={{ fontFamily: 'var(--cond)', fontSize: size < 24 ? '0.55rem' : '0.62rem', fontWeight: 800, color: 'var(--text-muted)' }}
                >
                    {team?.abbreviation || '?'}
                </Box>
            )}
        </Box>
    );
};

TeamMark.propTypes = {
    team: PropTypes.object,
    size: PropTypes.number,
    sx: PropTypes.object,
};

export default TeamMark;
