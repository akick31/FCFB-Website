/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import GamePlaysTable from './GamePlaysTable';

const play = {
    id: 7,
    play_number: 12,
    quarter: 2,
    clock: 343,
    possession: 'HOME',
    down: 3,
    yards_to_go: 4,
    ball_location: 40,
    play_call: 'PASS',
    result: 'GAIN',
    yards: 6,
    home_score: 14,
    away_score: 7,
    offensive_submitter: 'coachA',
};

test('a play row shows the summary and expands to the full details', () => {
    render(<GamePlaysTable plays={[play]} />);
    expect(screen.getByText('5:43')).toBeTruthy();
    expect(screen.getByText('3 & 4')).toBeTruthy();
    expect(screen.queryByText('coachA')).toBeNull();
    fireEvent.click(screen.getByText('GAIN'));
    expect(screen.getByText('coachA')).toBeTruthy();
    fireEvent.click(screen.getByText('GAIN'));
    expect(screen.queryByText('coachA')).toBeNull();
});
