export const inputSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    height: '36px',
    px: '10px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.85rem',
    width: '100%',
};

export const buttonSx = {
    border: 0,
    background: 'var(--brand-deep)',
    color: '#fff',
    borderRadius: 'var(--r-sm)',
    px: '14px',
    height: '36px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    '&:disabled': { opacity: 0.6, cursor: 'default' },
};

export const secondaryButtonSx = {
    ...buttonSx,
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--line)',
};

export const labelSx = {
    display: 'block',
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 800,
    color: 'var(--text-dim)',
    mb: '5px',
};
