import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { renderAppearancePreview } from '../../api/teamAppearanceApi';

const TeamUniformThumb = ({ team, view = 'UNIFORM', height = 120 }) => {
    const [url, setUrl] = useState(null);
    const [visible, setVisible] = useState(false);
    const [failed, setFailed] = useState(false);
    const ref = useRef(null);
    const urlRef = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node || typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return undefined;
        }
        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                setVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: '200px' });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return undefined;
        let cancelled = false;
        renderAppearancePreview({ team, view })
            .then((loaded) => {
                if (cancelled) { URL.revokeObjectURL(loaded); return; }
                urlRef.current = loaded;
                setUrl(loaded);
            })
            .catch(() => { if (!cancelled) setFailed(true); });
        return () => { cancelled = true; };
    }, [visible, team, view]);

    useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

    return (
        <Box ref={ref} sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
            {url && <Box component="img" src={url} alt={`${team} uniform`} sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />}
            {!url && !failed && <CircularProgress size={22} />}
            {failed && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>No preview</Box>}
        </Box>
    );
};

TeamUniformThumb.propTypes = {
    team: PropTypes.string.isRequired,
    view: PropTypes.oneOf(['UNIFORM', 'HELMET', 'FIELD', 'AWAY_UNIFORM', 'SECONDARY_HELMET']),
    height: PropTypes.number,
};

export default TeamUniformThumb;
