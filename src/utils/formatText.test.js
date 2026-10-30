import { weekLabel } from './formatText';

test('postseason weeks are named by round, regular weeks by number', () => {
    expect(weekLabel(4)).toBe('Week 4');
    expect(weekLabel(13)).toBe('Conference Championship Week');
    expect(weekLabel(14)).toBe('Bowls & First Round');
    expect(weekLabel(17)).toBe('Semifinals');
    expect(weekLabel(18)).toBe('National Championship');
});
