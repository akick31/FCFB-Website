import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const cmpRow = { display: 'grid', gridTemplateColumns: '1fr 120px 1fr', alignItems: 'center', px: 1.75, py: 1, borderBottom: '1px solid var(--line-soft)', fontSize: '0.84rem' };

const ComparisonTable = ({ awayHeader, homeHeader, sections }) => (
    <Box>
        <Box sx={{ ...cmpRow, background: 'var(--surface-2)' }}>
            <Box sx={{ textAlign: 'left' }}>{awayHeader}</Box>
            <span />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>{homeHeader}</Box>
        </Box>
        {sections.map((section, sectionIndex) => (
            <React.Fragment key={section.group || sectionIndex}>
                {section.group && (
                    <Box sx={{ px: 1.75, py: 1, background: 'var(--surface-2)', fontSize: '0.63rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', borderBottom: '1px solid var(--line-soft)' }}>{section.group}</Box>
                )}
                {section.rows.map((row) => (
                    <Box key={row.label} sx={cmpRow}>
                        <Box sx={{ textAlign: 'left', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{row.away ?? '-'}</Box>
                        <Box sx={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase' }}>{row.label}</Box>
                        <Box sx={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{row.home ?? '-'}</Box>
                    </Box>
                ))}
            </React.Fragment>
        ))}
    </Box>
);

ComparisonTable.propTypes = {
    awayHeader: PropTypes.node,
    homeHeader: PropTypes.node,
    sections: PropTypes.arrayOf(PropTypes.shape({
        group: PropTypes.string,
        rows: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.node, away: PropTypes.node, home: PropTypes.node })),
    })).isRequired,
};

export default ComparisonTable;
