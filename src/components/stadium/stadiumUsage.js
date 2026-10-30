import { DEFAULT_COUNTRY } from './countries';

export const isTeamStadium = (stadium) => stadium.teams.length > 0;

export const eventsAt = (stadium) => [
    ...stadium.bowls,
    ...stadium.conferences.map((conference) => `${conference} championship`),
    ...stadium.playoff_rounds,
];

export const locationOf = (stadium) =>
    [stadium.city, stadium.state, stadium.country !== DEFAULT_COUNTRY && stadium.country].filter(Boolean).join(', ');

export const searchTextOf = (stadium) =>
    [stadium.name, locationOf(stadium), ...stadium.teams, ...eventsAt(stadium)].join(' ').toLowerCase();
