/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import EditCoach from './EditCoach';
import { getAllUsers, updateUser } from '../../api/userApi';
import { getAllTeams, hireCoach, fireSingleCoach } from '../../api/teamApi';

let mockUsername;
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useParams: () => ({ username: mockUsername }),
    useNavigate: () => mockNavigate,
}));
jest.mock('../../api/userApi', () => ({ getAllUsers: jest.fn(), updateUser: jest.fn() }));
jest.mock('../../api/teamApi', () => ({ getAllTeams: jest.fn(), hireCoach: jest.fn(), fireSingleCoach: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({ conferenceLabel: (code) => code }));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ title, children }) => (
        <div>
            <h1>{title}</h1>
            {children}
        </div>
    ),
}));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
const alpha = {
    username: 'Alpha',
    coach_name: 'Coach A',
    team: 'A',
    position: 'HEAD_COACH',
    role: 'USER',
    discord_id: 'coach-id',
};
const beta = { ...alpha, username: 'Beta', coach_name: 'Coach B' };
const page = <EditCoach user={{ username: 'Admin' }} />;
beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
    mockUsername = 'Alpha';
    getAllUsers.mockResolvedValue([alpha, beta]);
    getAllTeams.mockResolvedValue([
        { name: 'A', active: true },
        { name: 'B', active: true },
    ]);
    updateUser.mockResolvedValue(undefined);
    hireCoach.mockResolvedValue(undefined);
    fireSingleCoach.mockResolvedValue(undefined);
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
});
const switchToBeta = async (rerender) => {
    mockUsername = 'Beta';
    await act(async () => rerender(<EditCoach user={{ username: 'Admin' }} />));
};

test('an obsolete coach read cannot populate a new route', async () => {
    let resolveOld;
    getAllUsers.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    const { rerender } = render(page);
    await switchToBeta(rerender);
    await act(async () => resolveOld([{ ...beta, coach_name: 'Obsolete' }]));
    expect(screen.getByLabelText('Coach name').value).toBe('Coach B');
});

test('an obsolete failure cannot end loading for the new coach', async () => {
    let rejectOld;
    getAllUsers
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(page);
    await switchToBeta(rerender);
    await act(async () => rejectOld(new Error('Old failure')));
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(console.error).not.toHaveBeenCalled();
});

test('a failed coach read can recover on the next route with fixed diagnostics', async () => {
    getAllUsers.mockRejectedValueOnce({ message: 'sensitive transport detail' });
    const { rerender } = render(page);
    await act(async () => {});
    expect(screen.getByText('Failed to load coach')).toBeTruthy();
    expect(console.error.mock.calls).toEqual([['Failed to load coach']]);
    await switchToBeta(rerender);
    expect(screen.queryByText('Failed to load coach')).toBeNull();
    expect(screen.getByLabelText('Coach name').value).toBe('Coach B');
});

test('a previous save failure cannot affect the new coach editor', async () => {
    let rejectSave;
    updateUser.mockReturnValueOnce(
        new Promise((resolve, reject) => {
            rejectSave = reject;
        })
    );
    const { rerender } = render(page);
    await act(async () => {});
    fireEvent.click(screen.getByText('Save changes'));
    await switchToBeta(rerender);
    await act(async () => rejectSave(new Error('Old save failed')));
    expect(screen.queryByText('Old save failed')).toBeNull();
    expect(screen.getByText('Save changes').disabled).toBe(false);
});

test('an authorized coach move completes its original write sequence after route change', async () => {
    let resolveHire;
    hireCoach.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveHire = resolve;
        })
    );
    const { rerender } = render(page);
    await act(async () => {});
    fireEvent.change(screen.getByLabelText('Team'), { target: { value: 'B' } });
    fireEvent.click(screen.getByText('Save changes'));
    expect(updateUser).not.toHaveBeenCalled();
    await switchToBeta(rerender);
    await act(async () => resolveHire());
    expect(hireCoach).toHaveBeenCalledWith({
        team: 'B',
        discordId: 'coach-id',
        coachPosition: 'HEAD_COACH',
        processedBy: 'Admin',
    });
    expect(updateUser).toHaveBeenCalledWith({ ...alpha, team: 'B' });
    expect(screen.queryByText('Coach updated successfully. Redirecting...')).toBeNull();
    act(() => jest.advanceTimersByTime(1500));
    expect(mockNavigate).not.toHaveBeenCalled();
});

test('removing the coach from a team preserves fire-before-user-update behavior', async () => {
    render(page);
    await act(async () => {});
    fireEvent.change(screen.getByLabelText('Team'), { target: { value: '' } });
    await act(async () => fireEvent.click(screen.getByText('Save changes')));
    expect(fireSingleCoach).toHaveBeenCalledWith({
        team: 'A',
        discordId: 'coach-id',
        coachPosition: 'HEAD_COACH',
        processedBy: 'Admin',
    });
    expect(updateUser).toHaveBeenCalledWith({ ...alpha, team: null });
    expect(fireSingleCoach.mock.invocationCallOrder[0]).toBeLessThan(updateUser.mock.invocationCallOrder[0]);
});

test.each(['route change', 'unmount'])('a completed coach-save redirect is canceled on %s', async (transition) => {
    const { rerender, unmount } = render(page);
    await act(async () => {});
    await act(async () => fireEvent.click(screen.getByText('Save changes')));
    if (transition === 'unmount') {
        unmount();
    } else {
        await switchToBeta(rerender);
    }
    act(() => jest.advanceTimersByTime(1500));
    expect(mockNavigate).not.toHaveBeenCalled();
});

test('a current coach save preserves the payload and 1500ms redirect', async () => {
    render(page);
    await act(async () => {});
    fireEvent.change(screen.getByLabelText('Coach name'), { target: { value: 'Updated' } });
    await act(async () => fireEvent.click(screen.getByText('Save changes')));
    expect(updateUser).toHaveBeenCalledWith({ ...alpha, coach_name: 'Updated' });
    expect(hireCoach).not.toHaveBeenCalled();
    expect(fireSingleCoach).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1499));
    expect(mockNavigate).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/team-management');
});

test('StrictMode cleanup invalidates the first coach read', async () => {
    let resolveOld;
    getAllUsers.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    render(<StrictMode>{page}</StrictMode>);
    await act(async () => {});
    await act(async () => resolveOld([{ ...alpha, coach_name: 'Obsolete' }]));
    expect(screen.getByLabelText('Coach name').value).toBe('Coach A');
});

test('missing Discord IDs still block a team change before any mutation', async () => {
    getAllUsers.mockResolvedValueOnce([{ ...alpha, discord_id: null }]);
    render(page);
    await act(async () => {});
    fireEvent.change(screen.getByLabelText('Team'), { target: { value: 'B' } });
    await act(async () => fireEvent.click(screen.getByText('Save changes')));
    expect(screen.getByText(/Cannot change team: this coach has no Discord ID/)).toBeTruthy();
    expect(hireCoach).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
});
