import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { conferenceLabel, conferenceLogo, conferenceLogoDark } from '../../hooks/useConferencesMap';
import { useColorMode } from '../../context/ColorModeContext';
import fcfbLogo from '../../assets/graphics/main_logo.png';

const ConferenceMark = ({ conference, size = 22 }) => {
    const { mode } = useColorMode();
    const label = conferenceLabel(conference);
    const logo = conferenceLogo(conference);
    const logoDark = conferenceLogoDark(conference);

    const candidates = useMemo(() => {
        const ordered = mode === 'dark' ? [logoDark, logo] : [logo, logoDark];
        return [...new Set(ordered.filter(Boolean))];
    }, [logo, logoDark, mode]);

    const [index, setIndex] = useState(0);
    useEffect(() => {
        setIndex(0);
    }, [candidates]);

    const src = candidates[index] || fcfbLogo;
    const title = conference ? label : 'No conference';

    return (
        <Box
            component="span"
            title={title}
            sx={{ display: 'inline-flex', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
        >
            <img
                src={src}
                alt={title}
                onError={() => setIndex((current) => current + 1)}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
        </Box>
    );
};

ConferenceMark.propTypes = {
    conference: PropTypes.string,
    size: PropTypes.number,
};

export default ConferenceMark;
