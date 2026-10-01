import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const BackButton = ({ onBack, label = 'Back' }) => (
    <Box
        component="button"
        type="button"
        onClick={onBack}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', mb: '12px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '34px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } }}
    >
        <ArrowBackIcon sx={{ fontSize: 16 }} />{label}
    </Box>
);

BackButton.propTypes = { onBack: PropTypes.func.isRequired, label: PropTypes.string };

export default BackButton;
