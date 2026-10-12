import { getFonts } from './fontApi';
import apiClient from './apiClient';

jest.mock('./apiClient', () => ({ get: jest.fn() }));

beforeEach(() => jest.resetAllMocks());

test('font retrieval keeps the returned data unchanged', async () => {
    const fonts = [{ value: 'font', label: 'Font' }];
    apiClient.get.mockResolvedValue({ data: fonts });
    await expect(getFonts()).resolves.toBe(fonts);
    expect(apiClient.get).toHaveBeenCalledWith('/font');
});

test('font retrieval rejects failures instead of representing them as an empty catalog', async () => {
    const error = new Error('Unavailable');
    apiClient.get.mockRejectedValue(error);
    await expect(getFonts()).rejects.toBe(error);
});
