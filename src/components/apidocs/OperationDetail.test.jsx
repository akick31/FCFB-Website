/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import axios from 'axios';
import OperationDetail from './OperationDetail';

jest.mock('axios', () => ({ request: jest.fn() }));
jest.mock('../../api/apiDocsApi', () => ({ backendRoot: 'https://backend.test' }));
jest.mock('./useApiExplorerLookups', () => ({ useApiExplorerLookups: () => ({}) }));
jest.mock('./OperationList', () => ({ MethodBadge: () => null }));
jest.mock('./JsonViewer', () => ({ __esModule: true, default: ({ value }) => <pre>{JSON.stringify(value)}</pre> }));
const operation = { id: 'first', path: '/first', method: 'GET', parameters: [] };
beforeEach(() => jest.resetAllMocks());

test.each(['operation', 'key'])(
    'an obsolete request cannot populate the response after a %s change',
    async (change) => {
        let resolveOld;
        axios.request
            .mockReturnValueOnce(
                new Promise((resolve) => {
                    resolveOld = resolve;
                })
            )
            .mockResolvedValue({ status: 200, data: 'current-result' });
        const { rerender } = render(<OperationDetail operation={operation} apiKey="first-key" />);
        fireEvent.click(screen.getByRole('button', { name: /Send/i }));
        rerender(
            <OperationDetail
                operation={change === 'operation' ? { ...operation, id: 'second', path: '/second' } : operation}
                apiKey="second-key"
            />
        );
        fireEvent.click(screen.getByRole('button', { name: /Send/i }));
        await act(async () => {});
        await act(async () => resolveOld({ status: 200, data: 'old-result' }));
        expect(screen.getByText('"current-result"')).toBeTruthy();
        expect(screen.queryByText('"old-result"')).toBeNull();
    }
);

test('request-body editing retains the JSON payload and current response', async () => {
    axios.request.mockResolvedValue({ status: 201, data: 'created' });
    render(<OperationDetail operation={{ ...operation, method: 'POST', requestBody: {} }} apiKey="test-key" />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '{"name":"Team"}' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    await act(async () => {});
    expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({
            method: 'POST',
            url: 'https://backend.test/first',
            data: { name: 'Team' },
        })
    );
    expect(screen.getByText('"created"')).toBeTruthy();
});

test('invalid JSON preserves the existing form error without making a request', () => {
    render(<OperationDetail operation={{ ...operation, requestBody: {} }} apiKey="test-key" />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '{' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    expect(screen.getByText('Request body is not valid JSON')).toBeTruthy();
    expect(axios.request).not.toHaveBeenCalled();
});
