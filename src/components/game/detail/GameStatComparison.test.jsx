/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import GameStatComparison from './GameStatComparison';
import { STAT_GROUPS } from '../../../utils/teamStatFields';

jest.mock('../../ui/TeamMark', () => ({ __esModule: true, default: () => null }));

test('game stats compare one group at a time', () => {
    render(<GameStatComparison awayStats={{}} homeStats={{}} />);
    const [[, firstRows], [secondName, secondRows]] = STAT_GROUPS;
    expect(screen.getByText(firstRows[0].label)).toBeTruthy();
    fireEvent.click(screen.getByRole('tab', { name: secondName }));
    expect(screen.getByText(secondRows[0].label)).toBeTruthy();
    expect(screen.queryByText(firstRows[0].label)).toBeNull();
});
