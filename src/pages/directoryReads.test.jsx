/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Teams from './team/Teams';
import Coaches from './user/Coaches';
import { getAllTeams } from '../api/teamApi';
import { getAllUsers } from '../api/userApi';

jest.mock('react-router-dom', () => {
    global.TextEncoder = require('util').TextEncoder;
    return jest.requireActual('react-router-dom');
});
jest.mock('../api/teamApi', () => ({ getAllTeams: jest.fn() }));
jest.mock('../api/userApi', () => ({ getAllUsers: jest.fn() }));
jest.mock('../hooks/useTeamsMap', () => ({ useTeamsMap: () => ({}) }));
jest.mock('../hooks/useConferencesMap', () => ({
    useConferencesMap: () => ({}),
    activeConferenceCodes: () => ['SEC'],
    conferenceLabel: (code) => code,
    formatConference: (code) => code || '-',
}));
jest.mock('../hooks/useSeo', () => ({ useSeo: () => {} }));
jest.mock('../context/ColorModeContext', () => ({ useColorMode: () => ({ mode: 'light' }) }));
jest.mock('../components/ui/TeamMark', () => ({ __esModule: true, default: () => null }));
const team = { id: 1, name: 'Alpha', active: true, conference: 'SEC', is_taken: false };
const coach = { id: 1, username: 'AlphaCoach', coach_name: 'Current coach', team: 'Alpha', position: 'HEAD_COACH' };
const pending = (api) => {
    let resolve;
    let reject;
    api.mockReturnValueOnce(
        new Promise((finish, fail) => {
            resolve = finish;
            reject = fail;
        })
    );
    return {
        resolve: (value) => act(async () => resolve(value)),
        reject: () => act(async () => reject(new Error('unavailable'))),
    };
};
const open = async (Page, strict = false) => {
    const page = (
        <MemoryRouter>
            <Page />
        </MemoryRouter>
    );
    let view;
    await act(async () => {
        view = render(strict ? <StrictMode>{page}</StrictMode> : page);
    });
    return view;
};
beforeEach(() => {
    jest.clearAllMocks();
    getAllTeams.mockResolvedValue([team]);
    getAllUsers.mockResolvedValue([coach]);
});
describe.each([
    ['Teams', Teams, getAllTeams, [team], 'Alpha', 'Failed to load teams. Please try again.'],
    ['Coaches', Coaches, getAllUsers, [coach], 'Current coach', 'Failed to load coaches. Please try again.'],
])('%s directory reads', (_name, Page, api, currentRows, label, failure) => {
    test('discarded successful lookups cannot replace current rows', async () => {
        const previous = pending(api);
        await open(Page, true);
        expect(screen.getByText(label)).toBeInTheDocument();
        await previous.resolve([]);
        expect(screen.getByText(label)).toBeInTheDocument();
    });
    test('discarded failed lookups cannot replace current results with an error', async () => {
        const previous = pending(api);
        await open(Page, true);
        await previous.reject();
        expect(screen.getByText(label)).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    test('discarded completion cannot stop the current loader', async () => {
        const previous = pending(api);
        const current = pending(api);
        await open(Page, true);
        await previous.resolve([]);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        await current.resolve(currentRows);
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.getByText(label)).toBeInTheDocument();
    });
    test('active failures retain the existing error display', async () => {
        api.mockRejectedValueOnce(new Error('unavailable'));
        await open(Page);
        expect(screen.getByRole('alert')).toHaveTextContent(failure);
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
});
test('team availability and fake/inactive exclusion remain unchanged', async () => {
    getAllTeams.mockResolvedValue([
        team,
        { ...team, id: 2, name: 'Beta', is_taken: true },
        { ...team, id: 3, name: 'Inactive', active: false },
        { ...team, id: 4, name: 'Placeholder', conference: 'FAKE_TEAM' },
    ]);
    await open(Teams);
    expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
    expect(screen.queryByText('Placeholder')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Availability' }), { target: { value: 'open' } });
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
});
test('coach status filtering retains the existing retired/free-agent distinctions', async () => {
    getAllUsers.mockResolvedValue([
        coach,
        { ...coach, id: 2, username: 'Retired', coach_name: 'Retired coach', position: 'RETIRED' },
        { ...coach, id: 3, username: 'Free', coach_name: 'Free coach', team: null },
    ]);
    await open(Coaches);
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: 'free_agent' } });
    expect(screen.getByText('Free coach')).toBeInTheDocument();
    expect(screen.queryByText('Retired coach')).not.toBeInTheDocument();
    expect(screen.queryByText('Current coach')).not.toBeInTheDocument();
});
