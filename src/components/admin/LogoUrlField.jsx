import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem' };

const LogoUrlField = ({ label, value, onChange, placeholder, previewBg = '#ffffff' }) => (
    <Box>
        <Box sx={labelSx}>{label}</Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Box component="input" value={value} onChange={onChange} placeholder={placeholder} sx={inputSx} />
            <Box
                sx={{
                    flex: '0 0 auto', width: 38, height: 38, borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--line)', background: previewBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                }}
            >
                {value ? (
                    <Box component="img" src={value} alt="" sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                    <Box sx={{ fontSize: '0.6rem', color: previewBg === '#ffffff' ? '#00000055' : '#ffffff55' }}>—</Box>
                )}
            </Box>
        </Box>
    </Box>
);

LogoUrlField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    previewBg: PropTypes.string,
};

export default LogoUrlField;
