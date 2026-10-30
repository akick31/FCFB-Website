import { formatConference } from '../../hooks/useConferencesMap';
import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';
import { useVenuesMap } from '../../hooks/useVenuesMap';
import { stadiumPath } from '../../utils/stadiumPath';
import BannerFacts from '../ui/BannerFacts';

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

const TeamHeader = ({ team, mark, pollRank }) => {
    const venuesMap = useVenuesMap();
    const primary = team.primary_color || '#004260';
    const logo = luminance(primary) < 0.62 ? mark?.logoDark || mark?.logo : mark?.logo || mark?.logoDark;
    const coach = team.coach_usernames?.[0];
    const venueLocation = team.stadium ? venuesMap[team.stadium] : null;
    const locationText = [venueLocation?.city, venueLocation?.state].filter(Boolean).join(', ');

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
                <Box
                    sx={{
                        width: 60,
                        height: 60,
                        flexShrink: 0,
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
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
                <Box sx={{ zIndex: 1, color: '#fff', minWidth: 0, flex: '1 1 240px' }}>
                    <Box
                        sx={{
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontWeight: 800,
                            opacity: 0.85,
                        }}
                    >
                        {formatConference(team.conference)}
                        {pollRank ? `, #${pollRank} Coaches Poll` : ''}
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
                        {team.name}
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'baseline',
                            columnGap: '18px',
                            rowGap: '2px',
                            fontSize: '0.84rem',
                            '& a': { color: 'inherit' },
                        }}
                    >
                        <Box component="span" sx={{ fontWeight: 800 }}>
                            {team.current_wins || 0}-{team.current_losses || 0} ({team.current_conference_wins || 0}-
                            {team.current_conference_losses || 0})
                        </Box>
                        <Box component="span" sx={{ opacity: 0.85, fontWeight: 600 }}>
                            ELO {team.current_elo != null ? Math.round(team.current_elo) : '-'}
                        </Box>
                    </Box>
                </Box>
                <BannerFacts
                    facts={[
                        {
                            label: 'Head coach',
                            value: coach ? <Link to={`/user-details/${coach}`}>@{coach}</Link> : 'Vacant',
                        },
                        {
                            label: 'Playbooks',
                            value: `${formatOffensivePlaybook(team.offensive_playbook)} / ${formatDefensivePlaybook(
                                team.defensive_playbook
                            )}`,
                        },
                        team.stadium && {
                            label: 'Stadium',
                            value: (
                                <Link to={stadiumPath({ id: venueLocation?.venue_id, name: team.stadium })}>
                                    {team.stadium}
                                </Link>
                            ),
                        },
                        locationText && { label: 'Location', value: locationText },
                    ]}
                />
            </Box>
        </Box>
    );
};

TeamHeader.propTypes = {
    team: PropTypes.object.isRequired,
    mark: PropTypes.object,
    pollRank: PropTypes.number,
};

export default TeamHeader;
