export const btnPrimarySx = {
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
export const btnLiveSx = {
    border: 0,
    background: 'var(--live)',
    color: '#fff',
    borderRadius: 'var(--r-sm)',
    px: '14px',
    py: '9px',
    font: 'inherit',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
};
export const ctrlSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text-muted)',
    borderRadius: 'var(--r-sm)',
    px: '14px',
    py: '9px',
    font: 'inherit',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' },
};
export const cardGridSx = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '14px',
    padding: '16px',
};
export const cardSx = {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r)',
    overflow: 'hidden',
};
export const teamRowSx = (won) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    px: '12px',
    py: '7px',
    background: won ? 'color-mix(in srgb, var(--field) 10%, transparent)' : 'transparent',
    borderBottom: '1px solid var(--line-soft)',
    '&:last-of-type': { borderBottom: 0 },
});
export const removeXSx = {
    border: 0,
    background: 'transparent',
    color: 'var(--live)',
    cursor: 'pointer',
    fontSize: '0.95rem',
    ml: 'auto',
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
export const inputSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    px: '10px',
    height: '38px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.82rem',
    width: '100%',
};
export const selectSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    px: '10px',
    height: '38px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.82rem',
    cursor: 'pointer',
    width: '100%',
    '& option': { background: 'var(--surface)', color: 'var(--text)' },
};
export const dialogPaperSx = {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-lg)',
};
export const dialogTitleSx = { color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem' };
export const autocompleteSx = { '& .MuiOutlinedInput-root': { borderRadius: 'var(--r-sm)' } };
