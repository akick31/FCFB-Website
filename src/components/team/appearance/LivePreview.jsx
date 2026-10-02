import React, { useEffect, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import { renderAppearancePreview } from '../../../api/teamAppearanceApi';

const PREVIEW_DEBOUNCE_MS = 450;

const LivePreview = ({ title, team, view, body, note }) => {
    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const urlRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const loaded = await renderAppearancePreview({ team, view, ...body });
                if (cancelled) { URL.revokeObjectURL(loaded); return; }
                if (urlRef.current) URL.revokeObjectURL(urlRef.current);
                urlRef.current = loaded;
                setUrl(loaded);
                setError(null);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Preview unavailable');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, PREVIEW_DEBOUNCE_MS);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [team, view, body]);

    useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

    return (
        <Panel header={title}>
            <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minHeight: 160 }}>
                {error && <Alert severity="warning" sx={{ width: '100%' }}>{error}</Alert>}
                <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    {url && <Box component="img" src={url} alt={title} sx={{ maxWidth: '100%', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', opacity: loading ? 0.5 : 1, transition: 'opacity 0.15s' }} />}
                    {loading && <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={26} /></Box>}
                </Box>
                {note && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem', textAlign: 'center' }}>{note}</Box>}
            </Box>
        </Panel>
    );
};

LivePreview.propTypes = {
    title: PropTypes.string.isRequired,
    team: PropTypes.string.isRequired,
    view: PropTypes.string.isRequired,
    body: PropTypes.object.isRequired,
    note: PropTypes.string,
};

export default LivePreview;
