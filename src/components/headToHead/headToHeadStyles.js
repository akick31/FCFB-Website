export const CONTROL_HEIGHT = '34px';
export const inputSx = {
    height: CONTROL_HEIGHT,
    boxSizing: 'border-box',
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    px: '10px',
    py: 0,
    font: 'inherit',
    fontSize: '0.8rem',
};
export const btnSx = {
    height: CONTROL_HEIGHT,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    border: 0,
    background: 'var(--brand-deep)',
    color: '#fff',
    borderRadius: 'var(--r-sm)',
    px: '16px',
    font: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
};
export const labelSx = {
    fontSize: '0.68rem',
    fontWeight: 800,
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
};
