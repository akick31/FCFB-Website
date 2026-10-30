/** @jest-environment jsdom */
import { numberRows, winProbabilityRows } from './playRows';

jest.mock('../../ui/TeamName', () => ({ __esModule: true, default: () => null }));
jest.mock('../../ui/UserLink', () => ({ __esModule: true, default: () => null }));

const valueOf = (rows, label) => rows.find(([name]) => name === label)[1];

test('numbers stay hidden until the play resolves', () => {
    const pending = numberRows({ play_finished: false, offensive_number: '500', defensive_number: 'abc' });
    expect(valueOf(pending, 'Offensive number')).toBe('Hidden until the play resolves');
    expect(valueOf(pending, 'Defensive number')).toBe('Hidden until the play resolves');
    const resolved = numberRows({
        play_finished: true,
        offensive_number: '750',
        defensive_number: '595',
        difference: 155,
    });
    expect([valueOf(resolved, 'Offensive number'), valueOf(resolved, 'Difference')]).toEqual(['750', 155]);
});

test('the swing reads for both teams', () => {
    const rows = winProbabilityRows({
        play: { win_probability: 0.6 },
        swing: { before: 0.6, after: 0.1, change: -0.5 },
        offense: 'Wyoming',
        homeName: 'Wyoming',
        awayName: 'Idaho',
    });
    expect(valueOf(rows, 'Swing for Wyoming')).toBe('-50%');
    expect(valueOf(rows, 'Swing for Idaho')).toBe('+50%');
});
