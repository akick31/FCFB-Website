import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { coachesOf } from './transactionFormat';

const CoachLinks = ({ transaction }) => {
    const coaches = coachesOf(transaction);
    if (coaches.length === 0) {
        return (
            <Box component="span" sx={{ color: 'var(--text-dim)' }}>
                Unknown coach
            </Box>
        );
    }
    return coaches.map((coach, index) => (
        <React.Fragment key={coach}>
            {index > 0 && ', '}
            <Box
                component={Link}
                to={`/user-details/${encodeURIComponent(coach)}`}
                sx={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}
            >
                @{coach}
            </Box>
        </React.Fragment>
    ));
};

CoachLinks.propTypes = { transaction: PropTypes.object.isRequired };

export default CoachLinks;
