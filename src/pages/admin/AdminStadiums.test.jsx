/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import AdminStadiums from './AdminStadiums';
import { getStadium, getStadiums } from '../../api/stadiumApi';
jest.mock('react-router-dom', () => {
    const { useState } = jest.requireActual('react');
    return {
        useNavigate: () => jest.fn(),
        useSearchParams: () => {
            const [params, setParams] = useState(new URLSearchParams());
            return [params, (next) => setParams(new URLSearchParams(next))];
        },
    };
});
jest.mock('../../api/stadiumApi', () => ({
    getStadiums: jest.fn(),
    getStadium: jest.fn(),
    renderStadiumPreview: jest.fn(() => new Promise(() => {})),
    setStadiumActive: jest.fn(),
    createStadium: jest.fn(),
    updateStadium: jest.fn(),
    getCountries: jest.fn(() => Promise.resolve(['United States'])),
}));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../api/teamAppearanceApi', () => ({}));
jest.mock('../../api/apiClient', () => ({}));
jest.mock('../../utils/logoUrl', () => ({ resolveLogoUrl: (logo) => logo }));
jest.mock('../../api/teamApi', () => ({
    getAllTeams: jest.fn(() =>
        Promise.resolve([{ name: 'Wyoming', logo: 'wyo-light.png', logo_dark: 'wyo-dark.png' }])
    ),
    getTeamByName: jest.fn(() => Promise.resolve({})),
}));
jest.mock('../../context/ColorModeContext', () => ({ useColorMode: () => ({ mode: 'dark' }) }));
jest.mock('../../components/team/appearance/FontControl', () => ({ __esModule: true, default: () => null }));

const stadium = {
    name: 'War Memorial Stadium',
    city: 'Laramie',
    state: 'WY',
    capacity: null,
    active: true,
    design: { stadium_backdrop: 'CROWD' },
    teams: ['Wyoming'],
    country: 'United States',
    bowls: [],
    conferences: ['Mountain West'],
    playoff_rounds: [],
};

test('stadium rows show dark-mode team logos and open into the editor', async () => {
    getStadiums.mockResolvedValue([stadium]);
    getStadium.mockResolvedValue(stadium);
    const { baseElement } = render(<AdminStadiums />);
    await act(async () => {});
    expect(baseElement.querySelector('img[src="wyo-dark.png"]')).toBeTruthy();
    fireEvent.click(screen.getAllByText('War Memorial Stadium').pop());
    await act(async () => {});
    expect(screen.getByRole('button', { name: 'Edit details' })).toBeTruthy();
});
