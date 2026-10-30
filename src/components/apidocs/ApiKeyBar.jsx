import React, { useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import { generateApiKey } from '../../api/userApi';
import { inputSx, labelSx, primaryButtonSx } from '../../styles/controls';

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
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                mb: '16px',
                p: '10px 12px',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-md, 10px)',
                background: 'var(--surface)',
            }}
        >
            <Box component="label" htmlFor="api-key" sx={{ ...labelSx, mb: 0 }}>
                API key
            </Box>
            <Box
                component="input"
                id="api-key"
                type="text"
                value={apiKey}
                onChange={(e) => onChange(e.target.value)}
                placeholder="fcfb_pat_..."
                aria-label="API key"
                sx={{ ...inputSx, flex: '1 1 260px', maxWidth: 520 }}
            />
            {isLoggedIn && !apiKey && (
                <Box component="button" onClick={generate} disabled={generating} sx={primaryButtonSx}>
                    {generating ? 'Generating…' : 'Generate API key'}
                </Box>
            )}
            {!isLoggedIn && !apiKey && (
                <Box sx={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>Sign in to generate a key.</Box>
            )}
            {error && (
                <Alert severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

ApiKeyBar.propTypes = {
    apiKey: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
};

export default ApiKeyBar;
