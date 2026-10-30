/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import CompactGameTile from './CompactGameTile';

jest.mock('react-router-dom', () => ({
    Link: ({ to, children, ...rest }) => (
        <a href={to} className={rest.className}>
            {children}
        </a>
    ),
}));
jest.mock('../../ui/TeamMark', () => ({ __esModule: true, default: () => null }));

const game = {
    game_id: 9,
    home_team: 'Wyoming',
    away_team: 'Boise State',
    home_score: 21,
    away_score: 14,
    home_team_rank: 12,
    away_team_rank: 0,
    quarter: 3,
    clock: '4:12',
    possession: 'HOME',
};

test('a live game shows the quarter, clock, ranks and who has the ball', () => {
    render(<CompactGameTile game={{ ...game, game_status: 'IN_PROGRESS' }} />);
    expect(screen.getByText('3rd 4:12')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByLabelText('Has the ball')).toBeTruthy();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/game-details/9');
});

test('a finished game shows Final and no possession marker', () => {
    render(<CompactGameTile game={{ ...game, game_status: 'FINAL' }} />);
    expect(screen.getByText('Final')).toBeTruthy();
    expect(screen.queryByLabelText('Has the ball')).toBeNull();
});
