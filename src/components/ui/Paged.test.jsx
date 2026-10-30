/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Paged from './Paged';

test('long lists show one page of rows with a footer to move between pages', () => {
    const rows = Array.from({ length: 30 }, (_, index) => `row ${index + 1}`);
    render(
        <Paged rows={rows} pageSize={10} noun="rows">
            {(pageRows) => (
                <ul>
                    {pageRows.map((row) => (
                        <li key={row}>{row}</li>
                    ))}
                </ul>
            )}
        </Paged>
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(10);
    expect(screen.getByText('1-10 of 30 rows')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('row 11')).toBeTruthy();
});
