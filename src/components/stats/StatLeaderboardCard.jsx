import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';
import { useTeamsMap, ensureTeam } from '../../hooks/useTeamsMap';

const StatLeaderboardCard = ({ title, statKey, rows, count, format, to }) => {
    const teamsMap = useTeamsMap();
    const [flipped, setFlipped] = useState(false);
    const ranked = rows.map((entry, index) => ({ entry, rank: index + 1 }));
    const ordered = flipped ? [...ranked].reverse() : ranked;
    const top = count === 'all' ? ordered : ordered.slice(0, count);

    return (
        <Panel
            header={<Box component={Link} to={to} sx={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}>{title}</Box>}
            more={(
                <Box
                    component="button"
                    type="button"
                    onClick={() => setFlipped((prev) => !prev)}
                    title={flipped ? 'Showing worst first' : 'Showing best first'}
                    sx={{ border: 'none', background: 'none', color: 'var(--text-dim)', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: 0, '&:hover': { color: 'var(--brand)' } }}
                >
                    {flipped ? '▲ Worst first' : '▼ Best first'}
                </Box>
            )}
        >
            {top.map(({ entry, rank }) => {
                const name = entry.team;
                ensureTeam(name);
                const teamId = teamsMap[name]?.id;
                return (
                    <Box
                        key={`${name}-${rank}`}
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
                        <Box component="span" sx={{ color: 'var(--text-dim)', fontWeight: 800, fontSize: '0.72rem', textAlign: 'right' }}>{rank}</Box>
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
    count: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['all'])]).isRequired,
    format: PropTypes.func,
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

export default StatLeaderboardCard;
