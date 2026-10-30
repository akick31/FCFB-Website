/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import VenueField from './VenueField';
import { getStadiums } from '../../api/stadiumApi';
jest.mock('../../api/stadiumApi', () => ({ getStadiums: jest.fn() }));

const stadium = (name, teams = [], extra = {}) => ({
    name,
    teams,
    bowls: [],
    conferences: [],
    playoff_rounds: [],
    ...extra,
});

beforeEach(() =>
    getStadiums.mockResolvedValue([
        stadium('War Memorial Stadium', ['Wyoming'], { city: 'Laramie', state: 'WY', country: 'United States' }),
        stadium('Mercedes-Benz Stadium', [], { city: 'Atlanta', state: 'GA', country: 'United States' }),
    ])
);

const Host = () => {
    const [value, setValue] = React.useState('');
    return <VenueField value={value} onChange={setValue} />;
};

test('neutral sites and team stadiums are listed from the stadium registry', async () => {
    render(<Host />);
    await act(async () => {});
    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(screen.getByText('Neutral sites')).toBeTruthy();
    expect(screen.getByText('Team stadiums')).toBeTruthy();
    expect(screen.getByText('Neutral site')).toBeTruthy();
    expect(screen.getByText('Atlanta, GA')).toBeTruthy();
    expect(screen.getByText('Wyoming')).toBeTruthy();
    expect(screen.getByText('Laramie, WY')).toBeTruthy();
});

test('typing a name that is not in the registry says it will be created', async () => {
    render(<Host />);
    await act(async () => {});
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Aviva Stadium' } });
    expect(screen.getByText('New stadium: it will be added with the standard design.')).toBeTruthy();
});

test('a typed name close to an existing stadium suggests it', async () => {
    render(<Host />);
    await act(async () => {});
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Mercedes Benz Stadium, Atlanta' } });
    fireEvent.click(screen.getByRole('button', { name: 'Mercedes-Benz Stadium' }));
    expect(screen.getByRole('combobox').value).toBe('Mercedes-Benz Stadium');
});
