/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import Admin from './Admin';
import { getNewSignups, deleteNewSignup, hireFromSignup } from '../../api/newSignupsApi';
import { getAllTeams } from '../../api/teamApi';

jest.mock('react-router-dom', () => ({ Link: ({ children }) => <span>{children}</span> }));
jest.mock('../../api/newSignupsApi', () => ({
    getNewSignups: jest.fn(),
    deleteNewSignup: jest.fn(),
    hireFromSignup: jest.fn(),
}));
jest.mock('../../api/teamApi', () => ({ getAllTeams: jest.fn() }));
jest.mock('../../hooks/useTeamsMap', () => ({ useTeamsMap: () => ({}) }));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/ui/ConferenceMark', () => ({ __esModule: true, default: () => null }));

const signups = [
    { id: 1, username: 'alpha', coach_name: 'Alpha Coach' },
    { id: 2, username: 'beta', coach_name: 'Beta Coach' },
];
const teams = [{ name: 'Available Team', active: true, is_taken: false, conference: 'A', coach_names: [] }];

const deferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
};

beforeEach(() => {
    jest.clearAllMocks();
    getNewSignups.mockReset().mockResolvedValue(signups);
    getAllTeams.mockReset().mockResolvedValue(teams);
    deleteNewSignup.mockReset().mockResolvedValue(undefined);
    hireFromSignup.mockReset().mockResolvedValue(undefined);
});

test('discarded StrictMode success cannot replace current signups or team options', async () => {
    const olderSignups = deferred();
    const olderTeams = deferred();
    getNewSignups.mockReturnValueOnce(olderSignups.promise);
    getAllTeams.mockReturnValueOnce(olderTeams.promise);
    render(
        <StrictMode>
            <Admin />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => {
        olderSignups.resolve([{ id: 3, username: 'obsolete', coach_name: 'Obsolete Coach' }]);
        olderTeams.resolve([]);
    });
    expect(screen.getByText('@alpha')).toBeTruthy();
    expect(screen.getByText('Available Team')).toBeTruthy();
    expect(screen.queryByText('@obsolete')).toBeNull();
});

test('discarded StrictMode failure cannot publish an error', async () => {
    const older = deferred();
    getNewSignups.mockReturnValueOnce(older.promise);
    render(
        <StrictMode>
            <Admin />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => older.reject(new Error('Obsolete failure')));
    expect(screen.getByText('@alpha')).toBeTruthy();
    expect(screen.queryByText('Obsolete failure')).toBeNull();
});

test('discarded StrictMode completion cannot finish current loading', async () => {
    const older = deferred();
    const current = deferred();
    getNewSignups.mockReturnValueOnce(older.promise).mockReturnValueOnce(current.promise);
    render(
        <StrictMode>
            <Admin />
        </StrictMode>
    );
    await act(async () => older.resolve([]));
    expect(screen.getByText('Loading...')).toBeTruthy();
    await act(async () => current.resolve(signups));
    expect(screen.getByText('@alpha')).toBeTruthy();
});

test('current initial failure retains the existing error display', async () => {
    getNewSignups.mockRejectedValue(new Error('Signups unavailable'));
    render(<Admin />);
    await act(async () => {});
    expect(screen.getByRole('alert').textContent).toBe('Signups unavailable');
    expect(screen.queryByText('Loading...')).toBeNull();
});

test('an earlier clear completion cannot enable a later pending clear', async () => {
    const first = deferred();
    const second = deferred();
    deleteNewSignup.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    render(<Admin />);
    await act(async () => {});
    const firstRow = screen.getByText('@alpha').closest('tr');
    const secondRow = screen.getByText('@beta').closest('tr');
    fireEvent.click(within(firstRow).getByRole('button', { name: 'Clear' }));
    fireEvent.click(within(secondRow).getByRole('button', { name: 'Clear' }));
    await act(async () => first.resolve());
    expect(within(secondRow).getByRole('button', { name: 'Clearing...' }).disabled).toBe(true);
    await act(async () => second.resolve());
    expect(screen.queryByText('@alpha')).toBeNull();
    expect(screen.queryByText('@beta')).toBeNull();
    expect(deleteNewSignup.mock.calls).toEqual([[1], [2]]);
});

const openHire = async (username) => {
    fireEvent.click(within(screen.getByText(username).closest('tr')).getByRole('button', { name: '+ Hire' }));
    await act(async () => {});
};

const submitHire = async () => {
    fireEvent.mouseDown(screen.getAllByRole('combobox')[0]);
    fireEvent.click(await screen.findByRole('option', { name: 'Available Team (vacant)' }));
    fireEvent.mouseDown(screen.getAllByRole('combobox')[1]);
    fireEvent.click(await screen.findByRole('option', { name: 'Head Coach' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hire Coach' }));
};

test.each(['success', 'failure'])('a dismissed hire %s cannot affect a reopened dialog', async (outcome) => {
    const older = deferred();
    const current = deferred();
    hireFromSignup.mockReturnValueOnce(older.promise).mockReturnValueOnce(current.promise);
    render(<Admin user={{ username: 'administrator' }} />);
    await act(async () => {});
    await openHire('@alpha');
    await submitHire();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', keyCode: 27 });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await openHire('@beta');
    expect(screen.getByRole('button', { name: 'Hire Coach' }).disabled).toBe(false);
    await submitHire();
    await act(async () => {
        if (outcome === 'success') {
            older.resolve();
        } else {
            older.reject(new Error('Older hire failed'));
        }
    });
    expect(screen.getByRole('dialog').textContent).toContain('Beta Coach');
    expect(screen.getByRole('button', { name: 'Hire Coach' }).disabled).toBe(true);
    expect(screen.queryByText('Older hire failed')).toBeNull();
    expect(Boolean(screen.queryByText('@alpha'))).toBe(outcome === 'failure');
    await act(async () => current.resolve());
    expect(screen.queryByText('@beta')).toBeNull();
    expect(hireFromSignup.mock.calls).toEqual([
        [{ signupId: 1, team: 'Available Team', coachPosition: 'HEAD_COACH', processedBy: 'administrator' }],
        [{ signupId: 2, team: 'Available Team', coachPosition: 'HEAD_COACH', processedBy: 'administrator' }],
    ]);
});

test('current hire failure retains the signup and permits retry', async () => {
    hireFromSignup.mockRejectedValueOnce(new Error('Hire unavailable'));
    render(<Admin user={{ username: 'administrator' }} />);
    await act(async () => {});
    await openHire('@alpha');
    await submitHire();
    await act(async () => {});
    expect(screen.getByText('Hire unavailable')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hire Coach' }).disabled).toBe(false);
    expect(screen.getByText('@alpha')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Hire Coach' }));
    await act(async () => {});
    expect(screen.queryByText('@alpha')).toBeNull();
});
