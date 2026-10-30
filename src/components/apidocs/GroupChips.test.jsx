/** @jest-environment jsdom */
import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import GroupChips from './GroupChips';

const groups = [
    ['Games', [{}, {}]],
    ['Teams', [{}]],
];

const Harness = () => {
    const [picked, setPicked] = useState([]);
    return <GroupChips groups={groups} picked={picked} onChange={setPicked} />;
};

const pressed = (name) => screen.getByRole('button', { name }).getAttribute('aria-pressed');

test('groups toggle independently and All resets the selection', () => {
    render(<Harness />);
    expect(pressed('All')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Games (2)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Teams (1)' }));
    expect(pressed('Games (2)')).toBe('true');
    expect(pressed('Teams (1)')).toBe('true');
    expect(pressed('All')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'Games (2)' }));
    expect(pressed('Games (2)')).toBe('false');
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(pressed('Teams (1)')).toBe('false');
    expect(pressed('All')).toBe('true');
});
