import { TOKENS } from '../styles/tokens';

const luminance = (hex) => {
    if (!hex) {
        return null;
    }
    let value = hex.replace(/^#/, '');
    if (value.length === 3) {
        value = value
            .split('')
            .map((channel) => channel + channel)
            .join('');
    }
    if (!/^[0-9a-f]{6}$/i.test(value)) {
        return null;
    }
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
        if (colorLuminance === null) {
            return false;
        }
        return (
            (Math.max(colorLuminance, backgroundLuminance) + 0.05) /
                (Math.min(colorLuminance, backgroundLuminance) + 0.05) >=
            3
        );
    };
    return [primary, secondary].find(visible) || fallback;
};

const rgb = (hex) => {
    const value = hex.replace(/^#/, '');
    const full = value.length === 3 ? value.replace(/./g, '$&$&') : value;
    return [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16));
};

const MIN_OPPONENT_DISTANCE = 90;
const NEUTRAL_SPREAD = 40;
const ACCENT_FALLBACKS = ['#3d8bd9', '#e0a526', '#2fa56b', '#d9653d'];

const isNeutral = (color) => {
    if (luminance(color) === null) {
        return false;
    }
    const channels = rgb(color);
    return Math.max(...channels) - Math.min(...channels) < NEUTRAL_SPREAD;
};

const MIN_HUE_GAP = 40;

const hue = (color) => {
    const [r, g, b] = rgb(color);
    const max = Math.max(r, g, b);
    const delta = max - Math.min(r, g, b);
    if (max === r) {
        return (((g - b) / delta) * 60 + 360) % 360;
    }
    return max === g ? ((b - r) / delta) * 60 + 120 : ((r - g) / delta) * 60 + 240;
};

const sameHueFamily = (color, other) => {
    const gap = Math.abs(hue(color) - hue(other));
    return Math.min(gap, 360 - gap) < MIN_HUE_GAP;
};

const distinctFrom = (color, other) => {
    if (luminance(color) === null || luminance(other) === null) {
        return true;
    }
    if (isNeutral(color) && isNeutral(other)) {
        return false;
    }
    if (!isNeutral(color) && !isNeutral(other) && sameHueFamily(color, other)) {
        return false;
    }
    const [a, b] = [rgb(color), rgb(other)];
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) >= MIN_OPPONENT_DISTANCE;
};

const brandColors = (mark) => [mark?.primaryColor, mark?.secondaryColor].filter((color) => luminance(color) !== null);

export const pickMatchupColors = (homeMark, awayMark, background, fallback = '#ffffff') => {
    const home = pickChartColor(homeMark?.primaryColor, homeMark?.secondaryColor, background, fallback);
    const visible = (color) => Boolean(pickChartColor(color, null, background, null));
    const teamCandidates = [awayMark?.primaryColor, awayMark?.secondaryColor].filter(visible);
    const homeBrand = brandColors(homeMark);
    const accents = ACCENT_FALLBACKS.filter(visible);
    const awayPool = [
        ...teamCandidates,
        fallback,
        ...accents.filter((color) => homeBrand.every((brand) => distinctFrom(color, brand))),
    ];
    const away = awayPool.find((color) => distinctFrom(color, home)) || accents[0] || ACCENT_FALLBACKS[0];
    return { home, away };
};

export const matchupColorsFor = (homeMark, awayMark, mode) =>
    pickMatchupColors(homeMark, awayMark, TOKENS[mode].surface, mode === 'dark' ? '#ffffff' : TOKENS.light.text);
