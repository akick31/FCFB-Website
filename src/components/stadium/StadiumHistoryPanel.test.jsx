/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import StadiumHistoryPanel from './StadiumHistoryPanel';
import { getStadiumHistory, revertStadiumChange } from '../../api/stadiumApi';
jest.mock('../../api/stadiumApi', () => ({ getStadiumHistory: jest.fn(), revertStadiumChange: jest.fn() }));
jest.mock('./StadiumPreview', () => ({
    __esModule: true,
    default: ({ design }) => <div>Preview of {design.stadium_backdrop}</div>,
}));
jest.mock('../ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));

const change = {
    id: 3,
    action: 'UPDATE',
    summary: 'Left end, stadium backdrop: MOUNTAINS → LAKE',
    changed_by: 'cowboy',
    changed_at: '2026-10-28T17:00:00',
    before: { name: 'War Memorial Stadium', design: { stadium_backdrop: 'MOUNTAINS' } },
};

test('an earlier version can be previewed and restored after confirming', async () => {
    getStadiumHistory.mockResolvedValue([change]);
    revertStadiumChange.mockResolvedValue({ name: 'War Memorial Stadium' });
    const onReverted = jest.fn();
    render(<StadiumHistoryPanel stadium="War Memorial Stadium" canRevert onReverted={onReverted} />);
    await act(async () => {});

    expect(screen.getByText('Left end, stadium backdrop: MOUNTAINS → LAKE')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Earlier version' }));
    expect(screen.getByText('Preview of MOUNTAINS')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Revert' }));
    expect(revertStadiumChange).not.toHaveBeenCalled();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Yes, go back to the earlier version' })));

    expect(revertStadiumChange).toHaveBeenCalledWith(3);
    expect(onReverted).toHaveBeenCalled();
});

test('people who cannot edit see the history without a revert button', async () => {
    getStadiumHistory.mockResolvedValue([change]);
    render(<StadiumHistoryPanel stadium="War Memorial Stadium" canRevert={false} onReverted={() => {}} />);
    await act(async () => {});
    expect(screen.queryByRole('button', { name: 'Revert' })).toBeNull();
});
