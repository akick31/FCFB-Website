import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import FactList from '../ui/FactList';
import { formatPosition, formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';

const luminance = (hex) => {
    if (!hex) {
        return 0.5;
    }
    let value = String(hex).replace('#', '');
    if (value.length === 3) {
        value = value
            .split('')
            .map((char) => char + char)
            .join('');
    }
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

const CoachHeader = ({ user, team, mark, championSeason }) => {
    const primary = team?.primary_color || '#004260';
    const logo = luminance(primary) < 0.62 ? mark?.logoDark || mark?.logo : mark?.logo || mark?.logoDark;
    const name = user.coach_name || user.username;

    const affiliation = team ? `${formatPosition(user.position)}, ${team.name}` : 'Free Agent';

    const details = [
        `${formatOffensivePlaybook(user.offensive_playbook)} / ${formatDefensivePlaybook(user.defensive_playbook)}`,
        championSeason && `Season ${championSeason} national champion`,
    ];

    return (
        <Box
            sx={{
                borderRadius: 'var(--r-lg)',
                overflow: 'hidden',
                border: '1px solid var(--line)',
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    px: 3,
                    py: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '18px',
                    position: 'relative',
                    background: `linear-gradient(120deg, ${primary}, #0a1620)`,
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        right: '-40px',
                        top: '-20px',
                        bottom: '-20px',
                        width: '150px',
                        transform: 'skewX(-11deg)',
                        opacity: 0.16,
                        background: '#fff',
                    },
                }}
            >
                {team && (
                    <Box
                        component={team.id ? Link : 'div'}
                        to={team.id ? `/team-details/${team.id}` : undefined}
                        sx={{
                            width: 72,
                            height: 72,
                            flexShrink: 0,
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: team.id ? 'pointer' : 'default',
                            textDecoration: 'none',
                        }}
                    >
                        {logo ? (
                            <img
                                src={logo}
                                alt={team.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, color: '#fff' }}>
                                {team.abbreviation}
                            </Box>
                        )}
                    </Box>
                )}
                <Box sx={{ zIndex: 1, color: '#fff', minWidth: 0, flex: '1 1 240px' }}>
                    <Box
                        component={team?.id ? Link : 'div'}
                        to={team?.id ? `/team-details/${team.id}` : undefined}
                        sx={{
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontWeight: 800,
                            color: '#fff',
                            opacity: 0.85,
                            cursor: team?.id ? 'pointer' : 'default',
                            textDecoration: 'none',
                            display: 'inline-block',
                        }}
                    >
                        {affiliation}
                    </Box>
                    <Box
                        component="h1"
                        sx={{
                            m: '4px 0',
                            fontFamily: 'var(--cond)',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.01em',
                            fontSize: '1.7rem',
                            lineHeight: 1,
                        }}
                    >
                        @{name}
                    </Box>
                    <Box sx={{ fontSize: '0.84rem', fontWeight: 600, opacity: 0.85 }}>
                        <FactList items={details} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

CoachHeader.propTypes = {
    user: PropTypes.object.isRequired,
    team: PropTypes.object,
    mark: PropTypes.object,
    championSeason: PropTypes.number,
};

export default CoachHeader;
