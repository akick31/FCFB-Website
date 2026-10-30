import React from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const UserLink = ({ username }) =>
    username ? (
        <Box
            component={Link}
            to={`/user-details/${username}`}
            sx={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}
        >
            @{username}
        </Box>
    ) : (
        '-'
    );

UserLink.propTypes = { username: PropTypes.string };

export default UserLink;
