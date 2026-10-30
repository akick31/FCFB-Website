/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminConferences from './AdminConferences';
import { getConferences, setConferenceActive } from '../../api/conferenceApi';
import { getAllTeams } from '../../api/teamApi';
import { refreshConferences } from '../../hooks/useConferencesMap';

jest.mock('react-router-dom', () => {
    global.TextEncoder = require('util').TextEncoder;
    return jest.requireActual('react-router-dom');
});
jest.mock('../../api/conferenceApi', () => ({
    getConferences: jest.fn(),
    setConferenceActive: jest.fn(),
}));
jest.mock('../../api/teamApi', () => ({ getAllTeams: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({ refreshConferences: jest.fn() }));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/Panel', () => ({
    __esModule: true,
    default: ({ more, children }) => (
        <div>
            {more}
            {children}
        </div>
    ),
}));
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
jest.mock('../../components/admin/ConferenceEditDialog', () => ({
    __esModule: true,
    default: ({ code, onClose }) => (
        <div>
            <span>Editing {code}</span>
            <button onClick={onClose}>Close editor</button>
        </div>
    ),
}));
jest.mock('../../components/admin/ConferenceCreateDialog', () => ({
    __esModule: true,
    default: ({ open, onCreated }) => open && <button onClick={onCreated}>Finish create</button>,
}));

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
    render(<AdminConferences />, { wrapper: MemoryRouter });
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
            <MemoryRouter>
                <AdminConferences />
            </MemoryRouter>
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
    const { unmount } = render(<AdminConferences />, { wrapper: MemoryRouter });
    await act(async () => {});
    fireEvent.click(screen.getAllByText('Toggle')[0]);
    unmount();
    await act(async () => resolveToggle());
    expect(refreshConferences).toHaveBeenCalledTimes(1);
    expect(getConferences).toHaveBeenCalledTimes(1);
});

test('creating a conference shows feedback and reloads the list', async () => {
    render(<AdminConferences />, { wrapper: MemoryRouter });
    await act(async () => {});
    fireEvent.click(screen.getByText('Add conference'));
    await act(async () => fireEvent.click(screen.getByText('Finish create')));
    expect(screen.getByText('Conference created')).toBeTruthy();
    expect(screen.queryByText('Finish create')).toBeNull();
    expect(getConferences).toHaveBeenCalledTimes(2);
});

test('edit opens the conference in a dialog and closing it reloads the list', async () => {
    render(<AdminConferences />, { wrapper: MemoryRouter });
    await act(async () => {});
    fireEvent.click(screen.getAllByText('Edit')[1]);
    expect(screen.getByText('Editing B')).toBeTruthy();
    await act(async () => fireEvent.click(screen.getByText('Close editor')));
    expect(screen.queryByText('Editing B')).toBeNull();
    expect(getConferences).toHaveBeenCalledTimes(2);
});

test('an edit link opens that conference directly', async () => {
    render(
        <MemoryRouter initialEntries={['/admin/conferences?edit=A']}>
            <AdminConferences />
        </MemoryRouter>
    );
    await act(async () => {});
    expect(screen.getByText('Editing A')).toBeTruthy();
});
