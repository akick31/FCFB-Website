import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import DataTable from '../ui/DataTable';
import TeamName from '../ui/TeamName';
import { eventsAt, isTeamStadium, locationOf } from './stadiumUsage';

const usedBy = (stadium) => {
    if (isTeamStadium(stadium)) {
        return (
            <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {stadium.teams.map((team) => (
                    <TeamName key={team} name={team} size={18} />
                ))}
            </Box>
        );
    }
    const events = eventsAt(stadium);
    return (
        <Box component="span" sx={{ color: 'var(--text-muted)' }}>
            {events.length > 0 ? events.join(', ') : 'Neutral site, no events'}
        </Box>
    );
};

const StadiumsTable = ({ stadiums, onOpen }) => (
    <DataTable minWidth={720} phoneMinWidth={0} tableLayout="fixed" dense>
        <thead>
            <tr>
                <th className="lft" style={{ width: '34%' }}>
                    Stadium
                </th>
                <th className="lft wide" style={{ width: '20%' }}>
                    Location
                </th>
                <th className="lft wide">Used by</th>
                <th className="wide" style={{ width: 110 }}>
                    Type
                </th>
            </tr>
        </thead>
        <tbody>
            {stadiums.map((stadium) => (
                <tr
                    key={stadium.name}
                    onClick={() => onOpen(stadium.name)}
                    style={{ opacity: stadium.active ? 1 : 0.55 }}
                >
                    <td className="lft">
                        <Box
                            component="button"
                            type="button"
                            onClick={() => onOpen(stadium.name)}
                            sx={{
                                display: 'block',
                                maxWidth: '100%',
                                border: 0,
                                background: 'none',
                                p: 0,
                                font: 'inherit',
                                color: 'inherit',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textAlign: 'left',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {stadium.name}
                            {!stadium.active && ' (retired)'}
                        </Box>
                        <Box
                            sx={{
                                display: { xs: 'block', sm: 'none' },
                                fontSize: '0.72rem',
                                color: 'var(--text-dim)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {isTeamStadium(stadium) ? stadium.teams.join(', ') : locationOf(stadium) || 'Neutral site'}
                        </Box>
                    </td>
                    <td className="lft wide" style={{ color: 'var(--text-muted)' }}>
                        {locationOf(stadium) || 'No location'}
                    </td>
                    <td className="lft wide">{usedBy(stadium)}</td>
                    <td className="wide">{isTeamStadium(stadium) ? 'Team' : 'Neutral'}</td>
                </tr>
            ))}
        </tbody>
    </DataTable>
);

StadiumsTable.propTypes = {
    stadiums: PropTypes.array.isRequired,
    onOpen: PropTypes.func.isRequired,
};

export default StadiumsTable;
