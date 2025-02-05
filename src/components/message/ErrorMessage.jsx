import React from 'react';
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const ErrorMessage = ({ message }) => (
    <Box sx={{ display: 'flex', justifycontent: 'center', marginTop: 5 }}>
        <Typography color="error" variant="h6">{message}</Typography>
    </Box>
);

ErrorMessage.propTypes = {
    message: PropTypes.string.isRequired,
}

export default ErrorMessage;