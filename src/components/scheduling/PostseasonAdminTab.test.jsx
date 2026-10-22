/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import PostseasonAdminTab from './PostseasonAdminTab';
import {
    createScheduleEntry,
    createBulkScheduleEntries,
    updateScheduleEntry,
    deleteScheduleEntry,
} from '../../api/scheduleApi';

jest.mock('../../api/scheduleApi', () => ({
    createScheduleEntry: jest.fn(),
    createBulkScheduleEntries: jest.fn(),
    updateScheduleEntry: jest.fn(),
    deleteScheduleEntry: jest.fn(),
}));
jest.mock('../../utils/logoUrl', () => ({ resolveLogoUrl: (logo) => logo }));
jest.mock('../../api/uploadApi', () => ({ uploadPostseasonLogo: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({ useConferencesMap: jest.fn(), activeConferenceList: () => [] }));
jest.mock('../ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../schedule/Postseason', () => ({
    __esModule: true,
    default: ({ adminMode, onAdvanceTeam, postseasonSchedule }) =>
        adminMode && postseasonSchedule.length > 0 ? (
            <button onClick={() => onAdvanceTeam(postseasonSchedule[0])}>Choose winner</button>
        ) : null,
}));
jest.mock('../../utils/formatText', () => ({ formatGameType: (type) => type }));

const games = [
    {
        id: 1,
        game_type: 'PLAYOFFS',
        finished: true,
        playoff_round: 1,
        home_team: 'First',
        away_team: 'First Opponent',
        home_score: 21,
        away_score: 7,
        playoff_home_seed: 9,
        playoff_away_seed: 24,
    },
    {
        id: 2,
        game_type: 'PLAYOFFS',
        finished: true,
        playoff_round: 1,
        home_team: 'Second',
        away_team: 'Second Opponent',
        home_score: 28,
        away_score: 14,
        playoff_home_seed: 10,
        playoff_away_seed: 23,
    },
];
let props;
beforeEach(() => {
    createScheduleEntry.mockReset().mockResolvedValue({});
    createBulkScheduleEntries.mockReset().mockResolvedValue([]);
    updateScheduleEntry.mockReset().mockResolvedValue({});
    deleteScheduleEntry.mockReset().mockResolvedValue({});
    props = {
        season: 12,
        postseasonSchedule: games,
        onRefresh: jest.fn(),
        onShowSnackbar: jest.fn(),
        onOpenAddGameDialog: jest.fn(),
    };
});

test.each(['unmount', 'replacement'])(
    'an obsolete auto-advance stops its remaining writes after %s',
    async (change) => {
        let finishFirst;
        createScheduleEntry.mockReturnValueOnce(
            new Promise((resolve) => {
                finishFirst = resolve;
            })
        );
        const { unmount, rerender } = render(<PostseasonAdminTab {...props} />);
        expect(createScheduleEntry).toHaveBeenCalledTimes(1);
        if (change === 'unmount') {
            unmount();
        } else {
            rerender(<PostseasonAdminTab {...props} season={13} postseasonSchedule={[]} />);
        }
        await act(async () => finishFirst({}));
        expect(createScheduleEntry).toHaveBeenCalledTimes(1);
        expect(props.onShowSnackbar).not.toHaveBeenCalled();
        expect(props.onRefresh).not.toHaveBeenCalled();
    }
);

test('active auto-advance preserves sequential winners and one final refresh', async () => {
    render(<PostseasonAdminTab {...props} />);
    await act(async () => {});
    expect(
        createScheduleEntry.mock.calls.map(([entry]) => [entry.season, entry.homeTeam, entry.playoffRound, entry.week])
    ).toEqual([
        [12, 'First', 2, 15],
        [12, 'Second', 2, 15],
    ]);
    expect(props.onShowSnackbar).toHaveBeenCalledTimes(2);
    expect(props.onRefresh).toHaveBeenCalledTimes(1);
});

test('changing season with the old schedule still visible cannot advance those games into the new season', async () => {
    let finishFirst;
    createScheduleEntry.mockReturnValueOnce(
        new Promise((resolve) => {
            finishFirst = resolve;
        })
    );
    const { rerender } = render(<PostseasonAdminTab {...props} />);
    rerender(<PostseasonAdminTab {...props} season={13} />);
    await act(async () => finishFirst({}));
    expect(createScheduleEntry).toHaveBeenCalledTimes(1);
    expect(createScheduleEntry.mock.calls[0][0].season).toBe(12);
    expect(props.onRefresh).not.toHaveBeenCalled();
    expect(props.onShowSnackbar).not.toHaveBeenCalled();
});

test('the extracted winner dialog submits the chosen team and closes after the write', async () => {
    render(<PostseasonAdminTab {...props} postseasonSchedule={[{ ...games[0], finished: false }]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Choose winner' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByRole('combobox'), { target: { value: 'First Opponent' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Advance Team' }));
    await act(async () => {});
    expect(createScheduleEntry).toHaveBeenCalledWith(
        expect.objectContaining({ homeTeam: 'First Opponent', playoffHomeSeed: 24, playoffRound: 2, season: 12 })
    );
    expect(props.onRefresh).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

test('the extracted bowl dialog retains its name, venue, logo, and save payload', async () => {
    const bowl = {
        id: 30,
        season: 12,
        week: 14,
        subdivision: 'FBS',
        home_team: 'Home',
        away_team: 'Away',
        game_type: 'BOWL',
        postseason_game_name: 'Old Bowl',
        postseason_game_logo: '/old-logo.png',
        venue: 'Old Venue',
    };
    render(<PostseasonAdminTab {...props} postseasonSchedule={[bowl]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByPlaceholderText('e.g., Rose Bowl, Sugar Bowl, etc.'), {
        target: { value: 'New Bowl' },
    });
    fireEvent.change(within(dialog).getByRole('combobox'), { target: { value: ' New Venue ' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
    await act(async () => {});
    expect(updateScheduleEntry).toHaveBeenCalledWith(30, {
        season: 12,
        week: 14,
        subdivision: 'FBS',
        homeTeam: 'Home',
        awayTeam: 'Away',
        gameType: 'BOWL',
        postseasonGameName: 'New Bowl',
        postseasonGameLogo: '/old-logo.png',
        neutralSite: true,
        venue: 'New Venue',
    });
    expect(props.onRefresh).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

test('regeneration retains existing seeds and deletes all old games before creating the bracket', async () => {
    const teams = Array.from({ length: 24 }, (_, index) => ({
        name: `Team ${index + 1}`,
        active: true,
        conference: 'SEC',
    }));
    const schedule = Array.from({ length: 12 }, (_, index) => ({
        id: index + 1,
        game_type: 'PLAYOFFS',
        playoff_round: 1,
        home_team: teams[index * 2].name,
        away_team: teams[index * 2 + 1].name,
        playoff_home_seed: index * 2 + 1,
        playoff_away_seed: index * 2 + 2,
    }));
    render(<PostseasonAdminTab {...props} allTeams={teams} postseasonSchedule={schedule} />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit playoff bracket' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('combobox', { name: 'Seed 1' }).value).toBe('Team 1');
    expect(within(dialog).getByRole('combobox', { name: 'Seed 24' }).value).toBe('Team 24');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Regenerate Bracket' }));
    await act(async () => {});
    expect(deleteScheduleEntry.mock.calls.map(([id]) => id)).toEqual(schedule.map(({ id }) => id));
    expect(createBulkScheduleEntries).toHaveBeenCalledTimes(1);
    const entries = createBulkScheduleEntries.mock.calls[0][0];
    expect(entries).toHaveLength(16);
    expect(Math.max(...deleteScheduleEntry.mock.invocationCallOrder)).toBeLessThan(
        createBulkScheduleEntries.mock.invocationCallOrder[0]
    );
    expect(entries.map((entry) => entry.playoffRound)).toEqual([...Array(8).fill(1), ...Array(8).fill(2)]);
    expect(props.onRefresh).toHaveBeenCalledTimes(1);
});
