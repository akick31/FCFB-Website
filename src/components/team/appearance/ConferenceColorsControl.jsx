import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { getConferenceLogoColors } from '../../../api/teamAppearanceApi';

const TOKENS = [
    { value: 'KEEP', label: 'Keep original' },
    { value: 'PRIMARY', label: 'Primary' },
    { value: 'SECONDARY', label: 'Secondary' },
    { value: 'TERTIARY', label: 'Tertiary' },
    { value: 'WHITE', label: 'White' },
    { value: 'BLACK', label: 'Black' },
];
const selectSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '8px', height: '32px', font: 'inherit', fontSize: '0.8rem' };

const parseMap = (value) => {
    if (!value) return {};
    try { return JSON.parse(value); } catch { return {}; }
};

const tokenColor = (token, hex, teamColors) => {
    switch (token) {
        case 'PRIMARY': return teamColors?.primary_color || hex;
        case 'SECONDARY': return teamColors?.secondary_color || hex;
        case 'TERTIARY': return teamColors?.tertiary_color || hex;
        case 'WHITE': return '#FFFFFF';
        case 'BLACK': return '#000000';
        default: return hex;
    }
};

const ConferenceColorsControl = ({ team, value, onChange, disabled, teamColors }) => {
    const [colors, setColors] = useState(null);
    const map = parseMap(value);

    useEffect(() => {
        let cancelled = false;
        getConferenceLogoColors(team).then((loaded) => { if (!cancelled) setColors(loaded); }).catch(() => { if (!cancelled) setColors([]); });
        return () => { cancelled = true; };
    }, [team]);

    const setToken = (hex, token) => {
        const next = { ...map };
        if (token === 'KEEP') delete next[hex];
        else next[hex] = token;
        onChange(Object.keys(next).length ? JSON.stringify(next) : '');
    };

    if (colors === null) return <CircularProgress size={20} />;
    if (colors.length === 0) return <Box sx={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>No conference logo to recolor.</Box>;

    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {colors.map((hex) => (
                <Box key={hex} sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box title={hex} sx={{ width: 18, height: 18, borderRadius: 2, border: '1px solid var(--line)', background: tokenColor(map[hex] || 'KEEP', hex, teamColors), flexShrink: 0 }} />
                    <Box component="select" disabled={disabled} value={map[hex] || 'KEEP'} onChange={(e) => setToken(hex, e.target.value)} sx={selectSx}>
                        {TOKENS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

ConferenceColorsControl.propTypes = {
    team: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    teamColors: PropTypes.object,
};

export default ConferenceColorsControl;
