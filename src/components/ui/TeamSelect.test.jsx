/** @jest-environment jsdom */
import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import TeamSelect from './TeamSelect';
import { pickTeam } from '../../testUtils/pickTeam';

jest.mock('./TeamMark', () => ({ __esModule: true, default: () => null }));

const Harness = ({ noneLabel }) => {
    const [value, setValue] = useState('');
    return (
        <>
            <TeamSelect
                value={value}
                onChange={setValue}
                teams={['Yale', 'Alabama', 'Yale']}
                ariaLabel="Team"
                noneLabel={noneLabel}
            />
            <span data-testid="picked">{value}</span>
        </>
    );
};

test('options are unique, sorted and pickable', async () => {
    render(<Harness />);
    fireEvent.mouseDown(screen.getByLabelText('Team'));
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Alabama', 'Yale']);
    fireEvent.click(screen.getByRole('option', { name: 'Yale' }));
    expect(screen.getByTestId('picked').textContent).toBe('Yale');
});

test('typing filters teams', () => {
    render(<Harness />);
    fireEvent.focus(screen.getByLabelText('Team'));
    fireEvent.change(screen.getByLabelText('Team'), { target: { value: 'ala' } });
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Alabama']);
});

test('a none option clears the choice', async () => {
    render(<Harness noneLabel="Free agent" />);
    await pickTeam('Team', 'Alabama');
    await pickTeam('Team', 'Free agent');
    expect(screen.getByTestId('picked').textContent).toBe('');
});
