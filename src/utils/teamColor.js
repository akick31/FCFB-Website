const luminance = (hex) => {
    if (!hex) return 0.5;
    let value = String(hex).replace('#', '');
    if (value.length === 3) value = value.split('').map((c) => c + c).join('');
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

export const pickTeamColor = (team, mode) => {
    const dark = mode === 'dark';
    const primary = team?.primaryColor || '#004260';
    const secondary = team?.secondaryColor || '#888888';
    const legible = (color) => {
        const l = luminance(color);
        return dark ? l > 0.24 : l < 0.8;
    };
    if (legible(primary)) return primary;
    if (secondary && legible(secondary)) return secondary;
    return dark ? '#cfe0ea' : '#22323e';
};
