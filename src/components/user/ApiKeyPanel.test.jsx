/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ApiKeyPanel from './ApiKeyPanel';
import { generateApiKey, revokeApiKey } from '../../api/userApi';

jest.mock('../../api/userApi', () => ({ generateApiKey: jest.fn(), revokeApiKey: jest.fn() }));
jest.mock('react-router-dom', () => ({ Link: ({ children, to }) => <a href={to}>{children}</a> }));
jest.mock('../ui/Panel', () => ({ __esModule: true, default: ({ children }) => <section>{children}</section> }));

beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'first-session');
    generateApiKey.mockResolvedValue('test-key');
    revokeApiKey.mockResolvedValue({});
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: jest.fn().mockResolvedValue() },
    });
});
afterEach(() => {
    jest.useRealTimers();
    delete navigator.clipboard;
});

const generate = async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Generate API key' }));
    await act(async () => {});
};

test('current generation and revocation retain their storage behavior', async () => {
    render(<ApiKeyPanel />);
    await generate();
    expect(screen.getByText('test-key')).toBeTruthy();
    expect(localStorage.getItem('apiKey')).toBe('test-key');
    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));
    await act(async () => {});
    expect(localStorage.getItem('apiKey')).toBeNull();
    expect(screen.getByRole('button', { name: 'Generate API key' })).toBeTruthy();
});

test.each(['changed', 'removed'])('generation cannot write a key after its session is %s', async (sessionChange) => {
    let resolveKey;
    generateApiKey.mockReturnValue(
        new Promise((resolve) => {
            resolveKey = resolve;
        })
    );
    render(<ApiKeyPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate API key' }));
    if (sessionChange === 'changed') {
        localStorage.setItem('token', 'second-session');
    } else {
        localStorage.removeItem('token');
    }
    localStorage.setItem('apiKey', 'current-key');
    await act(async () => resolveKey('old-key'));
    expect(localStorage.getItem('apiKey')).toBe('current-key');
    expect(screen.queryByText('old-key')).toBeNull();
    expect(screen.getByRole('button', { name: 'Generate API key' }).disabled).toBe(false);
});

test('generation after unmount cannot overwrite stored explorer credentials', async () => {
    let resolveKey;
    generateApiKey.mockReturnValue(
        new Promise((resolve) => {
            resolveKey = resolve;
        })
    );
    const { unmount } = render(<ApiKeyPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate API key' }));
    unmount();
    localStorage.setItem('apiKey', 'current-key');
    await act(async () => resolveKey('old-key'));
    expect(localStorage.getItem('apiKey')).toBe('current-key');
});

test('revocation completion from a replaced session cannot remove its stored key', async () => {
    let resolveRevoke;
    revokeApiKey.mockReturnValue(
        new Promise((resolve) => {
            resolveRevoke = resolve;
        })
    );
    render(<ApiKeyPanel />);
    await generate();
    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));
    localStorage.setItem('token', 'second-session');
    localStorage.setItem('apiKey', 'current-key');
    await act(async () => resolveRevoke());
    expect(localStorage.getItem('apiKey')).toBe('current-key');
});

test('revocation completion after unmount cannot remove stored explorer credentials', async () => {
    let resolveRevoke;
    revokeApiKey.mockReturnValue(
        new Promise((resolve) => {
            resolveRevoke = resolve;
        })
    );
    const { unmount } = render(<ApiKeyPanel />);
    await generate();
    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));
    unmount();
    localStorage.setItem('apiKey', 'current-key');
    await act(async () => resolveRevoke());
    expect(localStorage.getItem('apiKey')).toBe('current-key');
});

test('copy confirms success only after the clipboard resolves', async () => {
    let resolveCopy;
    navigator.clipboard.writeText.mockReturnValue(
        new Promise((resolve) => {
            resolveCopy = resolve;
        })
    );
    render(<ApiKeyPanel />);
    await generate();
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull();
    await act(async () => resolveCopy());
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-key');
});

test.each(['rejected', 'unavailable'])(
    'a %s clipboard reports failure without claiming the key was copied',
    async (failure) => {
        if (failure === 'rejected') {
            navigator.clipboard.writeText.mockRejectedValue(new Error('Not allowed'));
        } else {
            delete navigator.clipboard;
        }
        render(<ApiKeyPanel />);
        await generate();
        fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
        await act(async () => {});
        expect(screen.getByText('Failed to copy API key')).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull();
    }
);

test('old copy completion cannot label a rotated key as copied', async () => {
    let resolveCopy;
    navigator.clipboard.writeText.mockReturnValue(
        new Promise((resolve) => {
            resolveCopy = resolve;
        })
    );
    generateApiKey.mockResolvedValueOnce('first-key').mockResolvedValueOnce('second-key');
    render(<ApiKeyPanel />);
    await generate();
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    fireEvent.click(screen.getByRole('button', { name: 'Rotate key' }));
    await act(async () => {});
    await act(async () => resolveCopy());
    expect(screen.getByText('second-key')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull();
});

test('copy timers are cleared when the panel unmounts', async () => {
    jest.useFakeTimers();
    const { unmount } = render(<ApiKeyPanel />);
    await generate();
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await act(async () => {});
    const clearTimer = jest.spyOn(global, 'clearTimeout');
    unmount();
    expect(clearTimer).toHaveBeenCalled();
    clearTimer.mockRestore();
});

test('current generation errors retain the original error area and stop busy state', async () => {
    generateApiKey.mockRejectedValue(new Error('Rejected'));
    render(<ApiKeyPanel />);
    await generate();
    expect(screen.getByText('Rejected')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Generate API key' }).disabled).toBe(false);
});
