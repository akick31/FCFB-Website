/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import TeamManagement from './TeamManagement';
import { getAllTeamsIncludingInactive, updateTeam } from '../../api/teamApi';
import { getAllUsers } from '../../api/userApi';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';

let mockConferences;
jest.mock('../../api/teamApi', () => ({
    getAllTeamsIncludingInactive: jest.fn(),
    updateTeam: jest.fn(),
    hireCoach: jest.fn(),
    hireInterimCoach: jest.fn(),
    fireSingleCoach: jest.fn(),
}));
jest.mock('../../api/userApi', () => ({ getAllUsers: jest.fn() }));
jest.mock('../../api/coachTransactionLogApi', () => ({ getEntireCoachTransactionLog: jest.fn() }));
jest.mock('../../hooks/useTeamsMap', () => ({ useTeamsMap: () => ({}) }));
jest.mock('../../hooks/useConferencesMap', () => ({
    useConferencesMap: () => mockConferences,
    allConferenceList: () => Object.values(mockConferences),
}));
jest.mock('../../utils/coachHistory', () => ({ currentRosterByTeam: () => ({}) }));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ controls, children }) => (
        <div>
            {controls}
            {children}
        </div>
    ),
}));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/ui/SelectPill', () => ({
    __esModule: true,
    default: ({ label, options }) => (
        <select aria-label={label}>
            {options.map((option) => (
                <option key={option.value}>{option.label}</option>
            ))}
        </select>
    ),
}));
jest.mock('../../components/teamManagement/TeamsTable', () => ({
    __esModule: true,
    default: ({ teams, effectiveActive, onToggleActive }) => (
        <div>
            {teams.map((team) => (
                <button key={team.name} onClick={() => onToggleActive(team)}>
                    {team.name}: {String(effectiveActive(team))}
                </button>
            ))}
        </div>
    ),
}));
jest.mock('../../components/forms/CreateTeamForm', () => ({
    __esModule: true,
    default: ({ onTeamCreated }) => <button onClick={onTeamCreated}>Refresh teams</button>,
}));
jest.mock('../../components/teamManagement/HireCoachDialog', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/teamManagement/FirePickerDialog', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/teamManagement/FireConfirmDialog', () => ({ __esModule: true, default: () => null }));

const alpha = { name: 'Alpha', active: false, conference: 'A' };
beforeEach(() => {
    jest.resetAllMocks();
    mockConferences = {};
    getAllTeamsIncludingInactive.mockResolvedValue([alpha]);
    getAllUsers.mockResolvedValue([]);
    getEntireCoachTransactionLog.mockResolvedValue([]);
    updateTeam.mockResolvedValue(undefined);
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());
const page = <TeamManagement user={{ username: 'Admin' }} />;

test('conference options follow the cache after a cold mount', async () => {
    const { rerender } = render(page);
    await act(async () => {});
    expect(screen.queryByRole('option', { name: 'Conference A' })).toBeNull();
    mockConferences = { A: { code: 'A', label: 'Conference A' } };
    rerender(<TeamManagement user={{ username: 'Admin' }} />);
    expect(screen.getByRole('option', { name: 'Conference A' })).toBeTruthy();
});

test('StrictMode obsolete read cannot replace current teams', async () => {
    let resolveOld;
    getAllTeamsIncludingInactive.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    render(<StrictMode>{page}</StrictMode>);
    await act(async () => {});
    await act(async () => resolveOld([{ ...alpha, name: 'Obsolete' }]));
    expect(screen.getByText('Alpha: false')).toBeTruthy();
    expect(screen.queryByText('Obsolete: false')).toBeNull();
});

test('overlapping reloads retain the newest teams and ignore older failure feedback', async () => {
    let rejectOlder;
    getAllTeamsIncludingInactive
        .mockResolvedValueOnce([alpha])
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOlder = reject;
            })
        )
        .mockResolvedValueOnce([{ ...alpha, name: 'Latest' }]);
    render(page);
    await act(async () => {});
    fireEvent.click(screen.getByText('Refresh teams'));
    await act(async () => fireEvent.click(screen.getByText('Refresh teams')));
    await act(async () => rejectOlder(new Error('Old read failed')));
    expect(screen.getByText('Latest: false')).toBeTruthy();
    expect(screen.queryByText('Failed to load data')).toBeNull();
    expect(console.error).not.toHaveBeenCalled();
});

test('a successful refresh recovers from load failure using credential-safe diagnostics', async () => {
    getAllTeamsIncludingInactive.mockRejectedValueOnce({ message: 'sensitive transport detail' });
    render(page);
    await act(async () => {});
    expect(screen.getByText('Failed to load data')).toBeTruthy();
    expect(console.error.mock.calls).toEqual([['Failed to load team management data']]);
    await act(async () => fireEvent.click(screen.getByText('Refresh teams')));
    expect(screen.getByText('Alpha: false')).toBeTruthy();
    expect(screen.queryByText('Failed to load data')).toBeNull();
});

test('a reverted pending status remains visible and can be saved after the page refresh', async () => {
    let resolveWrite;
    updateTeam.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveWrite = resolve;
        })
    );
    getAllTeamsIncludingInactive
        .mockResolvedValueOnce([alpha])
        .mockResolvedValueOnce([{ ...alpha, active: true }])
        .mockResolvedValueOnce([alpha]);
    render(page);
    await act(async () => {});
    fireEvent.click(screen.getByText('Alpha: false'));
    fireEvent.click(screen.getByText('Save status changes (1)'));
    fireEvent.click(screen.getByText('Alpha: true'));
    await act(async () => resolveWrite());
    expect(screen.getByText('Alpha: false')).toBeTruthy();
    expect(screen.getByText('Save status changes (1)').disabled).toBe(false);
    await act(async () => fireEvent.click(screen.getByText('Save status changes (1)')));
    expect(updateTeam.mock.calls).toEqual([[{ ...alpha, active: true }], [{ ...alpha, active: false }]]);
    expect(screen.getByText('Save status changes').disabled).toBe(true);
});
