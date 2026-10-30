import { conferenceLeaders } from './conferenceLeaders';

const team = (name, conference, division, wins, losses) => ({
    name,
    conference,
    division,
    current_conference_wins: wins,
    current_conference_losses: losses,
});

test('each division of a conference gets its own leader, in conference order', () => {
    const teams = [
        team('Alpha', 'MAC', 'West', 3, 1),
        team('Bravo', 'MAC', 'West', 4, 0),
        team('Charlie', 'MAC', 'East', 2, 2),
        team('Delta', 'SEC', null, 1, 0),
        team('Echo', 'SEC', null, 3, 1),
    ];
    const leaders = conferenceLeaders(teams, ['SEC', 'MAC']);
    expect(leaders.map((row) => [row.conference, row.division, row.team.name])).toEqual([
        ['SEC', null, 'Delta'],
        ['MAC', 'East', 'Charlie'],
        ['MAC', 'West', 'Bravo'],
    ]);
});

test('equal records go to the team with more conference wins', () => {
    const leaders = conferenceLeaders([team('Alpha', 'SEC', null, 1, 1), team('Bravo', 'SEC', null, 2, 2)], ['SEC']);
    expect(leaders[0].team.name).toBe('Bravo');
});
