/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import ModifyTeam from './ModifyTeam';
import { getTeamById } from '../../api/teamApi';

let mockTeamId;
jest.mock('react-router-dom', () => ({ useParams: () => ({ teamId: mockTeamId }) }));
jest.mock('../../api/teamApi', () => ({ getTeamById: jest.fn() }));
jest.mock('../../components/forms/ModifyTeamForm', () => ({
    __esModule: true,
    default: ({ team }) => <div>Edit {team.name}</div>,
}));
jest.mock('../../components/icons/LoadingSpinner', () => ({
    __esModule: true,
    default: () => <div role="progressbar" />,
}));

beforeEach(() => {
    jest.resetAllMocks();
    mockTeamId = 'first';
});

test('an older team response cannot populate a different edit route', async () => {
    let resolveOld;
    getTeamById
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockResolvedValueOnce({ name: 'Current' });
    const { rerender } = render(<ModifyTeam />);
    mockTeamId = 'second';
    await act(async () => rerender(<ModifyTeam />));
    await act(async () => resolveOld({ name: 'Old' }));
    expect(screen.getByText('Edit Current')).toBeTruthy();
    expect(screen.queryByText('Edit Old')).toBeNull();
    expect(getTeamById.mock.calls).toEqual([['first'], ['second']]);
});

test('switching teams hides the previous form until the current team loads', async () => {
    let resolveCurrent;
    getTeamById.mockResolvedValueOnce({ name: 'Old' }).mockReturnValueOnce(
        new Promise((resolve) => {
            resolveCurrent = resolve;
        })
    );
    const { rerender } = render(<ModifyTeam />);
    await act(async () => {});
    mockTeamId = 'second';
    rerender(<ModifyTeam />);
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.queryByText('Edit Old')).toBeNull();
    await act(async () => resolveCurrent({ name: 'Current' }));
    expect(screen.getByText('Edit Current')).toBeTruthy();
});

test('a previous error does not block a later successful team load', async () => {
    getTeamById.mockRejectedValueOnce(new Error('unavailable')).mockResolvedValueOnce({ name: 'Current' });
    const { rerender } = render(<ModifyTeam />);
    await act(async () => {});
    expect(screen.getByText('Failed to load team')).toBeTruthy();
    mockTeamId = 'second';
    await act(async () => rerender(<ModifyTeam />));
    expect(screen.getByText('Edit Current')).toBeTruthy();
    expect(screen.queryByText('Failed to load team')).toBeNull();
});

test('an obsolete failure cannot clear current loading or surface an error', async () => {
    let rejectOld;
    getTeamById
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(<ModifyTeam />);
    mockTeamId = 'second';
    rerender(<ModifyTeam />);
    await act(async () => rejectOld(new Error('old failure')));
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.queryByText('Failed to load team')).toBeNull();
});

test('StrictMode cleanup invalidates the first request', async () => {
    let resolveOld;
    getTeamById
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockResolvedValueOnce({ name: 'Current' });
    render(
        <StrictMode>
            <ModifyTeam />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => resolveOld({ name: 'Old' }));
    expect(screen.getByText('Edit Current')).toBeTruthy();
});
