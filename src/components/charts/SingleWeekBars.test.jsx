/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import SingleWeekBars from './SingleWeekBars';

jest.mock('../ui/TeamMark', () => ({ __esModule: true, default: () => null }));

const lines = [
    { team: 'Wyoming', color: '#492f24', pts: [{ x: 1, val: 3 }] },
    { team: 'Idaho', color: '#b3a369', pts: [{ x: 1, val: 1 }] },
];

test('a poll with one week lists teams best rank first', () => {
    render(<SingleWeekBars lines={lines} invert format={(val) => `#${val}`} />);
    const ranks = screen.getAllByText(/^#\d$/).map((node) => node.textContent);
    expect(ranks).toEqual(['#1', '#3']);
    expect(screen.getByText(/Only one week so far/)).toBeTruthy();
});
