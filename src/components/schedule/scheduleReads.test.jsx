/** @jest-environment jsdom */
import React from 'react';
import { renderToString } from 'react-dom/server.node';
import { render } from '@testing-library/react';
import TeamSchedule from './TeamSchedule';
import ConferenceGrid from './ConferenceGrid';
import PlayoffBracket from './PlayoffBracket';
import OpenTeamsDialog from './OpenTeamsDialog';
import { ensureTeam } from '../../hooks/useTeamsMap';

jest.mock('../../hooks/useTeamsMap', () => ({ ensureTeam: jest.fn() }));
jest.mock('react-router-dom', () => ({ Link: ({ children, to }) => <a href={to}>{children}</a> }));
jest.mock('../ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../ui/Panel', () => ({
    __esModule: true,
    default: ({ children, header }) => (
        <section>
            {header}
            {children}
        </section>
    ),
}));
const game = { id: 1, week: 1, home_team: 'Home', away_team: 'Away', playoff_round: 1 };
const teamProps = { teamName: 'Home', schedule: [game], teamsMap: {}, season: 12 };
const gridProps = {
    conferenceTeams: [{ name: 'Home' }],
    allTeams: [],
    schedule: [game],
    teamsMap: {},
    selectedConference: 'SEC',
};
beforeEach(() => jest.clearAllMocks());

test.each([
    ['team', <TeamSchedule key="team" {...teamProps} />],
    ['conference', <ConferenceGrid key="conference" {...gridProps} />],
    ['playoff', <PlayoffBracket key="playoff" rounds={{ 1: [game] }} teamsMap={{}} />],
])('%s rendering does not start requests before effects run', (name, element) => {
    renderToString(element);
    expect(ensureTeam).not.toHaveBeenCalled();
});

test('team effects request only displayed opponents and wait until loading completes', () => {
    const schedule = [game, { ...game, id: 2, week: 0, away_team: 'Hidden' }];
    const { rerender } = render(<TeamSchedule {...teamProps} schedule={schedule} loading />);
    expect(ensureTeam).not.toHaveBeenCalled();
    rerender(<TeamSchedule {...teamProps} schedule={schedule} loading={false} />);
    expect(ensureTeam.mock.calls).toEqual([['Home'], ['Away']]);
});

test('conference effects request visible opponents without unrelated or postseason teams', () => {
    render(
        <ConferenceGrid
            {...gridProps}
            schedule={[
                game,
                { ...game, week: 13, away_team: 'Postseason' },
                { ...game, home_team: 'Other', away_team: 'Unrelated' },
            ]}
        />
    );
    expect(ensureTeam.mock.calls).toEqual([['Home'], ['Away']]);
});

test('a closed open-team dialog does not trigger lookups', () => {
    const props = { week: 1, teams: [{ name: 'Home' }], teamsMap: {}, onClose: jest.fn() };
    const { rerender } = render(<OpenTeamsDialog {...props} open={false} />);
    expect(ensureTeam).not.toHaveBeenCalled();
    rerender(<OpenTeamsDialog {...props} open />);
    expect(ensureTeam).toHaveBeenCalledWith('Home');
});
