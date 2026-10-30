export const CONTROL_HEIGHT = '38px';
export const COMPACT_HEIGHT = '30px';
export const PILL_HEIGHT = '34px';

const buttonBase = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    height: CONTROL_HEIGHT,
    boxSizing: 'border-box',
    px: '16px',
    borderRadius: 'var(--r-sm)',
    font: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    textDecoration: 'none',
    '&:disabled': { opacity: 0.6, cursor: 'default' },
    '&:focus-visible': { outline: '2px solid var(--brand)', outlineOffset: '1px' },
};

export const primaryButtonSx = {
    ...buttonBase,
    border: 0,
    background: 'var(--brand-deep)',
    color: '#fff',
    '&:hover:not(:disabled)': { filter: 'brightness(1.12)' },
};

export const secondaryButtonSx = {
    ...buttonBase,
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text-muted)',
    '&:hover:not(:disabled)': { borderColor: 'var(--brand)', color: 'var(--text)' },
};

export const dangerButtonSx = {
    ...buttonBase,
    border: 0,
    background: 'var(--live)',
    color: '#fff',
};

export const linkButtonSx = {
    border: 0,
    background: 'transparent',
    p: 0,
    color: 'var(--brand)',
    font: 'inherit',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:disabled': { opacity: 0.6, cursor: 'default' },
};

export const pillHeight = (sx) => ({ ...sx, height: PILL_HEIGHT, px: '12px' });

export const compact = (sx) => ({ ...sx, height: COMPACT_HEIGHT, px: '10px', fontSize: '0.74rem' });

export const inputSx = {
    width: '100%',
    height: CONTROL_HEIGHT,
    boxSizing: 'border-box',
    px: '10px',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-sm)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    font: 'inherit',
    fontSize: '0.85rem',
    '&:disabled': { opacity: 0.6 },
    '&:focus-visible': { outline: '2px solid var(--brand)', outlineOffset: '-1px' },
};

export const textareaSx = {
    ...inputSx,
    height: 'auto',
    py: '8px',
    lineHeight: 1.5,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    resize: 'vertical',
};

export const selectSx = {
    ...inputSx,
    cursor: 'pointer',
    '& option': { background: 'var(--surface-2)', color: 'var(--text)' },
};

export const labelSx = {
    display: 'block',
    mb: '5px',
    fontSize: '0.68rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: 'var(--text-dim)',
};

export const helpSx = { mt: '4px', fontSize: '0.7rem', color: 'var(--text-dim)' };

export const formGridSx = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '0 16px',
    p: '16px',
};
