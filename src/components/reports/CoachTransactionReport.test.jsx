/** @jest-environment jsdom */
import React, { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CoachTransactionReport from './CoachTransactionReport';

jest.mock('react-router-dom', () => {
    global.TextEncoder = require('util').TextEncoder;
    return jest.requireActual('react-router-dom');
});
jest.mock('../ui/TeamMark', () => ({ __esModule: true, default: () => null }));

const move = (team, day, transaction = 'HIRED', coach = 'coach') => ({
    team,
    position: 'HEAD_COACH',
    coach: [coach],
    transaction,
    transaction_date: `2026-01-${String(day).padStart(2, '0')}T12:00:00`,
    processed_by: 'admin',
});

const Harness = ({ transactions }) => {
    const [filters, setFilters] = useState({ q: '', team: 'ALL', position: 'ALL', type: 'ALL' });
    return (
        <MemoryRouter>
            <CoachTransactionReport
                transactions={transactions}
                filters={filters}
                onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            />
        </MemoryRouter>
    );
};

test('the feed lists the newest moves first', () => {
    render(<Harness transactions={[move('Alpha', 1, 'HIRED', 'old'), move('Beta', 20, 'FIRED', 'new')]} />);
    const coaches = screen.getAllByRole('link').map((link) => link.textContent);
    expect(coaches).toEqual(['@new', '@old']);
});

test('the table view pages the moves to fit the window', () => {
    const transactions = Array.from({ length: 60 }, (_, index) => move('Alpha', (index % 28) + 1));
    render(<Harness transactions={transactions} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Table' }));
    const [, shown] = screen.getByText(/of 60 transactions/).textContent.match(/^1-(\d+) of 60/);
    expect(Number(shown)).toBeLessThan(60);
    expect(screen.getAllByRole('row')).toHaveLength(Number(shown) + 1);
    expect(screen.getByText('60 total')).toBeTruthy();
});

test('searching filters by coach and resets to the first page', () => {
    render(<Harness transactions={[move('Alpha', 1, 'HIRED', 'keep'), move('Beta', 2, 'HIRED', 'drop')]} />);
    fireEvent.change(screen.getByLabelText('Search transactions'), { target: { value: 'kee' } });
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(['@keep']);
});

test('clicking a team opens its coaching history', () => {
    render(
        <Harness
            transactions={[move('Alpha', 1, 'HIRED', 'first'), move('Alpha', 9, 'FIRED', 'first'), move('Beta', 3)]}
        />
    );
    fireEvent.click(screen.getAllByTitle('Alpha coaching history')[0]);
    const drawer = screen.getByRole('presentation');
    expect(within(drawer).getAllByRole('listitem')).toHaveLength(2);
    expect(within(drawer).getByText('Alpha coaching history')).toBeTruthy();
});
