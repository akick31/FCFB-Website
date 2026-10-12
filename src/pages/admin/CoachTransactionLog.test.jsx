/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import CoachTransactionLog from './CoachTransactionLog';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';

const mockParams = new URLSearchParams();
jest.mock('react-router-dom', () => ({ useSearchParams: () => [mockParams, jest.fn()] }));
jest.mock('../../api/coachTransactionLogApi', () => ({ getEntireCoachTransactionLog: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({ conferenceLabel: (code) => code }));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/ui/DataTable', () => ({
    __esModule: true,
    default: ({ children }) => <table>{children}</table>,
}));
jest.mock('../../components/ui/SelectPill', () => ({ __esModule: true, default: () => null }));
const transaction = (team) => ({
    team,
    coach: ['Coach'],
    position: 'HEAD_COACH',
    transaction: 'HIRED',
    processed_by: 'Admin',
});
beforeEach(() => {
    jest.resetAllMocks();
    getEntireCoachTransactionLog.mockResolvedValue([transaction('Current')]);
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('StrictMode obsolete transaction rows cannot replace the current log', async () => {
    let resolveOld;
    getEntireCoachTransactionLog.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    render(
        <StrictMode>
            <CoachTransactionLog />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => resolveOld([transaction('Obsolete')]));
    expect(screen.getByText('Current')).toBeTruthy();
    expect(screen.queryByText('Obsolete')).toBeNull();
});

test('a failure after unmount does not log obsolete transport details', async () => {
    let rejectOld;
    getEntireCoachTransactionLog.mockReturnValueOnce(
        new Promise((resolve, reject) => {
            rejectOld = reject;
        })
    );
    const { unmount } = render(<CoachTransactionLog />);
    unmount();
    await act(async () => rejectOld({ message: 'sensitive transport detail' }));
    expect(console.error).not.toHaveBeenCalled();
});

test('current failures retain their feedback with a fixed diagnostic', async () => {
    getEntireCoachTransactionLog.mockRejectedValueOnce({ message: 'sensitive transport detail' });
    render(<CoachTransactionLog />);
    await act(async () => {});
    expect(screen.getByText('Failed to load coach transaction log')).toBeTruthy();
    expect(console.error.mock.calls).toEqual([['Failed to fetch transactions']]);
});
