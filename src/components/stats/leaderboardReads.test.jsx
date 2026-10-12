/** @jest-environment jsdom */
import React from 'react';
import { renderToString } from 'react-dom/server.node';
import { fireEvent, render, screen } from '@testing-library/react';
import StatLeaderboardCard from './StatLeaderboardCard';
import StatLeaderboardDetail from './StatLeaderboardDetail';
import { ensureTeam } from '../../hooks/useTeamsMap';

jest.mock('../../hooks/useTeamsMap', () => ({ useTeamsMap: () => ({}), ensureTeam: jest.fn() }));
jest.mock('react-router-dom', () => ({ Link: ({ children, to }) => <a href={to}>{children}</a> }));
jest.mock('../ui/Panel', () => ({
    __esModule: true,
    default: ({ children, header, more }) => (
        <section>
            {header}
            {more}
            {children}
        </section>
    ),
}));
jest.mock('../ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../ui/ConferenceMark', () => ({ __esModule: true, default: () => null }));

beforeEach(() => jest.clearAllMocks());

const rows = [
    { team: 'First', score: 3 },
    { team: 'Second', score: 2 },
    { team: 'Third', score: 1 },
];
const cardProps = { title: 'Scores', statKey: 'score', rows, count: 1, format: String, to: '/scores' };
const detailRows = Array.from({ length: 30 }, (_, index) => ({ team: `Team ${index + 1}`, score: index + 1 }));
const detailProps = { stat: { label: 'Scores', key: 'score' }, rows: detailRows, onBack: jest.fn() };

test('server-rendered leaderboard cards do not start team requests', () => {
    renderToString(<StatLeaderboardCard {...cardProps} />);
    expect(ensureTeam).not.toHaveBeenCalled();
});

test('card lookup effects follow visible rows and retain normal/worst ordering', () => {
    const { rerender } = render(<StatLeaderboardCard {...cardProps} />);
    expect(ensureTeam).toHaveBeenCalledTimes(1);
    expect(ensureTeam).toHaveBeenLastCalledWith('First');
    expect(screen.getByText('First')).toBeTruthy();
    rerender(<StatLeaderboardCard {...cardProps} />);
    expect(ensureTeam).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: '▼ Best first' }));
    expect(ensureTeam).toHaveBeenCalledTimes(2);
    expect(ensureTeam).toHaveBeenLastCalledWith('Third');
    expect(screen.getByText('Third')).toBeTruthy();
    expect(screen.queryByText('First')).toBeNull();
});

test('server-rendered detailed leaderboards do not start team requests', () => {
    renderToString(<StatLeaderboardDetail {...detailProps} />);
    expect(ensureTeam).not.toHaveBeenCalled();
});

test('detailed leaderboard requests only its visible page and updates after filtering', () => {
    const { rerender } = render(<StatLeaderboardDetail {...detailProps} />);
    expect(ensureTeam).toHaveBeenCalledTimes(25);
    expect(ensureTeam).toHaveBeenLastCalledWith('Team 25');
    expect(ensureTeam).not.toHaveBeenCalledWith('Team 30');
    rerender(<StatLeaderboardDetail {...detailProps} />);
    expect(ensureTeam).toHaveBeenCalledTimes(25);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search a team' }), { target: { value: 'Team 30' } });
    expect(ensureTeam).toHaveBeenCalledTimes(26);
    expect(ensureTeam).toHaveBeenLastCalledWith('Team 30');
    expect(screen.getByText('Team 30')).toBeTruthy();
    expect(screen.queryByText('Team 1')).toBeNull();
});
