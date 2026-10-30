/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import OpenJobsPanel from './OpenJobsPanel';

jest.mock('react-router-dom', () => ({ Link: ({ to, children }) => <a href={to}>{children}</a> }));
jest.mock('../ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../ui/ConferenceMark', () => ({ __esModule: true, default: () => null }));

const teams = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    name: `Team ${index + 1}`,
    conference: 'MW',
}));

test('open programs list links to each team and to the full list, with an apply link for visitors', () => {
    render(<OpenJobsPanel teams={teams} signedIn={false} />);
    expect(screen.getByText('12 programs need a head coach').closest('a').getAttribute('href')).toBe('/teams/all/open');
    expect(screen.getByText('Apply to coach').closest('a').getAttribute('href')).toBe('/register');
    expect(screen.getByText('Team 1').closest('a').getAttribute('href')).toBe('/team-details/1');
});

test('signed-in coaches are not asked to apply', () => {
    render(<OpenJobsPanel teams={teams.slice(0, 2)} signedIn />);
    expect(screen.queryByText('Apply to coach')).toBeNull();
    expect(screen.queryByText(/open programs$/)).toBeNull();
});
