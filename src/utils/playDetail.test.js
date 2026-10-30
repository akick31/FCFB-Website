import { formatDuration, homeWinChance, playNeighbors, playSwing } from './playDetail';

const plays = [
    { play_id: 3, play_number: 3, possession: 'HOME', win_probability: 0.003 },
    { play_id: 1, play_number: 1, possession: 'HOME', win_probability: 0.6 },
    { play_id: 2, play_number: 2, possession: 'AWAY', win_probability: 0.997 },
];

test('win chance is read from the home side whoever has the ball', () => {
    expect(homeWinChance(plays[2])).toBeCloseTo(0.003);
    expect(homeWinChance({ possession: 'HOME' })).toBeNull();
});

test('neighbors follow play order, not list order', () => {
    const { index, total, previous, next } = playNeighbors(plays, 2);
    expect([index, total, previous.play_id, next.play_id]).toEqual([1, 3, 1, 3]);
    expect(playNeighbors(plays, 3).next).toBeNull();
});

test('the swing runs from the play before to this play, and a quiet change of possession is none', () => {
    expect(playSwing(plays[0], plays[2]).change).toBeCloseTo(0);
    expect(playSwing(plays[2], plays[1]).change).toBeCloseTo(-0.597);
    expect(playSwing(plays[1], null).change).toBeNull();
});

test('durations read as the two largest units', () => {
    expect(formatDuration(13)).toBe('13s');
    expect(formatDuration(128)).toBe('2m 8s');
    expect(formatDuration(90061)).toBe('1d 1h');
    expect(formatDuration(0)).toBe('0s');
});
