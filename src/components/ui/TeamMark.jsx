import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useColorMode } from '../../context/ColorModeContext';
import { ensureTeam, isTeamsListLoading, useTeamsMap } from '../../hooks/useTeamsMap';

const hasLogo = (team) => Boolean(team?.logo || team?.logoDark);

const letterOf = (name) => (name ? name.trim().charAt(0).toUpperCase() : '?');

const TeamMark = ({ team: given, size = 24, sx, decorative = false }) => {
    const { mode } = useColorMode();
    const teamsMap = useTeamsMap();
    const needsLookup = Boolean(given?.name) && !hasLogo(given);
    const missingFromList = needsLookup && !isTeamsListLoading() && !teamsMap[given.name];

    useEffect(() => {
        if (missingFromList) {
            ensureTeam(given.name);
        }
    }, [missingFromList, given?.name]);

    const team = needsLookup ? { ...given, ...teamsMap[given.name] } : given;

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
                    alt={decorative ? '' : team?.name || ''}
                    onError={() => setIndex((current) => current + 1)}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            ) : (
                <Box
                    component="span"
                    role={decorative ? undefined : 'img'}
                    aria-label={decorative ? undefined : team?.name}
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        border: '1px solid var(--line)',
                        background: 'var(--surface-2)',
                        fontFamily: 'var(--cond)',
                        fontSize: `${Math.max(9, Math.round(size * 0.5))}px`,
                        fontWeight: 800,
                        color: 'var(--text-muted)',
                        lineHeight: 1,
                    }}
                >
                    {letterOf(team?.name)}
                </Box>
            )}
        </Box>
    );
};

TeamMark.propTypes = {
    decorative: PropTypes.bool,
    team: PropTypes.object,
    size: PropTypes.number,
    sx: PropTypes.object,
};

export default TeamMark;
