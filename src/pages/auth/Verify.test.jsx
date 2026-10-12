/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Verify from './Verify';
import { resendVerificationEmail, verifyEmail } from '../../api/authApi';

let mockLocation;
jest.mock('react-router-dom', () => ({
    useLocation: () => mockLocation,
    Link: ({ children, to }) => <a href={to}>{children}</a>,
}));
jest.mock('../../api/authApi', () => ({ verifyEmail: jest.fn(), resendVerificationEmail: jest.fn() }));
jest.mock('../../components/layout/PageWrap', () => ({
    __esModule: true,
    default: ({ children }) => <main>{children}</main>,
}));
jest.mock('../../assets/graphics/main_logo.png', () => 'logo');

beforeEach(() => {
    jest.resetAllMocks();
    mockLocation = { search: '?token=first-token&id=1' };
});

test('a previous verification success cannot replace the current failure', async () => {
    let resolveOld;
    verifyEmail
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockResolvedValueOnce(false);
    const { rerender } = render(<Verify />);
    mockLocation = { search: '?token=second-token&id=2' };
    await act(async () => rerender(<Verify />));
    await act(async () => resolveOld(true));
    expect(screen.getByText('Failed to verify email. Please try again.')).toBeTruthy();
    expect(screen.queryByText('Successfully verified user!')).toBeNull();
    expect(verifyEmail.mock.calls).toEqual([['first-token'], ['second-token']]);
});

test('an obsolete failure cannot stop the current verification spinner', async () => {
    let rejectOld;
    verifyEmail
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(<Verify />);
    mockLocation = { search: '?token=second-token&id=2' };
    rerender(<Verify />);
    await act(async () => rejectOld(new Error('old failure')));
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.queryByText('Failed to verify email. Please try again.')).toBeNull();
});

test.each(['success', 'failure'])(
    'obsolete resend %s cannot change another signup or its sending state',
    async (outcome) => {
        let resolveOld;
        let rejectOld;
        verifyEmail.mockResolvedValue(false);
        resendVerificationEmail
            .mockReturnValueOnce(
                new Promise((resolve, reject) => {
                    resolveOld = resolve;
                    rejectOld = reject;
                })
            )
            .mockReturnValueOnce(new Promise(() => {}));
        const { rerender } = render(<Verify />);
        await act(async () => {});
        fireEvent.click(screen.getByRole('button', { name: 'Resend verification email' }));
        mockLocation = { search: '?token=second-token&id=2' };
        await act(async () => rerender(<Verify />));
        fireEvent.click(screen.getByRole('button', { name: 'Resend verification email' }));
        await act(async () => {
            if (outcome === 'success') {
                resolveOld();
            } else {
                rejectOld(new Error('old failure'));
            }
        });
        expect(screen.getByRole('button', { name: 'Sending…' }).disabled).toBe(true);
        expect(screen.queryByText('Verification email has been resent. Please check your email.')).toBeNull();
        expect(screen.queryByText('Error resending verification email. Please try again later.')).toBeNull();
        expect(resendVerificationEmail.mock.calls).toEqual([['1'], ['2']]);
    }
);

test('current resend success retains the existing message', async () => {
    verifyEmail.mockResolvedValue(false);
    resendVerificationEmail.mockResolvedValue({});
    render(<Verify />);
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: 'Resend verification email' }));
    await act(async () => {});
    expect(screen.getByText('Verification email has been resent. Please check your email.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Resend verification email' }).disabled).toBe(false);
});

test('current resend failure retains the existing error and permits another attempt', async () => {
    verifyEmail.mockResolvedValue(false);
    resendVerificationEmail.mockRejectedValue(new Error('Rejected'));
    render(<Verify />);
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: 'Resend verification email' }));
    await act(async () => {});
    expect(screen.getByText('Error resending verification email. Please try again later.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Resend verification email' }).disabled).toBe(false);
});

test('navigation without a query change does not repeat verification', async () => {
    verifyEmail.mockResolvedValue(true);
    const { rerender } = render(<Verify />);
    await act(async () => {});
    mockLocation = { ...mockLocation, hash: '#details' };
    rerender(<Verify />);
    expect(verifyEmail).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Successfully verified user!')).toBeTruthy();
});

test('StrictMode replay cannot apply its discarded verification response', async () => {
    let resolveOld;
    verifyEmail
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockResolvedValueOnce(false);
    render(
        <StrictMode>
            <Verify />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => resolveOld(true));
    expect(screen.getByText('Failed to verify email. Please try again.')).toBeTruthy();
});
