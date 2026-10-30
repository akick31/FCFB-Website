import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { transactionColor, transactionLabel } from './transactionFormat';

const TransactionChip = ({ type }) => (
    <Box
        component="span"
        sx={{
            display: 'inline-block',
            fontSize: '0.62rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            px: '8px',
            py: '3px',
            borderRadius: 'var(--r-sm)',
            background: 'var(--surface-2)',
            color: transactionColor(type),
            whiteSpace: 'nowrap',
        }}
    >
        {transactionLabel(type)}
    </Box>
);

TransactionChip.propTypes = { type: PropTypes.string };

export default TransactionChip;
