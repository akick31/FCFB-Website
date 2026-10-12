/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import AdminConferences from './AdminConferences';
import { getConferences, createConference, setConferenceActive } from '../../api/conferenceApi';
import { getAllTeams } from '../../api/teamApi';
import { refreshConferences } from '../../hooks/useConferencesMap';

jest.mock('react-router-dom', () => ({ Link: ({ children }) => <span>{children}</span> }));
jest.mock('../../api/conferenceApi', () => ({
    getConferences: jest.fn(),
    createConference: jest.fn(),
    setConferenceActive: jest.fn(),
}));
jest.mock('../../api/teamApi', () => ({ getAllTeams: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({ refreshConferences: jest.fn() }));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/ui/ConferenceMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/ui/DataTable', () => ({
    __esModule: true,
    default: ({ children }) => <table>{children}</table>,
}));
jest.mock('../../components/ui/Toggle', () => ({
    __esModule: true,
    default: ({ onClick }) => <button onClick={onClick}>Toggle</button>,
}));
jest.mock('../../components/ui/SelectPill', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/admin/LogoUrlField', () => ({ __esModule: true, default: () => null }));

const conferences = [
    { code: 'A', label: 'Alpha', active: true },
    { code: 'B', label: 'Beta', active: false },
];
beforeEach(() => {
    jest.clearAllMocks();
    getConferences.mockReset().mockResolvedValue(conferences);
    getAllTeams.mockReset().mockResolvedValue([]);
    setConferenceActive.mockReset().mockResolvedValue(undefined);
});

test('overlapping mutation reloads retain the newest read result', async () => {
    let resolveFirstToggle;
    let resolveSecondToggle;
    let resolveOlderLoad;
    setConferenceActive
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveFirstToggle = resolve;
            })
        )
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveSecondToggle = resolve;
            })
        );
    getConferences
        .mockResolvedValueOnce(conferences)
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOlderLoad = resolve;
            })
        )
        .mockResolvedValueOnce([{ code: 'B', label: 'Latest' }]);
    render(<AdminConferences />);
    await act(async () => {});
    const toggles = screen.getAllByText('Toggle');
    fireEvent.click(toggles[0]);
    fireEvent.click(toggles[1]);
    await act(async () => resolveFirstToggle());
    await act(async () => resolveSecondToggle());
    await act(async () => resolveOlderLoad([{ code: 'A', label: 'Obsolete' }]));
    expect(screen.getByText('Latest')).toBeTruthy();
    expect(screen.queryByText('Obsolete')).toBeNull();
    expect(setConferenceActive.mock.calls).toEqual([
        ['A', false],
        ['B', true],
    ]);
    expect(refreshConferences).toHaveBeenCalledTimes(2);
});

test('StrictMode obsolete failure cannot override successful data', async () => {
    let rejectOld;
    getConferences.mockReturnValueOnce(
        new Promise((resolve, reject) => {
            rejectOld = reject;
        })
    );
    render(
        <StrictMode>
            <AdminConferences />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => rejectOld(new Error('old failure')));
    expect(screen.getByText('Alpha')).toBeTruthy();
    expect(screen.queryByText('Failed to load conferences')).toBeNull();
});

test('a mutation completed after unmount refreshes the shared cache without reloading the page', async () => {
    let resolveToggle;
    setConferenceActive.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveToggle = resolve;
        })
    );
    const { unmount } = render(<AdminConferences />);
    await act(async () => {});
    fireEvent.click(screen.getAllByText('Toggle')[0]);
    unmount();
    await act(async () => resolveToggle());
    expect(refreshConferences).toHaveBeenCalledTimes(1);
    expect(getConferences).toHaveBeenCalledTimes(1);
});

test('creating a conference preserves normalized arguments, feedback, and reload behavior', async () => {
    createConference.mockResolvedValueOnce(undefined);
    render(<AdminConferences />);
    await act(async () => {});
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: ' new code ' } });
    fireEvent.change(inputs[1], { target: { value: ' New Conference ' } });
    await act(async () => fireEvent.submit(inputs[0].closest('form')));
    expect(createConference).toHaveBeenCalledWith({
        code: 'NEW_CODE',
        label: 'New Conference',
        logoUrl: null,
        logoUrlDark: null,
    });
    expect(screen.getByText('Conference created')).toBeTruthy();
    expect(getConferences).toHaveBeenCalledTimes(2);
    expect(refreshConferences).toHaveBeenCalledTimes(1);
});
