/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useStoredView from './useStoredView';

afterEach(() => localStorage.clear());

test('the chosen view is remembered in this browser', () => {
    const { result } = renderHook(() => useStoredView('fcfb.view.test'));
    expect(result.current[0]).toBe('cards');
    act(() => result.current[1]('compact'));
    expect(result.current[0]).toBe('compact');
    const { result: again } = renderHook(() => useStoredView('fcfb.view.test'));
    expect(again.current[0]).toBe('compact');
});
