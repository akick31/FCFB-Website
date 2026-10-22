import { annotateScoutingFields, applyScenarioFilters, targetHasBall } from './scoutingReport';

const COACH = 'coach-1';
const OPPONENT = 'coach-2';

const play = (overrides) => ({
    game_id: 1,
    play_id: overrides.play_number,
    play_call: 'RUN',
    possession: 'HOME',
    home_score: 0,
    away_score: 0,
    offensive_submitter_id: COACH,
    defensive_submitter_id: OPPONENT,
    offensive_number: null,
    defensive_number: null,
    offensive_response_speed: null,
    defensive_response_speed: null,
    ...overrides,
});

const plays = [
    play({
        play_number: 1,
        play_call: 'PASS',
        actual_result: 'TOUCHDOWN',
        yards: 22,
        down: 2,
        offensive_number: 350,
        home_score: 7,
        away_score: 0,
        offensive_response_speed: 40,
    }),
    play({ play_number: 2, actual_result: 'GAIN', offensive_number: 120, home_score: 7, away_score: 14 }),
    play({
        play_number: 3,
        possession: 'AWAY',
        offensive_submitter_id: OPPONENT,
        defensive_submitter_id: COACH,
        defensive_number: 900,
        actual_result: 'GAIN',
        home_score: 7,
        away_score: 14,
        defensive_response_speed: 65,
    }),
    play({ play_number: 4, offensive_number: 10, home_score: 7, away_score: 14 }),
];

test('previous number chains across a possession change', () => {
    const annotated = annotateScoutingFields(plays, 'coach', COACH);

    expect(annotated.map((entry) => entry.previous_number)).toEqual([null, 350, 120, 900]);
});

test('score margin is read from the coach team, on offense or defense', () => {
    const annotated = annotateScoutingFields(plays, 'coach', COACH);

    expect(annotated.map((entry) => entry.score_margin)).toEqual([7, -7, -7, -7]);
    expect(targetHasBall(plays[2], 'coach', COACH)).toBe(false);
});

test('response speed follows the side the coach was on', () => {
    const annotated = annotateScoutingFields(plays, 'coach', COACH);

    expect(annotated[0].own_response_speed).toBe(40);
    expect(annotated[2].own_response_speed).toBe(65);
    expect(annotated[1].own_response_speed).toBeNull();
});

test('previous play call, result, yards and down describe the play before', () => {
    const annotated = annotateScoutingFields(plays, 'coach', COACH);

    expect(annotated.map((entry) => entry.previous_result)).toEqual([null, 'TOUCHDOWN', 'GAIN', 'GAIN']);
    expect(annotated.map((entry) => entry.previous_play_call)).toEqual([null, 'PASS', 'RUN', 'RUN']);
    expect(annotated[1].previous_yards).toBe(22);
    expect(annotated[1].previous_down).toBe(2);
});

test('chaining a previous touchdown with a number range', () => {
    const annotated = annotateScoutingFields(plays, 'coach', COACH);
    const chained = applyScenarioFilters(annotated, {
        mode: 'coach',
        target: COACH,
        customFilters: [
            { field: 'previous_play_call', operator: 'eq', value: 'PASS' },
            { field: 'previous_result', operator: 'eq', value: 'TOUCHDOWN' },
            { field: 'previous_number', operator: 'gte', value: 300 },
            { field: 'previous_number', operator: 'lte', value: 400 },
        ],
    });

    expect(chained.map((entry) => entry.play_number)).toEqual([2]);
});

test('the top card filters chain a previous play with a number range', () => {
    const annotated = annotateScoutingFields(plays, 'coach', COACH);
    const chained = applyScenarioFilters(annotated, {
        mode: 'coach',
        target: COACH,
        previousPlayCalls: ['PASS'],
        previousResults: ['TOUCHDOWN'],
        previousNumber: { min: 300, max: 400 },
    });
    const openRange = applyScenarioFilters(annotated, {
        mode: 'coach',
        target: COACH,
        previousNumber: { min: '', max: '' },
    });
    const trailing = applyScenarioFilters(annotated, {
        mode: 'coach',
        target: COACH,
        scoreMargin: { min: '', max: -7 },
    });

    expect(chained.map((entry) => entry.play_number)).toEqual([2]);
    expect(openRange).toHaveLength(4);
    expect(trailing.map((entry) => entry.play_number)).toEqual([2, 3, 4]);
});

test('the derived fields drive custom filters', () => {
    const annotated = annotateScoutingFields(plays, 'coach', COACH);
    const between = applyScenarioFilters(annotated, {
        mode: 'coach',
        target: COACH,
        customFilters: [
            { field: 'previous_number', operator: 'gte', value: 300 },
            { field: 'previous_number', operator: 'lte', value: 400 },
        ],
    });
    const trailing = applyScenarioFilters(annotated, {
        mode: 'coach',
        target: COACH,
        customFilters: [{ field: 'score_margin', operator: 'lte', value: -7 }],
    });

    expect(between.map((entry) => entry.play_number)).toEqual([2]);
    expect(trailing.map((entry) => entry.play_number)).toEqual([2, 3, 4]);
});
