import React, { useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import { generateApiKey } from '../../api/userApi';

const inputSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: '7px', font: 'inherit', fontSize: '0.8rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', width: '260px', maxWidth: '100%' };
const btnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '12px', py: '8px', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', '&:disabled': { opacity: 0.5, cursor: 'not-allowed' } };

const ApiKeyBar = ({ apiKey, onChange, isLoggedIn }) => {
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');

    const generate = async () => {
        setGenerating(true);
        setError('');
        try {
            onChange(await generateApiKey());
        } catch (err) {
            setError(err.message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Box component="label" sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>API key</Box>
            <Box component="input" type="text" value={apiKey} onChange={(e) => onChange(e.target.value)} placeholder="fcfb_pat_..." aria-label="API key" sx={inputSx} />
            {isLoggedIn && !apiKey && (
                <Box component="button" onClick={generate} disabled={generating} sx={btnSx}>{generating ? 'Generating…' : 'Generate API key'}</Box>
            )}
            {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
        </Box>
    );
};

ApiKeyBar.propTypes = {
    apiKey: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
};

export default ApiKeyBar;
