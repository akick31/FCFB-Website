/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ConferenceScheduleGrid from './ConferenceScheduleGrid';

jest.mock('../ui/TeamMark', () => ({ __esModule: true, default: () => null }));

const props = {
    selectedConference: 'MOUNTAIN_WEST',
    conferenceTeams: [
        { name: 'Wyoming', abbreviation: 'WYO' },
        { name: 'Boise State', abbreviation: 'BSU' },
    ],
    teamMap: {},
    numConferenceGames: 8,
    onEmptyCellClick: jest.fn(),
    onFilledCellClick: jest.fn(),
    onGameDrop: jest.fn(),
};

const game = (home, away) => ({
    home_team: home,
    away_team: away,
    week: 1,
    game_type: 'CONFERENCE_GAME',
    season: 12,
});

test('teams short on conference games are flagged', () => {
    render(<ConferenceScheduleGrid {...props} conferenceSchedule={[game('Wyoming', 'Boise State')]} />);
    expect(screen.getByText(/Short on conference games/)).toBeTruthy();
});

test('a schedule still loaded from the previous conference flags nobody', () => {
    render(<ConferenceScheduleGrid {...props} conferenceSchedule={[game('Clemson', 'Duke')]} />);
    expect(screen.queryByText(/Short on conference games/)).toBeNull();
});
