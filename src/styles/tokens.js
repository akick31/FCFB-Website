export const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const COND = '"Helvetica Neue", "Arial Narrow", Arial, system-ui, sans-serif';

export const DARK = {
    ground: '#0a1620',
    surface: '#102433',
    surface2: '#16324a',
    surfaceRaise: '#1a3a55',
    line: '#21445c',
    lineSoft: '#17303f',
    text: '#eef4f8',
    textMuted: '#94afc0',
    textDim: '#63808f',
    brand: '#37a6d0',
    brandDeep: '#004260',
    brandInk: '#08151f',
    live: '#ef3e36',
    field: '#37c07d',
    gold: '#f2b53c',
    disc: '#5865F2',
    shadow: '0 1px 0 rgba(255,255,255,.03), 0 10px 26px -14px rgba(0,0,0,.75)',
};

export const LIGHT = {
    ground: '#e9edf1',
    surface: '#ffffff',
    surface2: '#f5f8fa',
    surfaceRaise: '#eef3f6',
    line: '#d3dce3',
    lineSoft: '#e6ecf0',
    text: '#0c2130',
    textMuted: '#4c6272',
    textDim: '#7c94a3',
    brand: '#00648e',
    brandDeep: '#004260',
    brandInk: '#ffffff',
    live: '#d12a2e',
    field: '#17914f',
    gold: '#b06f12',
    disc: '#5865F2',
    shadow: '0 1px 2px rgba(12,33,48,.05), 0 12px 26px -18px rgba(12,33,48,.4)',
};

export const TOKENS = { dark: DARK, light: LIGHT };

const VAR_NAMES = {
    ground: '--ground',
    surface: '--surface',
    surface2: '--surface-2',
    surfaceRaise: '--surface-raise',
    line: '--line',
    lineSoft: '--line-soft',
    text: '--text',
    textMuted: '--text-muted',
    textDim: '--text-dim',
    brand: '--brand',
    brandDeep: '--brand-deep',
    brandInk: '--brand-ink',
    live: '--live',
    field: '--field',
    gold: '--gold',
    disc: '--disc',
    shadow: '--shadow',
};

const toVars = (tokens) =>
    Object.entries(VAR_NAMES)
        .map(([key, name]) => `${name}:${tokens[key]};`)
        .join('');

export const tokenCss = `
:root{${toVars(DARK)}--sans:${SANS};--cond:${COND};--r-sm:4px;--r:7px;--r-lg:12px;}
:root[data-theme="light"]{${toVars(LIGHT)}}
`;
