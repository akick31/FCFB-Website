const tint = (color, amount) => `color-mix(in srgb, ${color} ${amount}%, transparent)`;

export const cellTone = ({ conference, neutral, independent }) => {
    if (neutral) {
        return { color: 'var(--disc)', rest: tint('var(--disc)', 18), hover: tint('var(--disc)', 28) };
    }
    if (conference) {
        return { color: 'var(--brand)', rest: tint('var(--brand)', 12), hover: tint('var(--brand)', 20) };
    }
    if (independent) {
        return { color: 'var(--text-dim)', rest: 'transparent', hover: 'var(--surface-2)' };
    }
    return { color: 'var(--gold)', rest: tint('var(--gold)', 12), hover: tint('var(--gold)', 20) };
};

export const legendSwatch = (color, amount) => ({
    width: 12,
    height: 12,
    borderRadius: '3px',
    background: tint(color, amount),
    border: `1px solid ${color}`,
});
