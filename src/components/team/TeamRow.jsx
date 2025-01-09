import React from 'react';
import { TableCell, TableRow } from '@mui/material';
import { formatConference } from '../../utils/formatText';
import PropTypes from 'prop-types';

const TeamRow = ({ team, handleNullValue, handleArrayValue, onClick }) => (
    <TableRow
        key={team.id}
        onClick={onClick}
        style={{ cursor: 'pointer' }}
    >
        <TableCell>
            {handleNullValue(team.logo) ? (
                <img src={handleNullValue(team.logo)} alt={'-'} style={{ width: 25, height: 25 }} />
            ) : (
                <div style={{ width: 50, height: 50, backgroundColor: '#ddd' }} />
            )}
        </TableCell>
        <TableCell>{handleNullValue(team.name)}</TableCell>
        <TableCell>{handleNullValue(formatConference(team.conference))}</TableCell>
        <TableCell>{handleNullValue(team.abbreviation)}</TableCell>
        <TableCell>
            {team.current_wins ? team.current_wins : 0}-{team.current_losses ? team.current_losses : 0}
        </TableCell>
        <TableCell>{handleArrayValue(team.coach_discord_tags)}</TableCell>
    </TableRow>
);

TeamRow.propTypes = {
    team: PropTypes.object.isRequired,
    handleNullValue: PropTypes.func.isRequired,
    handleArrayValue: PropTypes.func.isRequired,
    onClick: PropTypes.func // Optional prop for row click handling
};

export default TeamRow;