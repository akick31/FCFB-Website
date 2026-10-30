import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import GroupChips from './GroupChips';
import { backendRoot } from '../../api/apiDocsApi';

const codeSx = {
    m: 0,
    p: '12px 14px',
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--line)',
    background: 'var(--brand-ink, #08151f)',
    color: '#cbd5e1',
    fontFamily: 'monospace',
    fontSize: '0.78rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
};

const headingSx = {
    fontSize: '0.7rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: 'var(--text-dim)',
    mb: '6px',
};

const ApiOverview = ({ groups, exampleOperation, apiKey, pickedGroups, onPickGroups }) => {
    const root = backendRoot || (typeof window !== 'undefined' ? window.location.origin : '');
    const base = `${root}/api/v1/arceus`;
    const example = exampleOperation
        ? `curl '${root}${exampleOperation.path}' \\\n  -H "X-Api-Key: ${apiKey || 'YOUR_API_KEY'}"`
        : null;
    return (
        <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.85rem' }}>
            <Box>
                <Box sx={headingSx}>Base URL</Box>
                <Box component="pre" sx={codeSx}>
                    {base}
                </Box>
            </Box>
            <Box>
                <Box sx={headingSx}>Authentication</Box>
                <Box sx={{ color: 'var(--text-muted)' }}>
                    Send your API key in the <code>X-Api-Key</code> header. Generate one above while signed in; it is
                    stored only in this browser.
                </Box>
            </Box>
            {example && (
                <Box>
                    <Box sx={headingSx}>Try it: {exampleOperation.summary}</Box>
                    <Box component="pre" sx={codeSx}>
                        {example}
                    </Box>
                </Box>
            )}
            <Box>
                <Box sx={headingSx}>Endpoint groups</Box>
                <Box sx={{ color: 'var(--text-muted)', mb: '8px' }}>
                    Pick one or more groups to narrow the endpoint list. All shows everything again.
                </Box>
                <GroupChips groups={groups} picked={pickedGroups} onChange={onPickGroups} />
            </Box>
        </Box>
    );
};

ApiOverview.propTypes = {
    groups: PropTypes.array.isRequired,
    exampleOperation: PropTypes.object,
    apiKey: PropTypes.string.isRequired,
    pickedGroups: PropTypes.arrayOf(PropTypes.string).isRequired,
    onPickGroups: PropTypes.func.isRequired,
};

export default ApiOverview;
