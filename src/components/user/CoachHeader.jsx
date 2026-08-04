import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatConference, formatPosition, formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';
import { clickableProps } from '../../utils/a11y';

const luminance = (hex) => {
    if (!hex) return 0.5;
    let value = String(hex).replace('#', '');
    if (value.length === 3) value = value.split('').map((char) => char + char).join('');
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

const CoachHeader = ({ user, team, mark, championSeason }) => {
    const navigate = useNavigate();
    const primary = team?.primary_color || '#004260';
    const logo = luminance(primary) < 0.62 ? (mark?.logoDark || mark?.logo) : (mark?.logo || mark?.logoDark);
    const name = user.coach_name || user.username;

    const affiliation = team
        ? `${formatPosition(user.position)}, ${team.name}`
        : 'Free Agent';

    const subParts = [];
    if (team?.conference) subParts.push(formatConference(team.conference));
    subParts.push(`${formatOffensivePlaybook(user.offensive_playbook)} / ${formatDefensivePlaybook(user.defensive_playbook)}`);
    if (championSeason) subParts.push(`Season ${championSeason} national champion`);

    return (
        <Box sx={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--line)', position: 'relative' }}>
            <Box sx={{
                px: 3, py: '26px', display: 'flex', alignItems: 'center', gap: '20px', position: 'relative',
                background: `linear-gradient(120deg, ${primary}, #0a1620)`,
                '&::after': { content: '""', position: 'absolute', right: '-40px', top: '-20px', bottom: '-20px', width: '150px', transform: 'skewX(-11deg)', opacity: 0.16, background: '#fff' },
            }}>
                {team && (
                    <Box
                        {...(team.id ? clickableProps(() => navigate(`/team-details/${team.id}`)) : {})}
                        sx={{ width: 72, height: 72, flexShrink: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: team.id ? 'pointer' : 'default' }}
                    >
                        {logo
                            ? <img src={logo} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            : <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, color: '#fff' }}>{team.abbreviation}</Box>}
                    </Box>
                )}
                <Box sx={{ zIndex: 1, color: '#fff', minWidth: 0 }}>
                    <Box
                        {...(team?.id ? clickableProps(() => navigate(`/team-details/${team.id}`)) : {})}
                        sx={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: '#9fd6ec', cursor: team?.id ? 'pointer' : 'default' }}
                    >
                        {affiliation}
                    </Box>
                    <Box component="h2" sx={{ m: '4px 0', fontFamily: 'var(--cond)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em', fontSize: '2rem', lineHeight: 1 }}>
                        @{name}
                    </Box>
                    <Box sx={{ opacity: 0.9, fontWeight: 600, fontSize: '0.85rem' }}>
                        {subParts.join(' - ')}
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
