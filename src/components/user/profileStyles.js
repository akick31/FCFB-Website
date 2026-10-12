export const rowSx = {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    px: 2,
    py: '14px',
    borderBottom: '1px solid var(--line-soft)',
    flexWrap: 'wrap',
    '&:last-of-type': { borderBottom: 0 },
};
export const lblSx = { fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' };
export const descSx = { color: 'var(--text-dim)', fontSize: '0.74rem' };
export const ctrlSx = {
    ml: 'auto',
    minWidth: '76px',
    textAlign: 'center',
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text-muted)',
    borderRadius: 'var(--r-sm)',
    px: '9px',
    py: '5px',
    font: 'inherit',
    fontSize: '0.72rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' },
};
export const inputSx = {
    width: '100%',
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    px: '12px',
    py: '10px',
    font: 'inherit',
    fontSize: '0.88rem',
};
export const primarySx = {
    border: 0,
    background: 'var(--brand-deep)',
    color: '#fff',
    borderRadius: 'var(--r-sm)',
    px: '14px',
    py: '9px',
    font: 'inherit',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
};
