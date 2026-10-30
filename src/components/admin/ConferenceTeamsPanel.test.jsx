/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ConferenceTeamsPanel from './ConferenceTeamsPanel';

jest.mock('react-router-dom', () => ({ Link: ({ children }) => <span>{children}</span> }));
jest.mock('../ui/TeamMark', () => ({ __esModule: true, default: () => null }));

const teams = [
    { id: 1, name: 'Wyoming', conference: 'MOUNTAIN_WEST', active: true },
    { id: 2, name: 'Montana', conference: 'BIG_SKY', active: true },
    { id: 3, name: 'Idaho', conference: null, active: true },
];
const conferences = [
    { code: 'MOUNTAIN_WEST', label: 'Mountain West', active: true },
    { code: 'BIG_SKY', label: 'Big Sky', active: true },
];

test('a team from another conference is picked from the team list and added', async () => {
    const onAddTeam = jest.fn();
    render(
        <ConferenceTeamsPanel
            code="MOUNTAIN_WEST"
            conference={conferences[0]}
            conferences={conferences}
            teams={teams}
            divisions={[]}
            divisionsEnabled={false}
            pendingTeam={null}
            onMoveTeam={jest.fn()}
            onUpdateTeamDivision={jest.fn()}
            onRemoveFromConference={jest.fn()}
            onAddTeam={onAddTeam}
        />
    );
    expect(screen.getByRole('button', { name: '+ Add' }).disabled).toBe(true);
    fireEvent.mouseDown(screen.getByLabelText('Team to add'));
    expect(await screen.findByRole('option', { name: /Idaho/ })).toBeTruthy();
    expect(screen.queryByRole('option', { name: /Wyoming/ })).toBeNull();
    fireEvent.click(screen.getByRole('option', { name: /Montana/ }));
    fireEvent.click(screen.getByRole('button', { name: '+ Add' }));
    expect(onAddTeam).toHaveBeenCalledWith(teams[1]);
});
