/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import TeamMark from './TeamMark';
import { getTeamByName } from '../../api/teamApi';
jest.mock('../../api/teamApi', () => ({
    getAllTeams: jest.fn(() => Promise.resolve([{ name: 'Bulk U', logo: 'bulk.png' }])),
    getTeamByName: jest.fn(),
}));
jest.mock('../../context/ColorModeContext', () => ({ useColorMode: () => ({ mode: 'dark' }) }));

test('a missing dark logo falls back to the light one in dark mode', () => {
    render(<TeamMark team={{ name: 'Big Horn', logo: 'light.png', logoDark: 'missing-dark.png' }} />);
    const image = screen.getByAltText('Big Horn');
    expect(image.getAttribute('src')).toBe('missing-dark.png');
    fireEvent.error(image);
    expect(screen.getByAltText('Big Horn').getAttribute('src')).toBe('light.png');
});

test('a team passed without logos, such as an inactive team, is looked up instead of showing a placeholder', async () => {
    getTeamByName.mockResolvedValue({ name: 'Old State', logo: 'old.png' });
    render(<TeamMark team={{ name: 'Old State' }} />);
    await act(async () => {});
    expect(getTeamByName).toHaveBeenCalledWith('Old State');
    expect(screen.getByAltText('Old State').getAttribute('src')).toBe('old.png');
});

test('teams in the bulk list are not looked up one by one', async () => {
    getTeamByName.mockClear();
    render(<TeamMark team={{ name: 'Bulk U' }} />);
    await act(async () => {});
    expect(getTeamByName).not.toHaveBeenCalledWith('Bulk U');
    expect(screen.getByAltText('Bulk U').getAttribute('src')).toBe('bulk.png');
});

test('a team that cannot be found shows its first letter, not a question mark', async () => {
    getTeamByName.mockResolvedValue({});
    render(<TeamMark team={{ name: 'Nowhere Tech' }} />);
    await act(async () => {});
    expect(screen.getByText('N')).toBeTruthy();
    expect(screen.queryByText('?')).toBeNull();
});
