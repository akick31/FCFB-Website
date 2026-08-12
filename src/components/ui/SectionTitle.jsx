import React from 'react';
import { Box } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import PropTypes from 'prop-types';

const SectionTitle = ({ title, note, collapsible = false, collapsed = false, onToggle }) => (
    <Box
        component={collapsible ? 'button' : 'div'}
        type={collapsible ? 'button' : undefined}
        onClick={collapsible ? onToggle : undefined}
        aria-expanded={collapsible ? !collapsed : undefined}
        sx={{
            display: 'flex', alignItems: 'baseline', gap: '12px', mt: '22px', mb: '12px', width: '100%',
            ...(collapsible ? { border: 0, background: 'transparent', padding: 0, cursor: 'pointer', font: 'inherit', textAlign: 'left' } : {}),
        }}
    >
        {collapsible && (
            <ExpandMore sx={{ fontSize: '1.1rem', color: 'var(--text-dim)', transition: 'transform 0.15s', transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', flexShrink: 0 }} />
        )}
        <Box component="h2" sx={{ m: 0, fontFamily: 'var(--cond)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em', fontSize: '1.2rem', color: 'var(--text)' }}>
            {title}
        </Box>
        {note && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{note}</Box>}
    </Box>
);

SectionTitle.propTypes = {
    title: PropTypes.node.isRequired,
    note: PropTypes.node,
    collapsible: PropTypes.bool,
    collapsed: PropTypes.bool,
    onToggle: PropTypes.func,
};

export default SectionTitle;
