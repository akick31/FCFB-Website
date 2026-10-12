/** @jest-environment jsdom */
import * as React from 'react';
import { act, renderHook } from '@testing-library/react';
import { getFonts } from '../../../api/fontApi';

jest.mock('../../../api/fontApi', () => ({ getFonts: jest.fn() }));

let useFonts;
let registerUploadedFont;
let removeFont;

beforeEach(() => {
    jest.resetAllMocks();
    jest.isolateModules(() => {
        jest.doMock('react', () => React);
        jest.doMock('../../../api/fontApi', () => ({ getFonts }));
        ({ useFonts, registerUploadedFont, removeFont } = require('./fontStore'));
    });
});

test('failed font loads remain retryable on the next mount', async () => {
    getFonts.mockRejectedValueOnce(new Error('Unavailable'));
    getFonts.mockResolvedValueOnce([{ value: 'recovered', label: 'Recovered' }]);
    const first = renderHook(() => useFonts());
    await act(async () => {});
    expect(first.result.current).toEqual([]);
    first.unmount();
    const second = renderHook(() => useFonts());
    await act(async () => {});
    expect(getFonts).toHaveBeenCalledTimes(2);
    expect(second.result.current).toEqual([{ value: 'recovered', label: 'Recovered' }]);
});

test('concurrent font consumers share one request and warm mounts reuse the result', async () => {
    let resolveFonts;
    getFonts.mockReturnValue(
        new Promise((resolve) => {
            resolveFonts = resolve;
        })
    );
    const first = renderHook(() => useFonts());
    const second = renderHook(() => useFonts());
    expect(getFonts).toHaveBeenCalledTimes(1);
    const fonts = [{ value: 'font', label: 'Font' }];
    await act(async () => resolveFonts(fonts));
    expect(first.result.current).toEqual(fonts);
    expect(second.result.current).toEqual(fonts);
    const warm = renderHook(() => useFonts());
    await act(async () => {});
    expect(warm.result.current).toEqual(fonts);
    expect(getFonts).toHaveBeenCalledTimes(1);
});

test('a successful empty catalog is cached without unnecessary repeat requests', async () => {
    getFonts.mockResolvedValue([]);
    const first = renderHook(() => useFonts());
    await act(async () => {});
    first.unmount();
    renderHook(() => useFonts());
    await act(async () => {});
    expect(getFonts).toHaveBeenCalledTimes(1);
});

test('upload registration and removal retain sorted subscriber updates', async () => {
    getFonts.mockResolvedValue([{ value: 'z', label: 'Zulu' }]);
    const { result } = renderHook(() => useFonts());
    await act(async () => {});
    act(() => registerUploadedFont({ value: 'a', label: 'Alpha' }));
    expect(result.current.map((font) => font.value)).toEqual(['a', 'z']);
    act(() => removeFont('z'));
    expect(result.current).toEqual([{ value: 'a', label: 'Alpha' }]);
});

test('a failed pending fetch cannot erase a font registered while it was loading', async () => {
    let rejectFonts;
    getFonts.mockReturnValue(
        new Promise((resolve, reject) => {
            rejectFonts = reject;
        })
    );
    const { result } = renderHook(() => useFonts());
    act(() => registerUploadedFont({ value: 'uploaded', label: 'Uploaded' }));
    await act(async () => rejectFonts(new Error('Unavailable')));
    expect(result.current).toEqual([{ value: 'uploaded', label: 'Uploaded' }]);
});

test('font loading can finish after all subscribers unmount and warm the next mount', async () => {
    let resolveFonts;
    getFonts.mockReturnValue(
        new Promise((resolve) => {
            resolveFonts = resolve;
        })
    );
    const first = renderHook(() => useFonts());
    first.unmount();
    await act(async () => resolveFonts([{ value: 'font', label: 'Font' }]));
    const next = renderHook(() => useFonts());
    await act(async () => {});
    expect(next.result.current).toEqual([{ value: 'font', label: 'Font' }]);
    expect(getFonts).toHaveBeenCalledTimes(1);
});
