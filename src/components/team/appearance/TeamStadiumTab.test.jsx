/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import TeamStadiumTab from './TeamStadiumTab';
import { pickStadium } from '../../../testUtils/pickStadium';
import { stadiumFixture } from '../../../testUtils/stadiumFixture';
import { assignTeamStadium, getStadiums } from '../../../api/stadiumApi';
jest.mock('../../../api/stadiumApi', () => ({ assignTeamStadium: jest.fn(), getStadiums: jest.fn() }));
jest.mock('../../stadium/StadiumEditor', () => ({
    __esModule: true,
    default: ({ name, headerControls }) => (
        <div>
            {headerControls}
            <div>Editing {name}</div>
        </div>
    ),
}));
jest.mock('../../ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));

beforeEach(() => {
    getStadiums.mockResolvedValue([stadiumFixture('War Memorial Stadium', ['Wyoming']), stadiumFixture('Jonah Field')]);
});

test('building a new stadium points the team at it', async () => {
    assignTeamStadium.mockResolvedValue({ name: 'New War Memorial' });
    const onStadiumChanged = jest.fn();
    render(
        <TeamStadiumTab team="Wyoming" stadium="War Memorial Stadium" canEdit onStadiumChanged={onStadiumChanged} />
    );

    await act(async () => {});
    await pickStadium('Stadium', 'Build a new stadium…');
    fireEvent.change(screen.getByLabelText('New stadium name'), { target: { value: 'New War Memorial' } });
    await act(async () => fireEvent.click(screen.getByText('Build stadium')));

    expect(assignTeamStadium).toHaveBeenCalledWith({ team: 'Wyoming', venue: 'New War Memorial', build_new: true });
    expect(onStadiumChanged).toHaveBeenCalledWith('New War Memorial');
});

test('moving back to an existing stadium does not build anything', async () => {
    assignTeamStadium.mockResolvedValue({ name: 'Jonah Field' });
    render(<TeamStadiumTab team="Wyoming" stadium="War Memorial Stadium" canEdit onStadiumChanged={() => {}} />);

    await act(async () => {});
    await pickStadium('Stadium', 'Jonah Field');
    await act(async () => fireEvent.click(screen.getByText('Move to this stadium')));

    expect(assignTeamStadium).toHaveBeenCalledWith({ team: 'Wyoming', venue: 'Jonah Field', build_new: false });
});
