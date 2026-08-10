import React, { useState } from 'react';
import { Box, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { generateApiKey, revokeApiKey } from '../../api/userApi';
import Panel from '../ui/Panel';
import { setStoredApiKey } from '../../utils/apiKeyStorage';

const solidBtn = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '14px', py: '9px', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' };
const ghostBtn = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', py: '7px', font: 'inherit', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };

const ApiKeyPanel = () => {
    const [apiKey, setApiKey] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const generate = async () => {
        setBusy(true);
        setError('');
        try {
            const key = await generateApiKey();
            setApiKey(key);
            setStoredApiKey(key);
            setCopied(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const revoke = async () => {
        setBusy(true);
        setError('');
        try {
            await revokeApiKey();
            setApiKey(null);
            setStoredApiKey('');
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const copy = () => {
        if (!apiKey) return;
        navigator.clipboard?.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Panel header="API access" sx={{ mt: '16px' }}>
            <Box sx={{ p: 2 }}>
                <Box sx={{ color: 'var(--text-muted)', fontSize: '0.82rem', mb: 2 }}>
                    Generate a personal API key to call the FCFB API yourself from tools like Postman or curl. Send it in the
                    {' '}<Box component="code" sx={{ color: 'var(--text)' }}>X-Api-Key</Box> header. The key acts as you and can be revoked at any time.
                    {' '}See the full <Box component={Link} to="/developers" sx={{ color: 'var(--brand)' }}>API docs</Box>.
                </Box>

                {apiKey ? (
                    <>
                        <Alert severity="warning" sx={{ mb: 1.5 }}>Copy this key now. It won&apos;t be shown again.</Alert>
                        <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Box component="code" sx={{ flex: '1 1 260px', minWidth: 0, overflowX: 'auto', whiteSpace: 'nowrap', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: '9px', fontSize: '0.8rem' }}>
                                {apiKey}
                            </Box>
                            <Box component="button" onClick={copy} sx={ghostBtn}>{copied ? 'Copied' : 'Copy'}</Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: '8px', mt: 1.5 }}>
                            <Box component="button" onClick={generate} disabled={busy} sx={solidBtn}>Rotate key</Box>
                            <Box component="button" onClick={revoke} disabled={busy} sx={{ ...ghostBtn, color: 'var(--live)', borderColor: 'color-mix(in srgb, var(--live) 40%, var(--line))' }}>Revoke</Box>
                        </Box>
                    </>
                ) : (
                    <Box component="button" onClick={generate} disabled={busy} sx={solidBtn}>{busy ? 'Generating…' : 'Generate API key'}</Box>
                )}

                {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
            </Box>
        </Panel>
    );
};

export default ApiKeyPanel;
