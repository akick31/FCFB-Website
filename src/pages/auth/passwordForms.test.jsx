/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ResetPassword from './ResetPassword';
import ForgotPasswordForm from '../../components/forms/ForgotPasswordForm';
import { resetPassword, forgotPassword } from '../../api/authApi';
jest.mock('../../assets/graphics/main_logo.png', () => 'logo.png');
let mockSearch;
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useLocation: () => ({ search: mockSearch }),
    useNavigate: () => mockNavigate,
    Link: ({ children }) => <span>{children}</span>,
}));
jest.mock('../../api/authApi', () => ({ resetPassword: jest.fn(), forgotPassword: jest.fn() }));
jest.mock('../../components/layout/PageWrap', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
beforeEach(() => {
    jest.resetAllMocks();
    mockSearch = '?userId=A&token=first';
});
const submitReset = () => {
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'StrongPass!' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'StrongPass!' } });
    fireEvent.submit(screen.getByLabelText('New password').closest('form'));
};
const submitForgot = (email = 'coach@example.test') => {
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: email } });
    fireEvent.submit(screen.getByLabelText('Email address').closest('form'));
};

test.each(['success', 'failure'])('an old reset %s cannot affect another reset link', async (outcome) => {
    let finish, reject;
    resetPassword
        .mockReturnValueOnce(
            new Promise((resolve, fail) => {
                finish = resolve;
                reject = fail;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(<ResetPassword />);
    submitReset();
    mockSearch = '?userId=B&token=second';
    rerender(<ResetPassword />);
    expect(screen.getByLabelText('New password').value).toBe('');
    expect(screen.getByRole('button', { name: 'Reset password' }).disabled).toBe(false);
    submitReset();
    await act(async () => (outcome === 'success' ? finish() : reject(new Error('obsolete'))));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.queryByText('obsolete')).toBeNull();
    expect(screen.getByRole('button', { name: 'Resetting…' }).disabled).toBe(true);
    expect(resetPassword.mock.calls).toEqual([
        ['first', 'StrongPass!'],
        ['second', 'StrongPass!'],
    ]);
});

test('reset success after unmount cannot redirect', async () => {
    let finish;
    resetPassword.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    const { unmount } = render(<ResetPassword />);
    submitReset();
    unmount();
    await act(async () => finish());
    expect(mockNavigate).not.toHaveBeenCalled();
});

test('a current reset preserves its token/password payload and login redirect', async () => {
    resetPassword.mockResolvedValueOnce(undefined);
    render(<ResetPassword />);
    await act(async () => submitReset());
    expect(resetPassword).toHaveBeenCalledWith('first', 'StrongPass!');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
});

test('a current reset failure retains the existing error and entered password', async () => {
    resetPassword.mockRejectedValueOnce(new Error('reset unavailable'));
    render(<ResetPassword />);
    await act(async () => submitReset());
    expect(screen.getByText('reset unavailable')).toBeTruthy();
    expect(screen.getByLabelText('New password').value).toBe('StrongPass!');
    expect(screen.getByRole('button', { name: 'Reset password' }).disabled).toBe(false);
});

test('reset strength and confirmation validation still prevent requests', () => {
    render(<ResetPassword />);
    const input = screen.getByLabelText('New password');
    fireEvent.change(input, { target: { value: 'weak' } });
    fireEvent.submit(input.closest('form'));
    expect(screen.getByText('Password must be 8-255 characters with at least one special character.')).toBeTruthy();
    fireEvent.change(input, { target: { value: 'StrongPass!' } });
    fireEvent.submit(input.closest('form'));
    expect(screen.getByText('Passwords do not match')).toBeTruthy();
    expect(resetPassword).not.toHaveBeenCalled();
});

test('missing reset link parameters still redirect to login without a request', () => {
    mockSearch = '?userId=A';
    render(<ResetPassword />);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(resetPassword).not.toHaveBeenCalled();
});

test.each(['success', 'failure'])(
    'a previous forgot-password %s cannot finish a reopened dialog’s request',
    async (outcome) => {
        let finish, reject;
        forgotPassword
            .mockReturnValueOnce(
                new Promise((resolve, fail) => {
                    finish = resolve;
                    reject = fail;
                })
            )
            .mockReturnValueOnce(new Promise(() => {}));
        const props = { onClose: jest.fn() };
        const { rerender } = render(<ForgotPasswordForm {...props} open />);
        submitForgot('first@example.test');
        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(props.onClose).toHaveBeenCalledTimes(1);
        rerender(<ForgotPasswordForm {...props} open={false} />);
        rerender(<ForgotPasswordForm {...props} open />);
        expect(screen.getByLabelText('Email address').value).toBe('');
        submitForgot('second@example.test');
        await act(async () => (outcome === 'success' ? finish() : reject(new Error('obsolete'))));
        expect(screen.queryByText('Check your email')).toBeNull();
        expect(screen.queryByText('obsolete')).toBeNull();
        expect(screen.getByLabelText('Email address').value).toBe('second@example.test');
        expect(screen.getByRole('button', { name: 'Sending…' }).disabled).toBe(true);
    }
);

test('closing forgot-password invalidates pending completion immediately', async () => {
    let finish;
    forgotPassword.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    render(<ForgotPasswordForm open onClose={jest.fn()} />);
    submitForgot();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await act(async () => finish());
    expect(screen.queryByText('Check your email')).toBeNull();
    expect(screen.getByRole('button', { name: 'Send reset link' }).disabled).toBe(false);
});

test('current forgot-password success preserves the entered email payload and success message', async () => {
    forgotPassword.mockResolvedValueOnce(undefined);
    render(<ForgotPasswordForm open onClose={jest.fn()} />);
    await act(async () => submitForgot('coach@example.test'));
    expect(forgotPassword).toHaveBeenCalledWith('coach@example.test');
    expect(screen.getByText('Check your email')).toBeTruthy();
});

test('current forgot-password failure retains its email and failure message', async () => {
    forgotPassword.mockRejectedValueOnce(new Error('email unavailable'));
    render(<ForgotPasswordForm open onClose={jest.fn()} />);
    await act(async () => submitForgot());
    expect(screen.getByLabelText('Email address').value).toBe('coach@example.test');
    expect(screen.getByText('email unavailable')).toBeTruthy();
});
