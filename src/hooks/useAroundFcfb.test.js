/** @jest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import useAroundFcfb from './useAroundFcfb';
import { getCurrentSeason, getCurrentWeek } from '../api/seasonApi';
import { getHistoryWeek } from '../api/historyApi';

jest.mock('../api/seasonApi');
jest.mock('../api/historyApi');

test('the current week is unwrapped from the season API object', async () => {
    getCurrentSeason.mockResolvedValue(12);
    getCurrentWeek.mockResolvedValue({ week: 9 });
    getHistoryWeek.mockResolvedValue({ games: [] });
    const { result } = renderHook(() => useAroundFcfb());
    await waitFor(() => expect(result.current).toEqual({ games: [] }));
    expect(getHistoryWeek).toHaveBeenCalledWith(12, 9);
});
