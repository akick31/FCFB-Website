import { playoffAdvancement } from './playoffAdvancement';
import { CFP_LOGO_URL } from '../constants/playoffBracket';

const game = (round, homeSeed = 9, awaySeed = 24) => ({
    playoff_round: round,
    home_team: 'Home',
    away_team: 'Away',
    playoff_home_seed: homeSeed,
    playoff_away_seed: awaySeed,
});

const slot = (id, round, homeSeed, awaySeed, homeTeam = 'Opponent', awayTeam = 'OPEN') => ({
    id,
    game_type: round === 5 ? 'NATIONAL_CHAMPIONSHIP' : 'PLAYOFFS',
    playoff_round: round,
    playoff_home_seed: homeSeed,
    playoff_away_seed: awaySeed,
    home_team: homeTeam,
    away_team: awayTeam,
});

test('a first-round away winner fills the correct bye game without replacing its home team', () => {
    const plan = playoffAdvancement(game(1), 'Away', [slot(50, 2, 7, null), slot(51, 2, 8, null)], 12);
    expect(plan.operation).toBe('update');
    expect(plan.scheduleEntryId).toBe(51);
    expect(plan.entry).toEqual({
        season: 12,
        week: 15,
        subdivision: 'FBS',
        homeTeam: 'Opponent',
        awayTeam: 'Away',
        gameType: 'PLAYOFFS',
        playoffRound: 2,
        playoffHomeSeed: 8,
        playoffAwaySeed: 24,
        postseasonGameLogo: CFP_LOGO_URL,
        postseasonGameName: 'Second Round',
    });
    expect(plan.message).toBe('Away (#24) advances to face #8 in Second Round (Week 15)!');
});

test.each([
    [2, 3, 8, 4, 16, 'Quarterfinal'],
    [3, 4, 4, 3, 17, 'Semifinal'],
])(
    'round %i advancement matches seed groups rather than the first open slot',
    (round, nextRound, opponentSeed, unrelatedSeed, week, label) => {
        const plan = playoffAdvancement(
            game(round, 1),
            'Home',
            [slot(50, nextRound, unrelatedSeed, null), slot(51, nextRound, opponentSeed, null)],
            12
        );
        expect(plan.scheduleEntryId).toBe(51);
        expect(plan.entry).toMatchObject({
            homeTeam: 'Opponent',
            awayTeam: 'Home',
            playoffAwaySeed: 1,
            week,
            postseasonGameName: label,
        });
    }
);

test('a semifinal winner fills an open home slot in the existing final', () => {
    const plan = playoffAdvancement(game(4, 2, 7), 'Away', [slot(51, 5, null, 1, 'TBD', 'Finalist')], 12);
    expect(plan.operation).toBe('update');
    expect(plan.entry).toMatchObject({
        homeTeam: 'Away',
        awayTeam: 'Finalist',
        playoffHomeSeed: 7,
        playoffAwaySeed: 1,
        gameType: 'NATIONAL_CHAMPIONSHIP',
        week: 18,
    });
});

test('a full matching game is retained and an unmatched winner gets a new placeholder', () => {
    const schedule = [slot(51, 3, 8, 1, 'Opponent', 'Existing Winner')];
    const before = JSON.parse(JSON.stringify(schedule));
    const plan = playoffAdvancement(game(2, 9), 'Home', schedule, 12);
    expect(plan.operation).toBe('create');
    expect(plan.entry).toMatchObject({
        homeTeam: 'Home',
        awayTeam: 'OPEN',
        playoffHomeSeed: 9,
        playoffAwaySeed: null,
        playoffRound: 3,
        week: 16,
    });
    expect(schedule).toEqual(before);
});

test('camel-case schedule fields produce the same final entry as snake-case fields', () => {
    const snakeCaseGame = game(4, 1, 2);
    const camelCaseGame = {
        playoffRound: 4,
        homeTeam: 'Home',
        awayTeam: 'Away',
        playoffHomeSeed: 1,
        playoffAwaySeed: 2,
    };
    expect(playoffAdvancement(camelCaseGame, 'Home', [], 12)).toEqual(
        playoffAdvancement(snakeCaseGame, 'Home', [], 12)
    );
});
