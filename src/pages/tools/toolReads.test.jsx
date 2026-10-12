/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import MatchupPreview from './MatchupPreview';
import ScoutingReport from './ScoutingReport';
import HeadToHead from './HeadToHead';
import CoachTendencyCard from './CoachTendencyCard';
import { encodeHiddenColumns } from '../../utils/scoutingReport';
import { getCoachStats } from '../../api/coachStatsApi';
import { getAllTeams, getAllTeamsIncludingInactive } from '../../api/teamApi';
import { getAllUsers, getUserById, updateScoutingReportHiddenColumns } from '../../api/userApi';
import { getAllPlaysByTeam, getAllPlaysByDiscordId } from '../../api/playApi';
import { getGamesByIds } from '../../api/gameApi';
import { getAllSeasons, getCurrentSeason } from '../../api/seasonApi';
import { getVegasOdds } from '../../api/vegasOddsApi';
import { getFilteredSeasonStats } from '../../api/seasonStatsApi';
import { getScheduleBySeasonAndTeam } from '../../api/scheduleApi';

let mockParams;
const mockSetParams = jest.fn();
jest.mock('react-router-dom', () => ({
    useSearchParams: () => [mockParams, mockSetParams],
    Link: ({ children }) => <span>{children}</span>,
}));
jest.mock('../../api/teamApi', () => ({ getAllTeams: jest.fn(), getAllTeamsIncludingInactive: jest.fn() }));
jest.mock('../../api/coachStatsApi', () => ({ getCoachStats: jest.fn() }));
jest.mock('../../api/rankingApi', () => ({ getRankedGames: jest.fn().mockResolvedValue([]) }));
jest.mock('../../context/ColorModeContext', () => ({ useColorMode: () => ({ mode: 'dark' }) }));
jest.mock('recharts', () => ({ ...jest.requireActual('recharts'), ResponsiveContainer: () => null }));
jest.mock('../../api/userApi', () => ({
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    updateScoutingReportHiddenColumns: jest.fn(),
}));
jest.mock('../../api/playApi', () => ({ getAllPlaysByTeam: jest.fn(), getAllPlaysByDiscordId: jest.fn() }));
jest.mock('../../api/gameApi', () => ({ getGamesByIds: jest.fn() }));
jest.mock('../../api/seasonApi', () => ({
    getAllSeasons: jest.fn().mockResolvedValue([]),
    getCurrentSeason: jest.fn().mockResolvedValue(null),
}));
jest.mock('../../api/scheduleApi', () => ({ getScheduleBySeasonAndTeam: jest.fn() }));
jest.mock('../../api/seasonStatsApi', () => ({ getFilteredSeasonStats: jest.fn() }));
jest.mock('../../api/vegasOddsApi', () => ({ getVegasOdds: jest.fn() }));
jest.mock('../../hooks/useTeamsMap', () => ({ useTeamsMap: () => ({}), toEntry: (team) => team }));
jest.mock('../../hooks/useSeo', () => ({ useSeo: () => {} }));
jest.mock('../../components/layout/PageWrap', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/ui/SearchableSelect', () => ({
    __esModule: true,
    default: ({ id, value, options, onChange }) => (
        <select aria-label={id} value={value} onChange={(event) => onChange(event.target.value)}>
            <option value="" />
            {options.map((option) => (
                <option key={option.value} value={option.label}>
                    {option.label}
                </option>
            ))}
        </select>
    ),
}));
jest.mock('../../components/ui/SelectPill', () => ({
    __esModule: true,
    default: ({ ariaLabel, value, options, onChange }) => (
        <select aria-label={ariaLabel} value={value} onChange={(event) => onChange(event.target.value)}>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    ),
}));

const teams = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
];
const coaches = [
    { id: 1, username: 'AlphaCoach', discord_id: 'a', team: 'Alpha', position: 'HEAD_COACH' },
    { id: 2, username: 'BetaCoach', discord_id: 'b', team: 'Beta', position: 'HEAD_COACH' },
];
const play = { game_id: 10, play_number: 1 };
const pending = (api) => {
    let resolve;
    api.mockReturnValueOnce(
        new Promise((finish) => {
            resolve = finish;
        })
    );
    return (value) => act(async () => resolve(value));
};
beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockParams = new URLSearchParams();
    getAllSeasons.mockResolvedValue([]);
    getCurrentSeason.mockResolvedValue(null);
    getAllTeams.mockResolvedValue(teams);
    getAllTeamsIncludingInactive.mockResolvedValue(teams);
    getCoachStats.mockResolvedValue([]);
    getUserById.mockResolvedValue(null);
    updateScoutingReportHiddenColumns.mockResolvedValue(undefined);
    getAllUsers.mockResolvedValue(coaches);
    getAllPlaysByTeam.mockResolvedValue([]);
    getAllPlaysByDiscordId.mockResolvedValue([]);
    getGamesByIds.mockResolvedValue([]);
    getVegasOdds.mockResolvedValue(null);
    getFilteredSeasonStats.mockResolvedValue(null);
    getScheduleBySeasonAndTeam.mockResolvedValue([]);
});
const startMatchup = async () => {
    await act(async () => {});
    fireEvent.change(screen.getByLabelText('matchup-team-a'), { target: { value: 'Alpha' } });
    fireEvent.change(screen.getByLabelText('matchup-team-b'), { target: { value: 'Beta' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Compare' })));
};
const startScouting = async () => {
    await act(async () => {});
    fireEvent.change(screen.getByLabelText('scouting-target'), { target: { value: 'AlphaCoach (Alpha)' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Generate report' })));
};

test.each(['matchup', 'scouting'])('StrictMode %s lookup ignores the cleaned-up response', async (tool) => {
    const api = tool === 'matchup' ? getAllTeams : getAllUsers;
    const finish = pending(api);
    render(<StrictMode>{tool === 'matchup' ? <MatchupPreview /> : <ScoutingReport />}</StrictMode>);
    await act(async () => {});
    await finish(tool === 'matchup' ? [{ name: 'Obsolete' }] : [{ discord_id: 'old', username: 'Obsolete' }]);
    expect(screen.queryByRole('option', { name: 'Obsolete' })).toBeNull();
    expect(
        screen.getAllByRole('option', { name: tool === 'matchup' ? 'Alpha' : 'AlphaCoach (Alpha)' }).length
    ).toBeGreaterThan(0);
});

test.each(['matchup', 'scouting'])('unmounted %s play read cannot start another game read', async (tool) => {
    const finish = pending(tool === 'matchup' ? getAllPlaysByTeam : getAllPlaysByDiscordId);
    const { unmount } = render(tool === 'matchup' ? <MatchupPreview /> : <ScoutingReport />);
    await (tool === 'matchup' ? startMatchup() : startScouting());
    unmount();
    await finish([play]);
    expect(getGamesByIds).not.toHaveBeenCalled();
    expect(mockSetParams).not.toHaveBeenCalled();
});

test('unmounted matchup odds read cannot rewrite the URL', async () => {
    const finish = pending(getVegasOdds);
    const { unmount } = render(<MatchupPreview />);
    await startMatchup();
    await act(async () => {});
    expect(getAllPlaysByDiscordId).toHaveBeenCalled();
    unmount();
    await finish({ home_spread: -3 });
    expect(mockSetParams).not.toHaveBeenCalled();
});

test('unmounted matchup coach plays cannot start combined game reads', async () => {
    const finish = pending(getAllPlaysByDiscordId);
    const { unmount } = render(<MatchupPreview />);
    await startMatchup();
    await act(async () => {});
    expect(getAllPlaysByDiscordId.mock.calls).toEqual([['a'], ['b']]);
    unmount();
    await finish([play]);
    expect(getGamesByIds).not.toHaveBeenCalled();
    expect(mockSetParams).not.toHaveBeenCalled();
});

test('unmounted matchup combined-game read cannot rewrite the URL', async () => {
    getAllPlaysByDiscordId.mockResolvedValue([play]);
    const finish = pending(getGamesByIds);
    const { unmount } = render(<MatchupPreview />);
    await startMatchup();
    await act(async () => {});
    unmount();
    await finish([]);
    expect(mockSetParams).not.toHaveBeenCalled();
});

test('a current matchup keeps its API arguments and successful URL update', async () => {
    render(<MatchupPreview />);
    await startMatchup();
    await act(async () => {});
    expect(getFilteredSeasonStats.mock.calls).toEqual([
        ['Alpha', null, null, null, 0, 50],
        ['Beta', null, null, null, 0, 50],
    ]);
    expect(getVegasOdds).toHaveBeenCalledWith('Alpha', 'Beta');
    expect(mockSetParams).toHaveBeenCalledWith({ teamA: 'Alpha', teamB: 'Beta', season: 'alltime' }, { replace: true });
    expect(screen.getByText('Overview')).toBeTruthy();
});

test('a current scouting report retains its target and game-read arguments', async () => {
    render(<ScoutingReport />);
    await startScouting();
    await act(async () => {});
    expect(getAllPlaysByDiscordId).toHaveBeenCalledWith('a');
    expect(getGamesByIds).toHaveBeenCalledWith([]);
    expect(mockSetParams.mock.calls.at(-1)[0].get('coach')).toBe('a');
    expect(screen.getByRole('button', { name: 'Generate report' }).disabled).toBe(false);
});

test('current scouting failure retains its existing error and releases loading', async () => {
    getAllPlaysByDiscordId.mockRejectedValueOnce(new Error('report unavailable'));
    render(<ScoutingReport />);
    await startScouting();
    await act(async () => {});
    expect(screen.getByText('report unavailable')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Generate report' }).disabled).toBe(false);
});

test('unmounted matchup team-game completion cannot rewrite the URL', async () => {
    getAllSeasons.mockResolvedValueOnce([{ season_number: 14 }]);
    getAllPlaysByTeam.mockImplementation((team) => Promise.resolve(team === 'Alpha' ? [play] : []));
    const finish = pending(getGamesByIds);
    const { unmount } = render(<MatchupPreview />);
    await startMatchup();
    expect(getScheduleBySeasonAndTeam.mock.calls).toEqual([
        [14, 'Alpha'],
        [14, 'Beta'],
    ]);
    expect(getVegasOdds).toHaveBeenCalled();
    unmount();
    await finish([]);
    expect(mockSetParams).not.toHaveBeenCalled();
});

test('current matchup failure retains its error and releases loading', async () => {
    getAllPlaysByTeam.mockResolvedValueOnce([play]);
    getGamesByIds.mockRejectedValueOnce(new Error('comparison unavailable'));
    render(<MatchupPreview />);
    await startMatchup();
    expect(screen.getByText('comparison unavailable')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Compare' }).disabled).toBe(false);
});

const startHeadToHead = async () => {
    await act(async () => {});
    fireEvent.change(screen.getByLabelText('h2h-a'), { target: { value: 'Alpha' } });
    fireEvent.change(screen.getByLabelText('h2h-b'), { target: { value: 'Beta' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Compare' })));
};
const startCard = async (season = 'alltime') => {
    await act(async () => {});
    fireEvent.change(screen.getByLabelText('coach-tendency-target'), { target: { value: 'AlphaCoach (Alpha)' } });
    fireEvent.change(screen.getByLabelText('Season scope'), { target: { value: season } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Generate card' })));
};

test.each(['head-to-head', 'card'])('StrictMode %s lookup ignores obsolete entries', async (tool) => {
    const finish = pending(tool === 'card' ? getAllUsers : getAllTeamsIncludingInactive);
    render(<StrictMode>{tool === 'card' ? <CoachTendencyCard /> : <HeadToHead />}</StrictMode>);
    await act(async () => {});
    await finish(tool === 'card' ? [{ username: 'Obsolete', discord_id: 'old' }] : [{ name: 'Obsolete' }]);
    expect(screen.queryByRole('option', { name: 'Obsolete' })).toBeNull();
    expect(
        screen.getAllByRole('option', { name: tool === 'card' ? 'AlphaCoach (Alpha)' : 'Alpha' }).length
    ).toBeGreaterThan(0);
});

test.each(['head-to-head', 'card'])('unmounted %s play read cannot start game loading', async (tool) => {
    getAllSeasons.mockResolvedValue([{ season_number: 14 }]);
    const finish = pending(tool === 'card' ? getAllPlaysByDiscordId : getAllPlaysByTeam);
    const { unmount } = render(tool === 'card' ? <CoachTendencyCard /> : <HeadToHead />);
    await (tool === 'card' ? startCard('14') : startHeadToHead());
    unmount();
    await finish([play]);
    expect(getGamesByIds).not.toHaveBeenCalled();
    expect(mockSetParams).not.toHaveBeenCalled();
});

test.each(['head-to-head', 'card'])('unmounted %s game read cannot change the URL', async (tool) => {
    getAllSeasons.mockResolvedValue([{ season_number: 14 }]);
    getAllPlaysByTeam.mockResolvedValue([play]);
    getAllPlaysByDiscordId.mockResolvedValue([play]);
    const finish = pending(getGamesByIds);
    const { unmount } = render(tool === 'card' ? <CoachTendencyCard /> : <HeadToHead />);
    await (tool === 'card' ? startCard('14') : startHeadToHead());
    unmount();
    await finish([]);
    expect(mockSetParams).not.toHaveBeenCalled();
});

test('current head-to-head comparison preserves team arguments and URL', async () => {
    render(<HeadToHead />);
    await startHeadToHead();
    expect(getFilteredSeasonStats.mock.calls).toEqual([
        ['Alpha', null, null, null, 0, 100],
        ['Beta', null, null, null, 0, 100],
    ]);
    expect(mockSetParams).toHaveBeenCalledWith(
        { aType: 'team', a: 'Alpha', bType: 'team', b: 'Beta' },
        { replace: true }
    );
});

test('current tendency card preserves coach arguments and URL', async () => {
    render(<CoachTendencyCard />);
    await startCard();
    expect(getCoachStats).toHaveBeenCalledWith('AlphaCoach');
    expect(getAllPlaysByDiscordId).toHaveBeenCalledWith('a');
    expect(mockSetParams).toHaveBeenCalledWith({ coach: 'a', season: 'alltime' }, { replace: true });
});

test('preference failure is handled in the existing error area and can be retried', async () => {
    localStorage.setItem('userId', '1');
    localStorage.setItem('token', 'synthetic-session');
    updateScoutingReportHiddenColumns.mockRejectedValueOnce(new Error('preferences unavailable'));
    render(<ScoutingReport />);
    await startScouting();
    fireEvent.click(screen.getByRole('button', { name: 'Hide all' }));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Save as default' })));
    expect(screen.getByText('preferences unavailable')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save as default' }).disabled).toBe(false);
    expect(updateScoutingReportHiddenColumns.mock.calls[0][0]).toBe('1');
    expect(updateScoutingReportHiddenColumns.mock.calls[0][1].length).toBeGreaterThan(0);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Save as default' })));
    expect(screen.queryByText('preferences unavailable')).toBeNull();
    expect(updateScoutingReportHiddenColumns.mock.calls[1]).toEqual(updateScoutingReportHiddenColumns.mock.calls[0]);
});

test.each(['success', 'failure'])('old preference %s cannot affect a replacement account’s save', async (outcome) => {
    localStorage.setItem('userId', '1');
    localStorage.setItem('token', 'synthetic-session');
    let resolve, reject;
    updateScoutingReportHiddenColumns.mockReturnValueOnce(
        new Promise((finish, fail) => {
            resolve = finish;
            reject = fail;
        })
    );
    updateScoutingReportHiddenColumns.mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(<ScoutingReport />);
    await startScouting();
    fireEvent.click(screen.getByRole('button', { name: 'Save as default' }));
    localStorage.setItem('userId', '2');
    localStorage.setItem('token', 'replacement-session');
    rerender(<ScoutingReport />);
    fireEvent.click(screen.getByRole('button', { name: 'Save as default' }));
    await act(async () => (outcome === 'success' ? resolve() : reject(new Error('obsolete preferences'))));
    expect(screen.getByRole('button', { name: 'Saving…' }).disabled).toBe(true);
    expect(screen.queryByText('obsolete preferences')).toBeNull();
    expect(updateScoutingReportHiddenColumns.mock.calls.map(([id]) => id)).toEqual(['1', '2']);
});

test('preference rejection after unmount is handled', async () => {
    localStorage.setItem('userId', '1');
    let reject;
    updateScoutingReportHiddenColumns.mockReturnValueOnce(
        new Promise((resolve, fail) => {
            reject = fail;
        })
    );
    const { unmount } = render(<ScoutingReport />);
    await startScouting();
    fireEvent.click(screen.getByRole('button', { name: 'Save as default' }));
    unmount();
    await act(async () => reject(new Error('obsolete preferences')));
    expect(mockSetParams.mock.calls.at(-1)[0].get('coach')).toBe('a');
});

test('current head-to-head game failure preserves its error and releases loading', async () => {
    getAllPlaysByTeam.mockResolvedValueOnce([play]);
    getGamesByIds.mockRejectedValueOnce(new Error('history unavailable'));
    render(<HeadToHead />);
    await startHeadToHead();
    expect(screen.getByText('history unavailable')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Compare' }).disabled).toBe(false);
});

test('current seasonal card retains the quiet game-read fallback', async () => {
    getAllSeasons.mockResolvedValue([{ season_number: 14 }]);
    getGamesByIds.mockRejectedValueOnce(new Error('games unavailable'));
    render(<CoachTendencyCard />);
    await startCard('14');
    expect(getGamesByIds).toHaveBeenCalledWith([]);
    expect(screen.queryByText('games unavailable')).toBeNull();
    expect(mockSetParams).toHaveBeenCalledWith({ coach: 'a', season: '14' }, { replace: true });
    expect(screen.getByRole('button', { name: 'Generate card' }).disabled).toBe(false);
});

test.each(['matchup', 'card'])('%s defaults to the numeric active season instead of an upcoming one', async (tool) => {
    getCurrentSeason.mockResolvedValue(12);
    getAllSeasons.mockResolvedValue([{ season_number: 12 }, { season_number: 13 }]);
    render(tool === 'card' ? <CoachTendencyCard /> : <MatchupPreview />);
    await act(async () => {});
    expect(screen.getByLabelText('Season scope').value).toBe('12');
});

test.each(['matchup', 'card'])(
    '%s retains its latest-listed fallback when the current season is unavailable',
    async (tool) => {
        getCurrentSeason.mockRejectedValueOnce(new Error('no current season'));
        getAllSeasons.mockResolvedValue([{ season_number: 12 }, { season_number: 13 }]);
        render(tool === 'card' ? <CoachTendencyCard /> : <MatchupPreview />);
        await act(async () => {});
        expect(screen.getByLabelText('Season scope').value).toBe('13');
    }
);

test('scouting current-season scope keeps current plays and excludes previous-season plays', async () => {
    getCurrentSeason.mockResolvedValue(12);
    getAllPlaysByDiscordId.mockResolvedValue([
        { play_id: 1, game_id: 10, play_number: 1, play_type: 'PASS', play_call: 'Current season play' },
        { play_id: 2, game_id: 11, play_number: 2, play_type: 'PASS', play_call: 'Previous season play' },
    ]);
    getGamesByIds.mockResolvedValue([
        { game_id: 10, season: 12 },
        { game_id: 11, season: 11 },
    ]);
    render(<ScoutingReport />);
    await act(async () => {});
    fireEvent.change(screen.getByLabelText('scouting-target'), { target: { value: 'AlphaCoach (Alpha)' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Current season only' }));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Generate report' })));
    expect(screen.getByText('Showing 1 of 1 plays')).toBeTruthy();
    expect(screen.getByText('Current season play')).toBeTruthy();
    expect(screen.queryByText('Previous season play')).toBeNull();
});

test('current account column defaults retain their existing save payload', async () => {
    localStorage.setItem('userId', '1');
    localStorage.setItem('token', 'synthetic-session');
    getUserById.mockResolvedValue({ scouting_report_hidden_columns: ['play_id'] });
    render(<ScoutingReport />);
    await startScouting();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Save as default' })));
    expect(updateScoutingReportHiddenColumns).toHaveBeenCalledWith('1', ['play_id']);
});

test.each(['account', 'token'])('late column defaults are discarded after a %s replacement', async (replacement) => {
    localStorage.setItem('userId', '1');
    localStorage.setItem('token', 'synthetic-session');
    const finish = pending(getUserById);
    const { rerender } = render(<ScoutingReport />);
    if (replacement === 'account') {
        localStorage.setItem('userId', '2');
    } else {
        localStorage.setItem('token', 'replacement-session');
    }
    rerender(<ScoutingReport />);
    await finish({ scouting_report_hidden_columns: ['play_id'] });
    await startScouting();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Save as default' })));
    expect(updateScoutingReportHiddenColumns).toHaveBeenCalledWith(replacement === 'account' ? '2' : '1', []);
});

test('explicit URL columns still take precedence over account defaults', async () => {
    localStorage.setItem('userId', '1');
    mockParams = new URLSearchParams({ cols: encodeHiddenColumns(['game_id']) });
    getUserById.mockResolvedValue({ scouting_report_hidden_columns: ['play_id'] });
    render(<ScoutingReport />);
    await startScouting();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Save as default' })));
    expect(updateScoutingReportHiddenColumns).toHaveBeenCalledWith('1', ['game_id']);
});

test.each(['matchup', 'card'])('%s URL season retains precedence over the active-season default', async (tool) => {
    getCurrentSeason.mockResolvedValue(12);
    getAllSeasons.mockResolvedValue([{ season_number: 11 }, { season_number: 12 }, { season_number: 13 }]);
    mockParams = new URLSearchParams(tool === 'card' ? 'coach=a&season=11' : 'teamA=Alpha&teamB=Beta&season=11');
    render(tool === 'card' ? <CoachTendencyCard /> : <MatchupPreview />);
    await act(async () => {});
    expect(screen.getByLabelText('Season scope').value).toBe('11');
    expect(mockSetParams.mock.calls.at(-1)[0].season).toBe('11');
});
