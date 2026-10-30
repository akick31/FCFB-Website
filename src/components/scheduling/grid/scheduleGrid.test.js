import { buildScheduleGrid, conferenceGameCounts } from './scheduleGrid';

const teams = [{ name: 'Alpha' }, { name: 'Beta' }];

test('conference games fill both teams and other games only fill open weeks', () => {
    const grid = buildScheduleGrid(
        teams,
        [{ week: 1, home_team: 'Alpha', away_team: 'Beta' }],
        [
            { week: 1, home_team: 'Alpha', away_team: 'Gamma', game_type: 'OUT_OF_CONFERENCE' },
            { week: 2, home_team: 'Delta', away_team: 'Beta', game_type: 'OUT_OF_CONFERENCE' },
            { week: 14, home_team: 'Alpha', away_team: 'Zeta', game_type: 'BOWL' },
        ]
    );
    expect(grid.Alpha[1]).toMatchObject({ opponent: 'Beta', isHome: true, gameType: 'CONFERENCE_GAME' });
    expect(grid.Beta[1]).toMatchObject({ opponent: 'Alpha', isHome: false });
    expect(grid.Beta[2]).toMatchObject({ opponent: 'Delta', isHome: false, gameType: 'OUT_OF_CONFERENCE' });
    expect(grid.Alpha[14]).toBeUndefined();
});

test('conference game counts split home and away', () => {
    expect(
        conferenceGameCounts([
            { home_team: 'Alpha', away_team: 'Beta' },
            { homeTeam: 'Beta', awayTeam: 'Alpha' },
            { home_team: 'Alpha', away_team: 'Gamma' },
        ])
    ).toEqual({ Alpha: { home: 2, away: 1 }, Beta: { home: 1, away: 1 }, Gamma: { home: 0, away: 1 } });
});
