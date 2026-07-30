import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';
import { formatConference, formatPosition } from '../../utils/formatText';

const CurrentTeamsPanel = ({ entries, teamsMap }) => {
    const navigate = useNavigate();

    return (
        <Panel header={entries.length > 1 ? `Current teams (${entries.length})` : 'Current team'}>
            {entries.map(({ team, position }) => (
                <Box
                    key={team.id ?? team.name}
                    onClick={() => team.id && navigate(`/team-details/${team.id}`)}
                    sx={{
                        display: 'grid', gridTemplateColumns: '38px 1fr auto', alignItems: 'center', gap: '12px',
                        px: 2, py: 1.5, borderBottom: '1px solid var(--line-soft)', cursor: team.id ? 'pointer' : 'default',
                        '&:last-of-type': { borderBottom: 0 }, '&:hover': { background: 'var(--surface-2)' },
                    }}
                >
                    <TeamMark team={teamsMap[team.name]} size={38} />
                    <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ fontWeight: 800, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</Box>
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 600 }}>
                            {formatPosition(position)}{team.conference ? ` - ${formatConference(team.conference)}` : ''}
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, fontSize: '1.1rem' }}>
                            {team.current_wins || 0}-{team.current_losses || 0}
                        </Box>
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 700 }}>
                            ELO {team.current_elo != null ? Math.round(team.current_elo) : '-'}
                        </Box>
                    </Box>
                </Box>
            ))}
        </Panel>
    );
};

CurrentTeamsPanel.propTypes = {
    entries: PropTypes.arrayOf(PropTypes.shape({
        team: PropTypes.object.isRequired,
        position: PropTypes.string,
    })).isRequired,
    teamsMap: PropTypes.object.isRequired,
};

export default CurrentTeamsPanel;
