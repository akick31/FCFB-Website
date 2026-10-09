const luminance = (hex) => {
    if (!hex) return null;
    let value = hex.replace(/^#/, '');
    if (value.length === 3) value = value.split('').map((channel) => channel + channel).join('');
    if (!/^[0-9a-f]{6}$/i.test(value)) return null;
    const channels = [0, 2, 4].map((offset) => {
        const channel = parseInt(value.slice(offset, offset + 2), 16) / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

export const pickChartColor = (primary, secondary, background, fallback = '#ffffff') => {
    const backgroundLuminance = luminance(background);
    const visible = (color) => {
        const colorLuminance = luminance(color);
        if (colorLuminance === null) return false;
        return (Math.max(colorLuminance, backgroundLuminance) + 0.05)
            / (Math.min(colorLuminance, backgroundLuminance) + 0.05) >= 3;
    };
    return [primary, secondary].find(visible) || fallback;
};
