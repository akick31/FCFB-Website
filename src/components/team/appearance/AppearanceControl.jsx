import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Toggle from '../../ui/Toggle';
import LogoUrlField from '../../admin/LogoUrlField';
import ConferenceColorsControl from './ConferenceColorsControl';
import FontControl from './FontControl';

const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem' };
const clearSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const pickSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '8px', height: '26px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' }, '&:disabled': { opacity: 0.4, cursor: 'default' } };
const swatchSx = (color) => ({ width: 12, height: 12, borderRadius: 2, border: '1px solid var(--line)', background: color || 'transparent', flexShrink: 0 });

const TEAM_COLOR_PICKS = [
    { label: 'Primary', key: 'primary_color' },
    { label: 'Secondary', key: 'secondary_color' },
    { label: 'Tertiary', key: 'tertiary_color' },
];
const WHITE = '#FFFFFF';

const ColorControl = ({ value, onChange, clearable, disabled, teamColors, resetColor }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box
                component="input"
                type="color"
                disabled={disabled}
                value={value || '#000000'}
                onChange={(event) => onChange(event.target.value.toUpperCase())}
                sx={{ width: 42, height: 38, p: '2px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', cursor: disabled ? 'default' : 'pointer', opacity: value ? 1 : 0.35 }}
            />
            <Box component="input" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} placeholder={clearable ? 'Not set' : '#RRGGBB'} sx={inputSx} />
            {clearable && value && !disabled && (
                <Box component="button" type="button" onClick={() => onChange('')} sx={clearSx}>Clear</Box>
            )}
        </Box>
        {teamColors && (
            <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {TEAM_COLOR_PICKS.map((pick) => (
                    <Box
                        key={pick.key}
                        component="button"
                        type="button"
                        disabled={disabled || !teamColors[pick.key]}
                        onClick={() => onChange((teamColors[pick.key] || '').toUpperCase())}
                        sx={{ ...pickSx, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    >
                        <Box sx={swatchSx(teamColors[pick.key])} />{pick.label}
                    </Box>
                ))}
                <Box component="button" type="button" disabled={disabled} onClick={() => onChange(WHITE)} sx={{ ...pickSx, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Box sx={swatchSx(WHITE)} />White
                </Box>
                {resetColor && (
                    <Box component="button" type="button" disabled={disabled} onClick={() => onChange(resetColor.toUpperCase())} sx={{ ...pickSx, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Box sx={swatchSx(resetColor)} />Default
                    </Box>
                )}
            </Box>
        )}
    </Box>
);

ColorControl.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
    teamColors: PropTypes.object,
    resetColor: PropTypes.string,
};

const ScaleControl = ({ definition, value, onChange, disabled }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Box
            component="input"
            type="range"
            disabled={disabled}
            min={definition.min}
            max={definition.max}
            step={definition.step}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            sx={{ flex: 1, accentColor: 'var(--brand)' }}
        />
        <Box sx={{ width: 48, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{Number(value).toFixed(definition.decimals ?? 2)}{definition.unit ?? 'x'}</Box>
    </Box>
);

ScaleControl.propTypes = {
    definition: PropTypes.object.isRequired,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

const AppearanceControl = ({ definition, value, onChange, disabled, teamColors, team }) => {
    switch (definition.type) {
        case 'color':
            return <ColorControl value={value} onChange={onChange} disabled={disabled} teamColors={teamColors} resetColor={definition.resetColor} />;
        case 'optionalColor':
            return <ColorControl value={value} onChange={onChange} clearable disabled={disabled} teamColors={teamColors} resetColor={definition.resetColor} />;
        case 'scale':
            return <ScaleControl definition={definition} value={value} onChange={onChange} disabled={disabled} />;
        case 'select':
        case 'graphic':
        case 'stripe':
            return (
                <Box component="select" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} sx={inputSx}>
                    {definition.options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </Box>
            );
        case 'toggle':
            return <Toggle on={value} onClick={() => onChange(!value)} disabled={disabled} />;
        case 'logo':
            return <LogoUrlField label="" value={value} onChange={(event) => onChange(event.target.value)} />;
        case 'conferenceColors':
            return <ConferenceColorsControl team={team} value={value} onChange={onChange} disabled={disabled} teamColors={teamColors} />;
        case 'font':
            return <FontControl value={value} onChange={onChange} disabled={disabled} allowDefault={definition.allowDefault} />;
        default:
            return <Box component="input" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} placeholder={definition.placeholder} sx={inputSx} />;
    }
};

AppearanceControl.propTypes = {
    definition: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]).isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    teamColors: PropTypes.object,
    team: PropTypes.string,
};

export default AppearanceControl;
