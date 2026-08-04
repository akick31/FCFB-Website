import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const FitTeamName = ({ fullName, abbreviation, sx }) => {
    const wrapRef = useRef(null);
    const measureRef = useRef(null);
    const [useAbbreviation, setUseAbbreviation] = useState(false);

    useEffect(() => {
        const wrap = wrapRef.current;
        const measure = measureRef.current;
        if (!wrap || !measure || typeof ResizeObserver === 'undefined') return undefined;

        const check = () => setUseAbbreviation(measure.scrollWidth > wrap.clientWidth);
        check();

        const observer = new ResizeObserver(check);
        observer.observe(wrap);
        return () => observer.disconnect();
    }, [fullName]);

    return (
        <Box ref={wrapRef} sx={{ position: 'relative', minWidth: 0, flex: '1 1 0%', overflow: 'hidden' }}>
            <Box ref={measureRef} aria-hidden="true" sx={{ position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', pointerEvents: 'none', ...sx }}>
                {fullName}
            </Box>
            <Box component="span" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...sx }}>
                {useAbbreviation ? (abbreviation || fullName) : fullName}
            </Box>
        </Box>
    );
};

FitTeamName.propTypes = {
    fullName: PropTypes.string.isRequired,
    abbreviation: PropTypes.string,
    sx: PropTypes.object,
};

export default FitTeamName;
