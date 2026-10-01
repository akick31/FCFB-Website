import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { renderPostseasonPreview } from '../../../api/fieldAppearanceApi';

const PostseasonFieldThumb = ({ category, keyName, label }) => {
    const [url, setUrl] = useState(null);
    const [visible, setVisible] = useState(false);
    const [failed, setFailed] = useState(false);
    const ref = useRef(null);
    const urlRef = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node || typeof IntersectionObserver === 'undefined') { setVisible(true); return undefined; }
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
        }, { rootMargin: '200px' });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return undefined;
        let cancelled = false;
        renderPostseasonPreview({ category, key: keyName })
            .then((loaded) => { if (cancelled) { URL.revokeObjectURL(loaded); return; } urlRef.current = loaded; setUrl(loaded); })
            .catch(() => { if (!cancelled) setFailed(true); });
        return () => { cancelled = true; };
    }, [visible, category, keyName]);

    useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

    return (
        <Box ref={ref} sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Box sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>{label}</Box>
            <Box sx={{ minHeight: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
                {url && <Box component="img" src={url} alt={label} sx={{ maxWidth: '100%' }} />}
                {!url && !failed && <CircularProgress size={20} />}
                {failed && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.68rem', p: '8px' }}>No past game</Box>}
            </Box>
        </Box>
    );
};

PostseasonFieldThumb.propTypes = {
    category: PropTypes.string.isRequired,
    keyName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
};

export default PostseasonFieldThumb;
