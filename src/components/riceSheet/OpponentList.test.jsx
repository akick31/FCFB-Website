/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import OpponentList from './OpponentList';

const renderList = (props) =>
    render(<OpponentList loading={false} failed={false} onRetry={() => {}} opponents={[]} {...props} />);

test('a failed schedule load offers a retry instead of claiming no games', () => {
    const onRetry = jest.fn();
    renderList({ failed: true, onRetry });
    expect(screen.queryByText('No games scheduled yet.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
});

test('an empty schedule that loaded says no games are scheduled', () => {
    renderList();
    expect(screen.getByText('No games scheduled yet.')).toBeTruthy();
});
