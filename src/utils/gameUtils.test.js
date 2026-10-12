import { formatDownAndDistance } from './gameUtils';

test('zero yards is a valid distance', () => {
    expect(formatDownAndDistance(1, 0)).toBe('1st & 0');
});

test.each([null, undefined, '', false, NaN])('missing distance %s retains the existing fallback', (distance) => {
    expect(formatDownAndDistance(1, distance)).toBe('--');
});
