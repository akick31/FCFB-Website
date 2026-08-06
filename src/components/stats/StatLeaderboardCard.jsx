import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';
import { useTeamsMap, ensureTeam } from '../../hooks/useTeamsMap';

const StatLeaderboardCard = ({ title, statKey, rows, count, format, to }) => {
    const teamsMap = useTeamsMap();
    const top = rows.slice(0, count);

    return (
        <Panel header={<Box component={Link} to={to} sx={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>{title}</Box>}>
            {top.map((entry, index) => {
                const name = entry.team;
                ensureTeam(name);
                const teamId = teamsMap[name]?.id;
                return (
                    <Box
                        key={`${name}-${index}`}
                        component={teamId ? Link : 'div'}
                        to={teamId ? `/team-details/${teamId}` : undefined}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '18px 1fr auto',
                            alignItems: 'center',
                            gap: 1.25,
                            px: 1.75,
                            py: 1,
                            borderBottom: '1px solid var(--line-soft)',
                            cursor: teamId ? 'pointer' : 'default',
                            textDecoration: 'none',
                            color: 'inherit',
                            '&:last-of-type': { borderBottom: 'none' },
                            '&:hover': { background: 'var(--surface-2)' },
                            '&:focus-visible': { outline: '2px solid var(--brand)', outlineOffset: '-2px' },
                        }}
                    >
                        <Box component="span" sx={{ color: 'var(--text-dim)', fontWeight: 800, fontSize: '0.72rem', textAlign: 'right' }}>{index + 1}</Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                            <TeamMark team={teamsMap[name] || { name }} size={22} />
                            <Box component="span" sx={{ fontWeight: 700, fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</Box>
                        </Box>
                        <Box component="span" className="num" sx={{ fontWeight: 800, color: 'var(--brand)', fontVariantNumeric: 'tabular-nums' }}>
                            {format ? format(entry[statKey]) : entry[statKey]}
                        </Box>
                    </Box>
                );
            })}
        </Panel>
    );
};

StatLeaderboardCard.propTypes = {
    title: PropTypes.string.isRequired,
    statKey: PropTypes.string.isRequired,
    rows: PropTypes.array.isRequired,
    count: PropTypes.number.isRequired,
    format: PropTypes.func,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

export default StatLeaderboardCard;
