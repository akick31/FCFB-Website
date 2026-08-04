import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const FILES = {
    ESPN: 'ESPN_wordmark.svg', ESPN2: 'ESPN2_logo.svg', ESPNU: 'ESPN_wordmark.svg', ESPNEWS: 'ESPN_wordmark.svg', 'ESPN+': 'ESPN_wordmark.svg',
    ABC: 'ABC-2021-LOGO.svg',
    FOX: 'Fox_Broadcasting_Company_logo_(2019).svg', FS1: 'Fox_Sports_1_logo.svg', 'FOX SPORTS': '2015_Fox_Sports_logo.svg',
    CBS: 'CBS_logo.svg', 'CBS SPORTS NETWORK': 'CBS_Sports_Network_logo.svg',
    NBC: 'NBC_logo.svg',
    'BIG TEN NETWORK': 'Big_Ten_Network_logo.svg', BTN: 'Big_Ten_Network_logo.svg',
    'SEC NETWORK': 'SEC_Network_logo.svg',
    'ACC NETWORK': 'ACC_Network_logo.svg', ACCN: 'ACC_Network_logo.svg',
    'PAC-12 NETWORK': 'Pac-12_Network_logo.svg',
};

const logoFor = (channel) => {
    const file = FILES[channel.trim().toUpperCase()];
    return file ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}` : null;
};

const TvLogo = ({ channel, height = 16 }) => {
    const [failed, setFailed] = useState(false);
    if (!channel) return null;
    const src = failed ? null : logoFor(channel);
    if (!src) return <Box component="span" sx={{ fontWeight: 700 }}>{channel}</Box>;
    return <Box component="img" src={src} alt={channel} onError={() => setFailed(true)} sx={{ height, width: 'auto', maxWidth: 64, objectFit: 'contain', display: 'block' }} />;
};

TvLogo.propTypes = { channel: PropTypes.string, height: PropTypes.number };

export default TvLogo;
