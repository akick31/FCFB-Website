import { filterHistoryGames, finalScore, formatMinutes, sortHistoryGames, withScores } from './weekHistory';

const game = (id, extra) => ({
    game_id: id,
    home_team: `H${id}`,
    away_team: `A${id}`,
    home_score: 21,
    away_score: 14,
    ...extra,
});

test('postseason games lead, then the best-ranked matchups, then alphabetical', () => {
    const games = [
        game(1),
        game(2, { away_rank: 9 }),
        game(3, { postseason_name: 'Sun Bowl' }),
        game(4, { home_rank: 2 }),
    ];
    expect(sortHistoryGames(games).map((g) => g.game_id)).toEqual([3, 4, 2, 1]);
});

test('filters pick ranked, upset and one-score games', () => {
    const games = [game(1, { home_rank: 5 }), game(2, { home_score: 40 }), game(3)];
    expect(filterHistoryGames(games, 'ranked').map((g) => g.game_id)).toEqual([1]);
    expect(filterHistoryGames(games, 'close').map((g) => g.game_id)).toEqual([1, 3]);
    expect(filterHistoryGames(games, 'upsets', { upsets: [{ game_id: 2 }] }).map((g) => g.game_id)).toEqual([2]);
});

test('upsets carry the final score from their game', () => {
    expect(withScores([{ game_id: 1 }], [game(1, { home_score: 10, away_score: 24 })])[0].score).toBe('24-10');
    expect(finalScore(undefined)).toBe('');
    expect(formatMinutes(150)).toBe('2h 30m');
    expect(formatMinutes(45)).toBe('45m');
});
