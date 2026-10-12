/** @jest-environment jsdom */
import * as React from 'react';
import { act, renderHook } from '@testing-library/react';
import { getAllTeams, getTeamByName } from '../api/teamApi';

jest.mock('../api/teamApi', () => ({ getAllTeams: jest.fn(), getTeamByName: jest.fn() }));

let useTeamsMap;
let ensureTeam;

beforeEach(() => {
    jest.resetAllMocks();
    getAllTeams.mockResolvedValue([]);
    jest.isolateModules(() => {
        jest.doMock('react', () => React);
        jest.doMock('../api/teamApi', () => ({ getAllTeams, getTeamByName }));
        ({ useTeamsMap, ensureTeam } = require('./useTeamsMap'));
    });
});

test('unchanged team data retains its snapshot across renders', async () => {
    getAllTeams.mockResolvedValue([{ id: 1, name: 'Team' }]);
    const { result, rerender } = renderHook(() => useTeamsMap());
    await act(async () => {});
    const snapshot = result.current;
    rerender();
    expect(result.current).toBe(snapshot);
});

test('a failed lookup does not restart an effect dependent on the team snapshot', async () => {
    renderHook(() => useTeamsMap());
    await act(async () => {});
    getTeamByName.mockRejectedValueOnce(new Error('Unavailable'));
    getTeamByName.mockReturnValue(new Promise(() => {}));
    renderHook(() => {
        const teams = useTeamsMap();
        React.useEffect(() => {
            ensureTeam('Missing');
        }, [teams]);
        return teams;
    });
    await act(async () => {});
    expect(getTeamByName).toHaveBeenCalledTimes(1);
});

test('subscribers share the same cold and loaded snapshots and one bulk request', async () => {
    let resolveBulk;
    getAllTeams.mockReturnValue(
        new Promise((resolve) => {
            resolveBulk = resolve;
        })
    );
    const first = renderHook(() => useTeamsMap());
    const second = renderHook(() => useTeamsMap());
    expect(first.result.current).toBe(second.result.current);
    expect(getAllTeams).toHaveBeenCalledTimes(1);
    await act(async () => resolveBulk([{ id: 1, name: 'Team' }]));
    expect(first.result.current).toBe(second.result.current);
    expect(first.result.current.Team.id).toBe(1);
});

test('lazy lookups coalesce and notify all subscribers with the same updated snapshot', async () => {
    let resolveTeam;
    getTeamByName.mockReturnValue(
        new Promise((resolve) => {
            resolveTeam = resolve;
        })
    );
    const first = renderHook(() => useTeamsMap());
    const second = renderHook(() => useTeamsMap());
    await act(async () => {});
    const before = first.result.current;
    act(() => {
        ensureTeam('Lazy');
        ensureTeam('Lazy');
    });
    expect(getTeamByName).toHaveBeenCalledTimes(1);
    await act(async () => resolveTeam({ id: 2, name: 'Lazy' }));
    expect(first.result.current).not.toBe(before);
    expect(first.result.current).toBe(second.result.current);
    expect(first.result.current.Lazy.id).toBe(2);
});

test('failed lookups remain retryable through an explicit later request', async () => {
    getTeamByName.mockRejectedValueOnce(new Error('Unavailable'));
    getTeamByName.mockResolvedValueOnce({ id: 2, name: 'Lazy' });
    const { result } = renderHook(() => useTeamsMap());
    await act(async () => {});
    const before = result.current;
    await act(async () => ensureTeam('Lazy'));
    expect(result.current).toBe(before);
    await act(async () => ensureTeam('Lazy'));
    expect(getTeamByName).toHaveBeenCalledTimes(2);
    expect(result.current.Lazy.id).toBe(2);
});

test('missing lookup responses do not publish an unchanged snapshot', async () => {
    getTeamByName.mockResolvedValue(null);
    const { result } = renderHook(() => useTeamsMap());
    await act(async () => {});
    const before = result.current;
    await act(async () => ensureTeam('Missing'));
    expect(result.current).toBe(before);
});

test('lazy entries keep precedence when the bulk request completes later', async () => {
    let resolveBulk;
    getAllTeams.mockReturnValue(
        new Promise((resolve) => {
            resolveBulk = resolve;
        })
    );
    getTeamByName.mockResolvedValue({ id: 2, name: 'Team', abbreviation: 'LAZY' });
    const { result } = renderHook(() => useTeamsMap());
    await act(async () => ensureTeam('Team'));
    await act(async () => resolveBulk([{ id: 1, name: 'Team', abbreviation: 'BULK' }]));
    expect(result.current.Team.id).toBe(2);
    expect(result.current.Team.abbreviation).toBe('LAZY');
});

test('a failed bulk load remains retryable on the next mount', async () => {
    getAllTeams.mockRejectedValueOnce(new Error('Unavailable'));
    getAllTeams.mockResolvedValueOnce([{ id: 1, name: 'Team' }]);
    const first = renderHook(() => useTeamsMap());
    await act(async () => {});
    first.unmount();
    const second = renderHook(() => useTeamsMap());
    await act(async () => {});
    expect(second.result.current.Team.id).toBe(1);
    expect(getAllTeams).toHaveBeenCalledTimes(2);
});
