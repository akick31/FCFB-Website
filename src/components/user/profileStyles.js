import { secondaryButtonSx } from '../../styles/controls';
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
    ...secondaryButtonSx,
    ml: 'auto',
    minWidth: '76px',
    textAlign: 'center',
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
