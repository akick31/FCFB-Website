/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import StadiumPicker, { BUILD_NEW } from './StadiumPicker';
import { getStadiums } from '../../api/stadiumApi';
import { openStadiumPicker, pickStadium, stadiumOptionNames } from '../../testUtils/pickStadium';
import { stadiumFixture } from '../../testUtils/stadiumFixture';
jest.mock('../../api/stadiumApi', () => ({ getStadiums: jest.fn() }));

beforeEach(() =>
    getStadiums.mockResolvedValue([
        stadiumFixture('War Memorial Stadium', ['Wyoming'], { city: 'Laramie', state: 'WY', country: 'United States' }),
        stadiumFixture('Mercedes-Benz Stadium', [], { city: 'Atlanta', state: 'GA', country: 'United States' }),
    ])
);

test('options show each stadium’s home team or that it is a neutral site, with its location', async () => {
    render(<StadiumPicker value="" onChange={() => {}} allowNone />);
    await act(async () => {});
    openStadiumPicker('Stadium');
    expect(screen.getByText('Wyoming')).toBeTruthy();
    expect(screen.getByText('Laramie, WY')).toBeTruthy();
    expect(screen.getByText('Neutral site')).toBeTruthy();
    expect(screen.getByText('Atlanta, GA')).toBeTruthy();
    expect(screen.getByText('Neutral sites')).toBeTruthy();
    expect(screen.getByText('Team stadiums')).toBeTruthy();
});

test('searching finds a stadium by its home team or city', async () => {
    render(<StadiumPicker value="" onChange={() => {}} allowNone />);
    await act(async () => {});
    const input = screen.getByLabelText('Stadium');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'wyoming' } });
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
        expect.stringMatching(/^War Memorial Stadium/),
    ]);
    fireEvent.change(input, { target: { value: 'atlanta' } });
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
        expect.stringMatching(/^Mercedes-Benz Stadium/),
    ]);
});

test('a retired current pick stays visible and building a new stadium can be chosen', async () => {
    const onChange = jest.fn();
    render(<StadiumPicker value="Old Field" onChange={onChange} allowBuild />);
    await act(async () => {});
    expect(stadiumOptionNames('Stadium')[0]).toBe('Build a new stadium…');
    expect(stadiumOptionNames('Stadium')).toEqual(expect.arrayContaining([expect.stringMatching(/^Old Field/)]));
    await pickStadium('Stadium', 'Build a new stadium…');
    expect(onChange).toHaveBeenCalledWith(BUILD_NEW);
});
