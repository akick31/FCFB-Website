import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import FactList from '../ui/FactList';
import { isTeamStadium, locationOf } from './stadiumUsage';

const StadiumOption = ({ stadium }) => {
    const owner = isTeamStadium(stadium) ? stadium.teams.join(', ') : 'Neutral site';
    return (
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '8px', minWidth: 0, width: '100%' }}>
            <Box component="span" sx={{ fontWeight: 700, fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                {stadium.name}
            </Box>
            <Box
                component="span"
                sx={{
                    color: 'var(--text-dim)',
                    fontSize: '0.74rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minWidth: 0,
                }}
            >
                <FactList items={[owner, locationOf(stadium)]} sx={{ flexWrap: 'nowrap', columnGap: '10px' }} />
            </Box>
        </Box>
    );
};

StadiumOption.propTypes = {
    stadium: PropTypes.shape({
        name: PropTypes.string.isRequired,
        teams: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
};

export default StadiumOption;
