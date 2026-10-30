/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import TeamEditDialog from './TeamEditDialog';
import { getTeamById, updateTeam } from '../../api/teamApi';

let mockTeamId;
const onSaved = jest.fn();
const EditTeam = () => <TeamEditDialog teamId={mockTeamId} onClose={() => {}} onSaved={onSaved} />;
jest.mock('../../api/teamApi', () => ({ getTeamById: jest.fn(), updateTeam: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({ useConferencesMap: () => ({}), allConferenceList: () => [] }));
jest.mock('../stadium/StadiumPicker', () => ({ __esModule: true, default: () => null }));
jest.mock('./LogoUrlField', () => ({ __esModule: true, default: () => null }));
jest.mock('../ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
const alpha = { name: 'Alpha', active: true, conference: 'A' };
const beta = { ...alpha, name: 'Beta' };
beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
    mockTeamId = 'A';
    getTeamById.mockImplementation(async (id) => (id === 'A' ? alpha : beta));
    updateTeam.mockResolvedValue(undefined);
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
});

test('route changes hide the prior form and ignore its late result', async () => {
    let resolveOld;
    let resolveCurrent;
    getTeamById
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveCurrent = resolve;
            })
        );
    const { rerender } = render(<EditTeam />);
    mockTeamId = 'B';
    rerender(<EditTeam />);
    await act(async () => resolveOld(alpha));
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.queryByLabelText('Team name')).toBeNull();
    await act(async () => resolveCurrent(beta));
    expect(screen.getByLabelText('Team name').value).toBe('Beta');
});

test('a late save cannot report completion from a different editor', async () => {
    let resolveSave;
    updateTeam.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveSave = resolve;
        })
    );
    const { rerender } = render(<EditTeam />);
    await act(async () => {});
    fireEvent.click(screen.getByText('Save changes'));
    mockTeamId = 'B';
    await act(async () => rerender(<EditTeam />));
    await act(async () => resolveSave());
    expect(screen.getByLabelText('Team name').value).toBe('Beta');
    expect(onSaved).not.toHaveBeenCalled();
    expect(updateTeam).toHaveBeenCalledWith(alpha);
    expect(screen.getByText('Save changes').disabled).toBe(false);
});

test('current save retains edited payload and reports the save', async () => {
    render(<EditTeam />);
    await act(async () => {});
    fireEvent.change(screen.getByLabelText('Team name'), { target: { value: 'Updated' } });
    await act(async () => fireEvent.click(screen.getByText('Save changes')));
    expect(updateTeam).toHaveBeenCalledWith({ ...alpha, name: 'Updated' });
    expect(onSaved).toHaveBeenCalledTimes(1);
});

test('an obsolete failure cannot affect the current form or log transport details', async () => {
    let rejectOld;
    getTeamById.mockReturnValueOnce(
        new Promise((resolve, reject) => {
            rejectOld = reject;
        })
    );
    const { rerender } = render(<EditTeam />);
    mockTeamId = 'B';
    await act(async () => rerender(<EditTeam />));
    await act(async () => rejectOld({ message: 'sensitive transport detail' }));
    expect(screen.getByLabelText('Team name').value).toBe('Beta');
    expect(console.error).not.toHaveBeenCalled();
});

test('StrictMode cleanup invalidates the original request', async () => {
    let resolveOld;
    getTeamById.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    render(
        <StrictMode>
            <EditTeam />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => resolveOld(beta));
    expect(screen.getByLabelText('Team name').value).toBe('Alpha');
});

test('current save failures keep the editor open with fixed diagnostics', async () => {
    updateTeam.mockRejectedValueOnce({ message: 'sensitive transport detail' });
    render(<EditTeam />);
    await act(async () => {});
    await act(async () => fireEvent.click(screen.getByText('Save changes')));
    expect(screen.getByText('Failed to update team')).toBeTruthy();
    expect(console.error.mock.calls).toEqual([['Failed to update team']]);
    expect(onSaved).not.toHaveBeenCalled();
});
