import React from 'react';
import { Box, Typography } from '@mui/material';

const ErrorMessage = ({ message }) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 5 }}>
        <Typography color="error" variant="h6">{message}</Typography>
    </Box>
);

export default ErrorMessage;