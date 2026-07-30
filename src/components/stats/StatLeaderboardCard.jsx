import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';
import { useTeamsMap, ensureTeam } from '../../hooks/useTeamsMap';

const StatLeaderboardCard = ({ title, statKey, rows, count, format, onOpen }) => {
    const teamsMap = useTeamsMap();
    const navigate = useNavigate();
    const top = rows.slice(0, count);
    const openTeam = (name) => {
        const id = teamsMap[name]?.id;
        if (id) navigate(`/team-details/${id}`);
    };

    return (
        <Panel header={<Box component="span" onClick={onOpen} sx={{ cursor: 'pointer' }}>{title}</Box>}>
            {top.map((entry, index) => {
                const name = entry.team;
                ensureTeam(name);
                return (
                    <Box
                        key={`${name}-${index}`}
                        onClick={() => openTeam(name)}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: '18px 1fr auto',
                            alignItems: 'center',
                            gap: 1.25,
                            px: 1.75,
                            py: 1,
                            borderBottom: '1px solid var(--line-soft)',
                            cursor: 'pointer',
                            '&:last-of-type': { borderBottom: 'none' },
                            '&:hover': { background: 'var(--surface-2)' },
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
    onOpen: PropTypes.func.isRequired,
};

export default StatLeaderboardCard;
