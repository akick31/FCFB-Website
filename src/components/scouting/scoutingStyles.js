import { CONTROL_HEIGHT } from '../../styles/controls';

export const ghostBtnSx = {
    height: CONTROL_HEIGHT,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    px: '12px',
    font: 'inherit',
    fontSize: '0.76rem',
    fontWeight: 700,
    cursor: 'pointer',
};
export const stepBtnSx = {
    height: CONTROL_HEIGHT,
    boxSizing: 'border-box',
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    width: '30px',
    font: 'inherit',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
};

export const chipSx = (active) => ({
    border: '1px solid',
    borderColor: active ? 'var(--brand)' : 'var(--line)',
    background: active ? 'color-mix(in srgb, var(--brand) 16%, var(--surface))' : 'var(--surface-2)',
    color: active ? 'var(--brand)' : 'var(--text-muted)',
    borderRadius: 'var(--r-sm)',
    px: '10px',
    py: '5px',
    font: 'inherit',
    fontSize: '0.76rem',
    fontWeight: 700,
    cursor: 'pointer',
});
