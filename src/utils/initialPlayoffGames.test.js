import { initialPlayoffGames } from './initialPlayoffGames';

test('retains all first-round pairings and second-round bye order', () => {
    const teams = Array.from({ length: 24 }, (_, index) => ({ name: `Seed ${index + 1}` }));
    const { firstRoundGames, secondRoundGames } = initialPlayoffGames(teams);
    expect(firstRoundGames.map((game) => [game.playoffHomeSeed, game.playoffAwaySeed])).toEqual([
        [9, 24],
        [10, 23],
        [11, 22],
        [12, 21],
        [13, 20],
        [14, 19],
        [15, 18],
        [16, 17],
    ]);
    expect(firstRoundGames.map((game) => [game.homeTeam, game.awayTeam, game.week])).toEqual([
        ['Seed 9', 'Seed 24', 14],
        ['Seed 10', 'Seed 23', 14],
        ['Seed 11', 'Seed 22', 14],
        ['Seed 12', 'Seed 21', 14],
        ['Seed 13', 'Seed 20', 14],
        ['Seed 14', 'Seed 19', 14],
        ['Seed 15', 'Seed 18', 14],
        ['Seed 16', 'Seed 17', 14],
    ]);
    expect(secondRoundGames.map((game) => [game.homeTeam, game.awayTeam, game.playoffAwaySeed, game.week])).toEqual(
        [1, 8, 4, 5, 3, 6, 2, 7].map((seed) => [`Seed ${seed}`, 'OPEN', null, 15])
    );
});

test('leaves incomplete selections absent for the preview to label', () => {
    const { firstRoundGames, secondRoundGames } = initialPlayoffGames(Array(24).fill(null));
    expect(firstRoundGames[0].homeTeam).toBeUndefined();
    expect(firstRoundGames[0].awayTeam).toBeUndefined();
    expect(secondRoundGames[0].homeTeam).toBeUndefined();
    expect(secondRoundGames[0].awayTeam).toBe('OPEN');
});
