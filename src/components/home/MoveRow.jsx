import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import TeamName from '../ui/TeamName';
import MiniRow from './MiniRow';
import { useTeamsMap } from '../../hooks/useTeamsMap';

const changeLabel = (change) => `${change > 0 ? '▲' : '▼'} ${Math.abs(change)}`;

const MoveRow = ({ move, valueLabel }) => {
    const teamsMap = useTeamsMap();
    const teamId = teamsMap[move.team]?.id;
    return (
        <MiniRow dense to={teamId ? `/team-details/${teamId}` : undefined}>
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', fontWeight: 700, fontSize: '0.84rem' }}>
                <TeamName name={move.team} size={20} />
            </Box>
            <Box sx={{ color: 'var(--text-dim)', fontSize: '0.74rem' }}>{valueLabel(move.value)}</Box>
            <Box
                sx={{
                    width: 54,
                    textAlign: 'right',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    color: move.change == null ? 'var(--gold)' : move.change > 0 ? 'var(--field)' : 'var(--live)',
                }}
            >
                {move.change == null ? 'New' : changeLabel(move.change)}
            </Box>
        </MiniRow>
    );
};

MoveRow.propTypes = {
    move: PropTypes.shape({ team: PropTypes.string, value: PropTypes.number, change: PropTypes.number }).isRequired,
    valueLabel: PropTypes.func.isRequired,
};

export default MoveRow;
