import { eloMovers, marqueeGames, pollMovers } from './homeHighlights';

const game = (fields) => ({ home_team: 'Home', away_team: 'Away', home_score: 0, away_score: 0, ...fields });

test('marquee games are ranked matchups, falling back to the closest live games', () => {
    const live = [
        game({ game_id: 1, home_score: 30, away_score: 0 }),
        game({ game_id: 2, home_score: 14, away_score: 13 }),
    ];
    const upcoming = [{ home_team: 'Alpha', away_team: 'Beta' }];
    const ranked = marqueeGames({ live, finals: [], upcoming, rankByTeam: { Alpha: 3, Beta: 9 } });
    expect(ranked.kind).toBe('ranked');
    expect(ranked.games[0]).toMatchObject({ home_team: 'Alpha', home_team_rank: 3, upcoming: true });
    const close = marqueeGames({ live, finals: [], upcoming: [], rankByTeam: {} });
    expect(close.kind).toBe('close');
    expect(close.games.map((entry) => entry.game_id)).toEqual([2, 1]);
});

test('poll movers compare against last week', () => {
    const movers = pollMovers(
        [
            { teamName: 'A', rank: 1 },
            { teamName: 'B', rank: 2 },
            { teamName: 'C', rank: 3 },
        ],
        [
            { teamName: 'B', rank: 1 },
            { teamName: 'A', rank: 4 },
        ]
    );
    expect(movers.risers).toEqual([{ team: 'A', value: 1, change: 3 }]);
    expect(movers.fallers).toEqual([{ team: 'B', value: 2, change: -1 }]);
    expect(movers.newcomers.map((move) => move.team)).toEqual(['C']);
});

test('elo movers use each team change from its previous game', () => {
    const rows = [
        { team: 'A', week: 1, elo: 1500 },
        { team: 'A', week: 2, elo: 1530.4 },
        { team: 'B', week: 1, elo: 1500 },
        { team: 'B', week: 2, elo: 1480 },
        { team: 'C', week: 2, elo: 1600 },
    ];
    const movers = eloMovers(rows, 2);
    expect(movers.risers).toEqual([{ team: 'A', value: 1530, change: 30 }]);
    expect(movers.fallers).toEqual([{ team: 'B', value: 1480, change: -20 }]);
});
