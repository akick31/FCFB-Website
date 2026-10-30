/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import RetireStadiumButton from './RetireStadiumButton';
import { getUpcomingStadiumGames, setStadiumActive } from '../../api/stadiumApi';
jest.mock('../ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../../api/stadiumApi', () => ({ getUpcomingStadiumGames: jest.fn(), setStadiumActive: jest.fn() }));

const stadium = { name: 'War Memorial Stadium', active: true };

beforeEach(() => setStadiumActive.mockResolvedValue({}));

test('retiring a stadium with upcoming games warns first and lists them', async () => {
    getUpcomingStadiumGames.mockResolvedValue([
        { season: 13, week: 2, home_team: 'Wyoming', away_team: 'Boise State' },
    ]);
    const onChanged = jest.fn();
    render(<RetireStadiumButton stadium={stadium} onChanged={onChanged} />);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Retire stadium' })));
    expect(screen.getByText('1 upcoming game is scheduled here:')).toBeTruthy();
    expect(screen.getByRole('listitem').textContent).toBe('Season 13, week 2: Boise State at Wyoming');
    expect(setStadiumActive).not.toHaveBeenCalled();

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Retire anyway' })));
    expect(setStadiumActive).toHaveBeenCalledWith('War Memorial Stadium', false);
    expect(onChanged).toHaveBeenCalled();
});

test('a stadium with nothing scheduled retires straight away', async () => {
    getUpcomingStadiumGames.mockResolvedValue([]);
    render(<RetireStadiumButton stadium={stadium} onChanged={() => {}} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Retire stadium' })));
    expect(setStadiumActive).toHaveBeenCalledWith('War Memorial Stadium', false);
});
