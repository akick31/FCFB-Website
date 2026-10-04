import React, { useEffect, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import { renderAppearancePreview } from '../../../api/teamAppearanceApi';

const PREVIEW_DEBOUNCE_MS = 450;

const PreviewImage = ({ team, view, body, label }) => {
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
        <Box sx={{ flex: '1 1 130px', minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {error && <Alert severity="warning" sx={{ width: '100%' }}>{error}</Alert>}
            <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', minHeight: 120 }}>
                {url && <Box component="img" src={url} alt={label || view} sx={{ maxWidth: '100%', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', opacity: loading ? 0.5 : 1, transition: 'opacity 0.15s' }} />}
                {loading && <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress size={24} /></Box>}
            </Box>
            {label && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</Box>}
        </Box>
    );
};

PreviewImage.propTypes = {
    team: PropTypes.string.isRequired,
    view: PropTypes.string.isRequired,
    body: PropTypes.object.isRequired,
    label: PropTypes.string,
};

const LivePreview = ({ title, team, views, body, note }) => (
    <Panel header={title}>
        <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Box sx={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
                {views.map((entry) => (
                    <PreviewImage key={entry.view} team={team} view={entry.view} body={body} label={views.length > 1 ? entry.label : null} />
                ))}
            </Box>
            {note && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem', textAlign: 'center' }}>{note}</Box>}
        </Box>
    </Panel>
);

LivePreview.propTypes = {
    title: PropTypes.string.isRequired,
    team: PropTypes.string.isRequired,
    views: PropTypes.arrayOf(PropTypes.shape({ view: PropTypes.string, label: PropTypes.string })).isRequired,
    body: PropTypes.object.isRequired,
    note: PropTypes.string,
};

export default LivePreview;
