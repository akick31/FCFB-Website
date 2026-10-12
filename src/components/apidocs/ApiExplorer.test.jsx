/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, render, screen } from '@testing-library/react';
import ApiExplorer from './ApiExplorer';
import { getPublicApiSpec, getAdminApiSpec } from '../../api/apiDocsApi';

jest.mock('../../api/apiDocsApi', () => ({ getPublicApiSpec: jest.fn(), getAdminApiSpec: jest.fn() }));
jest.mock('./ApiKeyBar', () => ({ __esModule: true, default: () => null }));
jest.mock('./OperationDetail', () => ({ __esModule: true, default: () => null }));
jest.mock('./OperationList', () => ({
    __esModule: true,
    default: ({ groups }) => (
        <div>{groups.flatMap(([, operations]) => operations.map((op) => <span key={op.id}>{op.summary}</span>))}</div>
    ),
}));

const spec = (summary) => ({ paths: { '/example': { get: { summary } } } });
const deferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((yes, no) => {
        resolve = yes;
        reject = no;
    });
    return { promise, resolve, reject };
};

beforeEach(() => {
    getPublicApiSpec.mockReset().mockResolvedValue(spec('Current endpoint'));
    getAdminApiSpec.mockReset().mockResolvedValue(spec('Admin endpoint'));
});

test.each(['success', 'failure'])('discarded spec %s cannot replace current endpoints', async (outcome) => {
    const older = deferred();
    getPublicApiSpec.mockReturnValueOnce(older.promise);
    render(
        <StrictMode>
            <ApiExplorer specKind="public" />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => {
        if (outcome === 'success') {
            older.resolve(spec('Obsolete endpoint'));
        } else {
            older.reject(new Error('Obsolete failure'));
        }
    });
    expect(screen.getByText('Current endpoint')).toBeTruthy();
    expect(screen.queryByText('Obsolete endpoint')).toBeNull();
    expect(screen.queryByText('Obsolete failure')).toBeNull();
});

test('discarded spec completion cannot stop the current spinner', async () => {
    const older = deferred();
    const current = deferred();
    getPublicApiSpec.mockReturnValueOnce(older.promise).mockReturnValueOnce(current.promise);
    render(
        <StrictMode>
            <ApiExplorer specKind="public" />
        </StrictMode>
    );
    await act(async () => older.resolve(spec('Older endpoint')));
    expect(screen.getByRole('progressbar')).toBeTruthy();
    await act(async () => current.resolve(spec('Current endpoint')));
    expect(screen.getByText('Current endpoint')).toBeTruthy();
});

test('current spec failure preserves the existing alert', async () => {
    getPublicApiSpec.mockRejectedValue(new Error('Spec unavailable'));
    render(<ApiExplorer specKind="public" />);
    await act(async () => {});
    expect(screen.getByRole('alert').textContent).toBe('Spec unavailable');
    expect(screen.queryByRole('progressbar')).toBeNull();
});
