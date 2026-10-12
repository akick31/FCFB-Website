/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import axios from 'axios';
import { useApiExplorerLookups } from './useApiExplorerLookups';

jest.mock('axios', () => ({ get: jest.fn() }));
jest.mock('../../api/apiDocsApi', () => ({ backendRoot: 'https://backend.test' }));
jest.mock('../../utils/statsCatalog', () => ({ seasonHasStarted: (season) => season.started }));
const operation = { path: '/user', parameters: [] };
beforeEach(() => {
    jest.resetAllMocks();
    axios.get.mockImplementation(async (url) => ({
        data: url.endsWith('/season/current') ? { season_number: 12 } : [],
    }));
});

test('a key change resets lookups and ignores previous-key responses', async () => {
    let resolveOld;
    axios.get.mockImplementation((url, config) => {
        if (url.endsWith('/team/all')) {
            if (config.headers['X-Api-Key'] === 'old') {
                return new Promise((resolve) => {
                    resolveOld = resolve;
                });
            }
            return Promise.resolve({ data: [{ name: 'Current' }] });
        }
        return Promise.resolve({ data: [] });
    });
    const { result, rerender } = renderHook(({ apiKey }) => useApiExplorerLookups(operation, apiKey), {
        initialProps: { apiKey: 'old' },
    });
    await act(async () => {});
    await act(async () => rerender({ apiKey: 'new' }));
    await act(async () => resolveOld({ data: [{ name: 'Old' }] }));
    expect(result.current.rawTeams).toEqual([{ name: 'Current' }]);
});

test('optional results from an obsolete operation cannot populate the cache', async () => {
    let resolveScenarios;
    axios.get.mockImplementation((url) =>
        url.endsWith('/game_writeup/scenarios')
            ? new Promise((resolve) => {
                  resolveScenarios = resolve;
              })
            : Promise.resolve({ data: [] })
    );
    const scenarioOperation = { path: '/game_writeup', parameters: [{ name: 'scenario' }] };
    const { result, rerender } = renderHook(({ selected }) => useApiExplorerLookups(selected, 'key'), {
        initialProps: { selected: scenarioOperation },
    });
    await act(async () => {});
    rerender({ selected: operation });
    await act(async () => resolveScenarios({ data: ['old'] }));
    expect(result.current.scenarios).toEqual([]);
});

test('current season failure falls back to the newest started season', async () => {
    axios.get.mockImplementation((url) => {
        if (url.endsWith('/season/all')) {
            return Promise.resolve({
                data: [
                    { season_number: 11, started: true },
                    { season_number: 12, started: true },
                    { season_number: 13, started: false },
                ],
            });
        }
        if (url.endsWith('/season/current')) {
            return Promise.reject(new Error('unavailable'));
        }
        return Promise.resolve({ data: [] });
    });
    const { result } = renderHook(() => useApiExplorerLookups(operation, 'key'));
    await act(async () => {});
    expect(result.current.seasons).toEqual([12, 11]);
    expect(result.current.currentSeasonNumber).toBe(12);
});
