import { pickChartColor, pickMatchupColors } from './chartColor';

const DARK_SURFACE = '#102433';
const LIGHT_SURFACE = '#ffffff';

describe('pickChartColor', () => {
    it('falls back to secondary when primary is invisible on the background', () => {
        expect(pickChartColor('#102433', '#ffcc00', DARK_SURFACE)).toBe('#ffcc00');
    });
});

describe('pickMatchupColors', () => {
    it('keeps both primaries when they contrast with the background and each other', () => {
        const home = { primaryColor: '#e03030', secondaryColor: '#000000' };
        const away = { primaryColor: '#3399ff', secondaryColor: '#ffffff' };
        expect(pickMatchupColors(home, away, DARK_SURFACE)).toEqual({ home: '#e03030', away: '#3399ff' });
    });

    it('moves the away team to its secondary when both primaries are the same red', () => {
        const home = { primaryColor: '#e03030', secondaryColor: '#ffffff' };
        const away = { primaryColor: '#e53a3a', secondaryColor: '#ffcc00' };
        expect(pickMatchupColors(home, away, DARK_SURFACE)).toEqual({ home: '#e03030', away: '#ffcc00' });
    });

    it('skips a dark purple primary on the dark surface', () => {
        const home = { primaryColor: '#3b1a6b', secondaryColor: '#c0c0c0' };
        const away = { primaryColor: '#0033a0', secondaryColor: '#ffffff' };
        expect(pickMatchupColors(home, away, DARK_SURFACE).home).toBe('#c0c0c0');
    });

    it('falls back to a neutral when nothing distinct is visible', () => {
        const home = { primaryColor: '#ffffff', secondaryColor: '#ffffff' };
        const away = { primaryColor: '#fefefe', secondaryColor: '#fdfdfd' };
        const colors = pickMatchupColors(home, away, DARK_SURFACE);
        expect(colors.away).toBe('#3d8bd9');
    });

    it('uses a dark fallback on the light surface', () => {
        const home = { primaryColor: '#ffffff', secondaryColor: '#fafafa' };
        const colors = pickMatchupColors(home, home, LIGHT_SURFACE, '#22323e');
        expect(colors.home).toBe('#22323e');
    });

    it('does not pair silver against white', () => {
        const home = { primaryColor: '#ffffff', secondaryColor: '#000000' };
        const away = { primaryColor: '#c0c0c0', secondaryColor: '#f0405a' };
        expect(pickMatchupColors(home, away, DARK_SURFACE)).toEqual({ home: '#ffffff', away: '#f0405a' });
    });

    it('uses the accent when both teams are neutral', () => {
        const home = { primaryColor: '#ffffff', secondaryColor: '#000000' };
        const away = { primaryColor: '#c0c0c0', secondaryColor: '#d0d0d0' };
        expect(pickMatchupColors(home, away, DARK_SURFACE).away).toBe('#3d8bd9');
    });
});

describe('accent fallbacks', () => {
    it('never gives the away team the same blue as a blue home team', () => {
        const home = { primaryColor: '#3d8bd9', secondaryColor: '#3d8bd9' };
        const away = { primaryColor: '#111111', secondaryColor: '#151515' };
        expect(pickMatchupColors(home, away, DARK_SURFACE).away).toBe('#ffffff');
    });

    it('avoids an accent that matches the opponent brand blue even when the opponent shows white', () => {
        const home = { primaryColor: '#002e5d', secondaryColor: '#ffffff' };
        const away = { primaryColor: '#512888', secondaryColor: '#d1d1d1' };
        const colors = pickMatchupColors(home, away, DARK_SURFACE);
        expect(colors.home).toBe('#ffffff');
        expect(colors.away).toBe('#e0a526');
    });
});
