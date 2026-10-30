/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WeekReviewPanel from './WeekReviewPanel';

jest.mock('react-router-dom', () => {
    global.TextEncoder = require('util').TextEncoder;
    return jest.requireActual('react-router-dom');
});
jest.mock('../home/TeamAbbr', () => ({
    __esModule: true,
    default: ({ name, prefix = '', suffix = '' }) => <span>{`${prefix}${name}${suffix}`}</span>,
}));

const games = [
    { game_id: 1, home_team: 'Duke', away_team: 'Florida State', home_score: 24, away_score: 21, away_rank: 3 },
    { game_id: 2, home_team: 'Iowa', away_team: 'Ohio', home_score: 56, away_score: 0 },
];
const week = {
    games,
    highlights: {
        upsets: [{ game_id: 1, winner: 'Duke', loser: 'Florida State', loser_rank: 3, points: 14 }],
        ranked_losses: [{ game_id: 1, team: 'Florida State', rank: 3, opponent: 'Duke' }],
        biggest_spread: { game_id: 2, favorite: 'Iowa', underdog: 'Ohio', points: 21.5, favorite_won: true },
        closest_game_id: 1,
        biggest_blowout_game_id: 2,
        highest_scoring_game_id: 2,
        fastest_game: { game_id: 2, minutes: 95 },
        overtime_game_ids: [],
        biggest_swing: { play_id: 9, team: 'Duke', swing: 0.62 },
    },
};

const renderPanel = () =>
    render(
        <MemoryRouter>
            <WeekReviewPanel week={week} />
        </MemoryRouter>
    );

test('the review links each highlight to its game or play', () => {
    renderPanel();
    expect(screen.getAllByText('#3 Florida State')[0].closest('a').getAttribute('href')).toBe('/game-details/1');
    expect(screen.getByText('(+14)')).toBeTruthy();
    expect(screen.getByText('24-21').closest('a').getAttribute('href')).toBe('/game-details/1');
    expect(screen.getByText('62% for').closest('a').getAttribute('href')).toBe('/play-details/9');
    expect(screen.getByText('Iowa -21.5').closest('a').getAttribute('href')).toBe('/game-details/2');
    expect(screen.getByText('1h 35m:')).toBeTruthy();
    expect(screen.getAllByText('None').length).toBe(1);
});

test('ranked losses open as a list with the final score', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: '1 team' }));
    expect(screen.getByRole('heading', { name: 'Ranked teams that lost' })).toBeTruthy();
    expect(screen.getByText('Duke, 24-21').closest('a').getAttribute('href')).toBe('/game-details/1');
});
