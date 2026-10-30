import { buildCoachStints, buildTeamCoachHistory } from './coachHistory';

const log = (date, transaction, coach, position = 'HEAD_COACH', team = 'Iowa State') => ({
    team,
    transaction_date: date,
    transaction,
    position,
    coach: [coach],
});

const iowaState = [
    log('01/08/2025 22:29:20', 'HIRED', 'foodcyntst'),
    log('10/09/2025 05:49:39', 'HIRED_INTERIM', 'Laser'),
    log('10/23/2025 21:34:11', 'FIRED', 'Laser'),
    log('10/23/2025 21:34:11', 'HIRED', 'foodcyntst'),
];

test('an interim sub does not reset the head coach who has held the job since the start', () => {
    const [current, sub] = buildTeamCoachHistory(iowaState, 'Iowa State', {});
    expect(current).toMatchObject({ coach: 'foodcyntst', startDate: '01/08/2025 22:29:20', endDate: null });
    expect(sub).toMatchObject({ coach: 'Laser', interim: true, endDate: '10/23/2025 21:34:11' });
});

test('hiring a new permanent head coach ends the previous one at that date', () => {
    const history = buildTeamCoachHistory(
        [log('01/01/2025', 'HIRED', 'first'), log('06/01/2025', 'HIRED', 'second')],
        'Iowa State',
        {}
    );
    expect(history.map((stint) => [stint.coach, stint.endDate])).toEqual([
        ['second', null],
        ['first', '06/01/2025'],
    ]);
});

test('a coach re-hired at the same team without being fired keeps the original start date', () => {
    const [stint] = buildCoachStints(iowaState.filter((entry) => entry.coach[0] === 'foodcyntst'));
    expect(stint).toMatchObject({ team: 'Iowa State', startDate: '01/08/2025 22:29:20', endDate: null });
});
