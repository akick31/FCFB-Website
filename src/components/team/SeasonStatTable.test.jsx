/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import SeasonStatTable from './SeasonStatTable';
import { STAT_GROUPS } from '../../utils/teamStatFields';

test('stats show one group at a time, switched by the group tabs', () => {
    render(<SeasonStatTable stats={{}} />);
    const [[firstName, firstRows], [secondName, secondRows]] = STAT_GROUPS;
    expect(screen.getByRole('tab', { name: firstName }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText(firstRows[0].label)).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: secondName }));
    expect(screen.getByText(secondRows[0].label)).toBeTruthy();
    expect(screen.queryByText(firstRows[0].label)).toBeNull();
});
