/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ConferenceScheduleAdminTab from './ConferenceScheduleAdminTab';

jest.mock('../../hooks/useConferencesMap', () => ({ formatConference: (code) => code }));
jest.mock('./ConferenceScheduleGrid', () => ({ __esModule: true, default: () => null }));
jest.mock('../ui/Panel', () => ({ __esModule: true, default: ({ children }) => <section>{children}</section> }));
let props;
beforeEach(() => {
    props = {
        selectedConference: 'FIRST',
        adminConferences: [
            { code: 'FIRST', label: 'First' },
            { code: 'SECOND', label: 'Second' },
        ],
        conferenceSchedule: [],
        conferenceTeams: [],
        teamMap: {},
        teamWeekOccupiedAll: new Set(),
        numConferenceGames: 8,
        protectedRivalries: [],
        divisions: [],
        onSaveConferenceRules: jest.fn(),
    };
});

test('an old conference save failure cannot replace the current editor error or stop its save', async () => {
    let rejectOld;
    let resolveCurrent;
    props.onSaveConferenceRules
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveCurrent = resolve;
            })
        );
    const { rerender } = render(<ConferenceScheduleAdminTab {...props} />);
    fireEvent.click(screen.getByText('Conference rules: FIRST'));
    fireEvent.click(screen.getByRole('button', { name: 'Save conference rules' }));
    expect(props.onSaveConferenceRules).toHaveBeenLastCalledWith('FIRST', 8, [], []);
    rerender(<ConferenceScheduleAdminTab {...props} selectedConference="SECOND" />);
    fireEvent.click(screen.getByRole('button', { name: 'Save conference rules' }));
    expect(props.onSaveConferenceRules).toHaveBeenLastCalledWith('SECOND', 8, [], []);
    await act(async () => rejectOld(new Error('Old save failed')));
    expect(screen.queryByText('Old save failed')).toBeNull();
    expect(screen.getByRole('button', { name: 'Saving...' }).disabled).toBe(true);
    await act(async () => resolveCurrent());
    expect(screen.getByRole('button', { name: 'Save conference rules' }).disabled).toBe(false);
});

test('switching conferences clears an existing rules save error', async () => {
    props.onSaveConferenceRules.mockRejectedValueOnce(new Error('Rejected'));
    const { rerender } = render(<ConferenceScheduleAdminTab {...props} />);
    fireEvent.click(screen.getByText('Conference rules: FIRST'));
    fireEvent.click(screen.getByRole('button', { name: 'Save conference rules' }));
    await act(async () => {});
    expect(screen.getByText('Rejected')).toBeTruthy();
    rerender(<ConferenceScheduleAdminTab {...props} selectedConference="SECOND" />);
    expect(screen.queryByText('Rejected')).toBeNull();
});
