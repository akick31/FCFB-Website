import { homeWinProbability } from './winProbability';

test('the latest play wins over the game row and is flipped to the home side', () => {
    expect(
        homeWinProbability({ win_probability: 0.9, possession: 'HOME' }, { win_probability: 0.3, possession: 'AWAY' })
    ).toBe(0.7);
    expect(homeWinProbability({ win_probability: 0.25, possession: 'AWAY' }, null)).toBe(0.75);
    expect(homeWinProbability({}, null)).toBeNull();
});
