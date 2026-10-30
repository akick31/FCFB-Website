/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import StadiumDetails from './StadiumDetails';
jest.mock('../../api/stadiumApi', () => ({
    updateStadium: jest.fn(),
    getCountries: jest.fn(() => Promise.resolve(['United States', 'Canada'])),
}));
jest.mock('../ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));

const stadium = { name: 'Mosaic Stadium', city: 'Regina', state: 'SK', country: 'Canada', capacity: 33350 };

afterEach(() => localStorage.clear());

test('coaches can rename their stadium but not move it', () => {
    localStorage.setItem('role', 'USER');
    render(<StadiumDetails stadium={stadium} canEdit onSaved={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit details' }));
    expect(screen.getByLabelText('Name').disabled).toBe(false);
    expect(screen.getByLabelText('City').disabled).toBe(true);
    expect(screen.getByLabelText('State / Province').disabled).toBe(true);
    expect(screen.getByLabelText('Country').disabled).toBe(true);
});

test.each(['ADMIN', 'CONFERENCE_COMMISSIONER'])('%s can change the location', (role) => {
    localStorage.setItem('role', role);
    render(<StadiumDetails stadium={stadium} canEdit onSaved={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit details' }));
    expect(screen.getByLabelText('City').disabled).toBe(false);
    expect(screen.getByLabelText('State / Province').disabled).toBe(false);
    expect(screen.getByLabelText('Country').value).toBe('Canada');
    expect(screen.getByLabelText('Country').disabled).toBe(false);
});

test('details stay collapsed to a one-line summary until opened', () => {
    localStorage.setItem('role', 'USER');
    render(<StadiumDetails stadium={stadium} canEdit onSaved={() => {}} />);
    expect(screen.getByText('Regina, SK, Canada')).toBeTruthy();
    expect(screen.getByText('33,350 seats')).toBeTruthy();
    expect(screen.queryByLabelText('Name')).toBeNull();
});

test('the roof is set from the stadium details and saved with them', async () => {
    const { updateStadium } = jest.requireMock('../../api/stadiumApi');
    updateStadium.mockResolvedValue(stadium);
    render(<StadiumDetails stadium={{ ...stadium, design: { dome_style: 'FABRIC' } }} canEdit onSaved={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit details' }));
    expect(screen.getByLabelText('Roof').value).toBe('FABRIC');
    fireEvent.change(screen.getByLabelText('Roof'), { target: { value: 'SUITES' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }));
    await screen.findByText('Edit details');
    expect(updateStadium).toHaveBeenCalledWith('Mosaic Stadium', expect.objectContaining({ dome_style: 'SUITES' }));
});
