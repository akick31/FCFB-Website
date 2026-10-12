/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import UserManagement from './UserManagement';
import { getAllUsers } from '../../api/userApi';

jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
    Link: ({ children }) => <span>{children}</span>,
}));
jest.mock('../../api/userApi', () => ({ getAllUsers: jest.fn() }));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/ui/DataTable', () => ({
    __esModule: true,
    default: ({ children }) => <table>{children}</table>,
}));
jest.mock('../../components/ui/LinkCell', () => ({
    __esModule: true,
    default: ({ children }) => <td>{children}</td>,
}));
jest.mock('../../components/ui/SelectPill', () => ({ __esModule: true, default: () => null }));
const page = <UserManagement user={{ role: 'ADMIN' }} />;
beforeEach(() => {
    jest.resetAllMocks();
    getAllUsers.mockResolvedValue([{ id: 1, username: 'Current', role: 'USER' }]);
});

test('StrictMode obsolete success cannot replace current directory rows', async () => {
    let resolveOld;
    getAllUsers.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    render(<StrictMode>{page}</StrictMode>);
    await act(async () => {});
    await act(async () => resolveOld([{ id: 2, username: 'Obsolete', role: 'USER' }]));
    expect(screen.getByRole('cell', { name: '@Current' })).toBeTruthy();
    expect(screen.queryByRole('cell', { name: '@Obsolete' })).toBeNull();
});

test('StrictMode obsolete failure cannot end current loading or report an error', async () => {
    let rejectOld;
    getAllUsers
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    render(<StrictMode>{page}</StrictMode>);
    await act(async () => rejectOld(new Error('Obsolete failure')));
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.queryByText('Obsolete failure')).toBeNull();
});

test('current failures retain the existing user-visible message', async () => {
    getAllUsers.mockRejectedValueOnce(new Error('Directory unavailable'));
    render(page);
    await act(async () => {});
    expect(screen.getByText('Directory unavailable')).toBeTruthy();
});
