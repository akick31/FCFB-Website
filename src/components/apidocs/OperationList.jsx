import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const METHOD_COLORS = { GET: 'var(--brand)', POST: 'var(--field)', PUT: 'var(--gold)', PATCH: 'var(--gold)', DELETE: 'var(--live)' };

export const MethodBadge = ({ method }) => (
    <Box
        component="span"
        sx={{
            display: 'inline-block',
            minWidth: '46px',
            textAlign: 'center',
            fontSize: '0.62rem',
            fontWeight: 800,
            letterSpacing: '0.03em',
            color: METHOD_COLORS[method] || 'var(--text-muted)',
            border: `1px solid ${METHOD_COLORS[method] || 'var(--line)'}`,
            borderRadius: 'var(--r-sm)',
            px: '4px',
            py: '2px',
        }}
    >
        {method}
    </Box>
);

MethodBadge.propTypes = { method: PropTypes.string.isRequired };

const OperationList = ({ groups, query, onQueryChange, selectedId, onSelect }) => (
    <Box>
        <Box sx={{ p: '12px', borderBottom: '1px solid var(--line-soft)' }}>
            <Box
                component="input"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search endpoints..."
                sx={{ width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: '7px', font: 'inherit', fontSize: '0.8rem' }}
            />
        </Box>
        <Box sx={{ maxHeight: '640px', overflowY: 'auto' }}>
            {groups.length === 0 && <Box sx={{ p: 2, color: 'var(--text-muted)', fontSize: '0.8rem' }}>No endpoints match your search.</Box>}
            {groups.map(([tag, ops]) => (
                <Box key={tag}>
                    <Box sx={{ px: '14px', py: '8px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', background: 'var(--surface-2)' }}>
                        {tag}
                    </Box>
                    {ops.map((op) => (
                        <Box
                            key={op.id}
                            component="button"
                            onClick={() => onSelect(op.id)}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                width: '100%',
                                textAlign: 'left',
                                border: 0,
                                borderBottom: '1px solid var(--line-soft)',
                                background: selectedId === op.id ? 'var(--surface-2)' : 'transparent',
                                color: 'var(--text)',
                                font: 'inherit',
                                px: '14px',
                                py: '9px',
                                cursor: 'pointer',
                                '&:hover': { background: 'var(--surface-2)' },
                            }}
                        >
                            <Box sx={{ mt: '2px' }}><MethodBadge method={op.method} /></Box>
                            <Box sx={{ minWidth: 0 }}>
                                <Box sx={{ fontSize: '0.78rem', lineHeight: 1.3 }}>{op.summary}</Box>
                                <Box sx={{ fontSize: '0.66rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.path}</Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    </Box>
);

OperationList.propTypes = {
    groups: PropTypes.arrayOf(PropTypes.array).isRequired,
    query: PropTypes.string.isRequired,
    onQueryChange: PropTypes.func.isRequired,
    selectedId: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
};

export default OperationList;
