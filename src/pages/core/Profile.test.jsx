/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Profile from './Profile';
import { logout } from '../../api/authApi';
import {
    updateUser,
    updateUsername,
    updatePassword,
    addHistoricalUsername,
    getUserById,
    getUsernameHistory,
} from '../../api/userApi';

let mockParams;
const mockSetParams = jest.fn();
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockParams, mockSetParams],
    Link: ({ children }) => <span>{children}</span>,
}));
jest.mock('../../api/userApi', () => ({
    updateUsername: jest.fn(),
    updateEmail: jest.fn(),
    updatePassword: jest.fn(),
    updateUser: jest.fn(),
    getUserById: jest.fn(),
    getUsernameHistory: jest.fn(),
    addHistoricalUsername: jest.fn(),
}));
jest.mock('../../config/api', () => ({ baseURL: 'https://example.test' }));
jest.mock('../../config/discord', () => ({ clientId: 'client', redirectUri: 'https://example.test/login' }));
jest.mock('../../api/authApi', () => ({ logout: jest.fn() }));
jest.mock('../../api/conferenceApi', () => ({ getConferences: jest.fn().mockResolvedValue([]) }));
jest.mock('../../hooks/useTeamsMap', () => ({ useTeamsMap: () => ({}) }));
jest.mock('../../context/ColorModeContext', () => ({ useColorMode: () => ({ mode: 'dark', setMode: jest.fn() }) }));
jest.mock('../../hooks/useSeo', () => ({ useSeo: () => {} }));
jest.mock('../../components/layout/PageWrap', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/user/ApiKeyPanel', () => ({ __esModule: true, default: () => null }));

const alpha = { id: 1, username: 'Alpha', coach_name: 'Coach Alpha' };
const beta = { id: 2, username: 'Beta', coach_name: 'Coach Beta' };
const edit = (label, value) => {
    const row = screen.getByText(label).parentElement.parentElement;
    fireEvent.click(row.querySelector('button'));
    fireEvent.change(screen.getByPlaceholderText(`New ${label.toLowerCase()}`), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
};
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
    jest.resetAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'synthetic-session');
    mockParams = new URLSearchParams();
    getUsernameHistory.mockResolvedValue([]);
});

test.each(['Coach name', 'Username'])('pending %s save cannot patch a replacement account', async (label) => {
    const api = label === 'Username' ? updateUsername : updateUser;
    const finish = pending(api);
    const setUser = jest.fn();
    const { rerender } = render(<Profile user={alpha} setUser={setUser} />);
    edit(label, 'New name');
    rerender(<Profile user={beta} setUser={setUser} />);
    await finish();
    expect(setUser).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText(`New ${label.toLowerCase()}`)).toBeNull();
    expect(screen.getByText('@Beta')).toBeTruthy();
    expect(api.mock.calls).toEqual(label === 'Username' ? [[1, 'New name']] : [[{ ...alpha, coach_name: 'New name' }]]);
});

test.each(['unmount', 'token change'])('%s invalidates pending profile patches', async (replacement) => {
    const finish = pending(updateUsername);
    const setUser = jest.fn();
    const { unmount } = render(<Profile user={alpha} setUser={setUser} />);
    edit('Username', 'New name');
    if (replacement === 'unmount') {
        unmount();
    } else {
        localStorage.setItem('token', 'replacement-session');
    }
    await finish();
    expect(setUser).not.toHaveBeenCalled();
});

test('current saves update only the captured account even if the state updater runs later', async () => {
    updateUsername.mockResolvedValue(undefined);
    const setUser = jest.fn();
    render(<Profile user={alpha} setUser={setUser} />);
    edit('Username', 'New name');
    await act(async () => {});
    const patch = setUser.mock.calls[0][0];
    expect(patch(alpha)).toEqual({ ...alpha, username: 'New name' });
    expect(patch(beta)).toBe(beta);
    localStorage.removeItem('token');
    expect(patch(alpha)).toBe(alpha);
});

test.each(['account switch', 'unmount', 'token change'])('Discord read is discarded after %s', async (replacement) => {
    mockParams = new URLSearchParams('discordLinked=1&keep=yes');
    const finish = pending(getUserById);
    const setUser = jest.fn();
    const { rerender, unmount } = render(<Profile user={alpha} setUser={setUser} />);
    if (replacement === 'account switch') {
        mockParams = new URLSearchParams('keep=yes');
        rerender(<Profile user={beta} setUser={setUser} />);
    } else if (replacement === 'unmount') {
        unmount();
    } else {
        localStorage.setItem('token', 'replacement-session');
    }
    await finish({ discord_id: 'synthetic-id', discord_tag: 'synthetic-tag' });
    expect(setUser).not.toHaveBeenCalled();
    expect(getUserById).toHaveBeenCalledWith(1);
    expect(mockSetParams.mock.calls[0][0].toString()).toBe('keep=yes');
});

test('current Discord refresh retains its fields and refuses a deferred patch to another account', async () => {
    mockParams = new URLSearchParams('discordLinked=1');
    getUserById.mockResolvedValue({ discord_id: 'synthetic-id', discord_tag: 'synthetic-tag' });
    const setUser = jest.fn();
    render(<Profile user={alpha} setUser={setUser} />);
    await act(async () => {});
    const patch = setUser.mock.calls[0][0];
    expect(patch(alpha)).toEqual({ ...alpha, discord_id: 'synthetic-id', discord_tag: 'synthetic-tag' });
    expect(patch(beta)).toBe(beta);
});

test('account switch replaces history and discards the previous account’s late history', async () => {
    const finish = pending(getUsernameHistory);
    getUsernameHistory.mockResolvedValueOnce(['Beta past']);
    const { rerender } = render(<Profile user={alpha} />);
    await act(async () => rerender(<Profile user={beta} />));
    await finish(['Alpha past']);
    expect(screen.getByText('Beta past')).toBeTruthy();
    expect(screen.queryByText('Alpha past')).toBeNull();
});

test('StrictMode history replay discards the earlier read', async () => {
    const finish = pending(getUsernameHistory);
    getUsernameHistory.mockResolvedValueOnce(['Current past']);
    render(
        <StrictMode>
            <Profile user={alpha} />
        </StrictMode>
    );
    await act(async () => {});
    await finish(['Obsolete past']);
    expect(screen.getByText('Current past')).toBeTruthy();
    expect(screen.queryByText('Obsolete past')).toBeNull();
});

test('history completion cannot publish after the session token changes', async () => {
    const finish = pending(getUsernameHistory);
    render(<Profile user={alpha} />);
    localStorage.setItem('token', 'replacement-session');
    await finish(['Previous session history']);
    expect(screen.queryByText('Previous session history')).toBeNull();
    expect(screen.getByText('None on record')).toBeTruthy();
});

test('current profile failure preserves the entered value and existing error', async () => {
    updateUsername.mockRejectedValueOnce(new Error('username unavailable'));
    const setUser = jest.fn();
    render(<Profile user={alpha} setUser={setUser} />);
    edit('Username', 'New name');
    await act(async () => {});
    expect(screen.getByText('username unavailable')).toBeTruthy();
    expect(screen.getByPlaceholderText('New username').value).toBe('New name');
    expect(screen.getByRole('button', { name: 'Save' }).disabled).toBe(false);
    expect(setUser).not.toHaveBeenCalled();
});

test('current history read failure retains the existing empty fallback', async () => {
    getUsernameHistory.mockRejectedValueOnce(new Error('history unavailable'));
    render(<Profile user={alpha} />);
    await act(async () => {});
    expect(screen.getByText('None on record')).toBeTruthy();
    expect(screen.queryByText('history unavailable')).toBeNull();
});

const toggleRow = (label) =>
    fireEvent.click(screen.getByText(label).parentElement.parentElement.querySelector('button'));
const fillEditor = (kind, value) => {
    if (kind === 'Password') {
        fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'Synthetic old!' } });
        fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value } });
    } else {
        const placeholder = kind === 'Past usernames' ? 'A username you used to have' : 'New username';
        fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value } });
    }
};

test.each([
    ['Username', 'success'],
    ['Username', 'failure'],
    ['Password', 'success'],
    ['Password', 'failure'],
    ['Past usernames', 'success'],
    ['Past usernames', 'failure'],
])('%s editor ignores an older %s after cancel/reopen', async (kind, outcome) => {
    const api =
        kind === 'Password' ? updatePassword : kind === 'Past usernames' ? addHistoricalUsername : updateUsername;
    let resolve, reject;
    api.mockReturnValueOnce(
        new Promise((finish, fail) => {
            resolve = finish;
            reject = fail;
        })
    );
    api.mockReturnValueOnce(new Promise(() => {}));
    render(<Profile user={alpha} setUser={jest.fn()} />);
    await act(async () => {});
    toggleRow(kind);
    fillEditor(kind, 'First submitted!');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    toggleRow(kind);
    toggleRow(kind);
    expect(screen.getByRole('button', { name: 'Save' }).disabled).toBe(false);
    fillEditor(kind, 'New draft!');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await act(async () => (outcome === 'success' ? resolve() : reject(new Error('obsolete failure'))));
    const placeholder =
        kind === 'Password'
            ? 'New password'
            : kind === 'Past usernames'
              ? 'A username you used to have'
              : 'New username';
    expect(screen.getByPlaceholderText(placeholder).value).toBe('New draft!');
    expect(screen.getByRole('button', { name: 'Saving…' }).disabled).toBe(true);
    expect(screen.queryByText('obsolete failure')).toBeNull();
    expect(Boolean(screen.queryByText('First submitted!'))).toBe(kind === 'Past usernames' && outcome === 'success');
});

test.each(['success', 'failure', 'already included'])(
    'late history read %s preserves a completed addition',
    async (outcome) => {
        let resolve, reject;
        getUsernameHistory.mockReturnValueOnce(
            new Promise((finish, fail) => {
                resolve = finish;
                reject = fail;
            })
        );
        addHistoricalUsername.mockResolvedValue(undefined);
        render(<Profile user={alpha} />);
        toggleRow('Past usernames');
        fillEditor('Past usernames', 'Added name');
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        await act(async () => {});
        await act(async () =>
            outcome === 'failure'
                ? reject(new Error('history unavailable'))
                : resolve(outcome === 'already included' ? ['Old name', 'Added name'] : ['Old name'])
        );
        expect(screen.getByText(outcome === 'failure' ? 'Added name' : 'Old name, Added name')).toBeTruthy();
        expect(addHistoricalUsername).toHaveBeenCalledWith(1, 'Added name');
    }
);

test('current password save retains its payload and closes its editor', async () => {
    updatePassword.mockResolvedValue(undefined);
    render(<Profile user={alpha} />);
    toggleRow('Password');
    fillEditor('Password', 'Synthetic next!');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await act(async () => {});
    expect(updatePassword).toHaveBeenCalledWith(1, 'Synthetic old!', 'Synthetic next!');
    expect(screen.queryByPlaceholderText('New password')).toBeNull();
});

test.each(['unmount', 'account switch', 'token change'])(
    'pending logout cannot navigate after %s',
    async (replacement) => {
        const finish = pending(logout);
        const props = { setUser: jest.fn(), setIsAuthenticated: jest.fn(), setIsAdmin: jest.fn() };
        const { rerender, unmount } = render(<Profile {...props} user={alpha} />);
        fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
        if (replacement === 'unmount') {
            unmount();
        } else if (replacement === 'account switch') {
            rerender(<Profile {...props} user={beta} />);
        } else {
            localStorage.setItem('token', 'replacement-session');
        }
        await finish();
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(logout).toHaveBeenCalledWith(props.setIsAuthenticated, props.setUser, props.setIsAdmin);
    }
);

test('successful current logout still navigates when its own session and user are cleared', async () => {
    const finish = pending(logout);
    const { rerender } = render(<Profile user={alpha} />);
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    localStorage.removeItem('token');
    rerender(<Profile user={null} />);
    await finish();
    expect(mockNavigate).toHaveBeenCalledWith('/');
});

test('current logout failure retains its fixed diagnostic and existing home redirect', async () => {
    logout.mockRejectedValueOnce(new Error('synthetic sensitive detail'));
    const diagnostic = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        render(<Profile user={alpha} />);
        fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
        await act(async () => {});
        expect(diagnostic.mock.calls).toEqual([['Logout request failed.']]);
        expect(mockNavigate).toHaveBeenCalledWith('/');
    } finally {
        diagnostic.mockRestore();
    }
});
