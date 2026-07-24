import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const SectionTitle = ({ title, note }) => (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '12px', mt: '22px', mb: '12px' }}>
        <Box component="h2" sx={{ m: 0, fontFamily: 'var(--cond)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em', fontSize: '1.2rem', color: 'var(--text)' }}>
            {title}
        </Box>
        {note && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{note}</Box>}
    </Box>
);

SectionTitle.propTypes = {
    title: PropTypes.node.isRequired,
    note: PropTypes.node,
};

export default SectionTitle;
