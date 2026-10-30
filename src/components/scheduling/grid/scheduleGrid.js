import { camelOrSnakeField } from '../../../utils/fieldHelper';

export const TOTAL_WEEKS = 12;

export const weekNumbers = Array.from({ length: TOTAL_WEEKS }, (_, index) => index + 1);

const sidesOf = (game) => ({
    home: camelOrSnakeField(game, 'homeTeam', 'home_team'),
    away: camelOrSnakeField(game, 'awayTeam', 'away_team'),
});

export const buildScheduleGrid = (conferenceTeams, conferenceSchedule, allSeasonSchedule) => {
    const teamNames = new Set(conferenceTeams.map((team) => team.name));
    const grid = Object.fromEntries(conferenceTeams.map((team) => [team.name, {}]));
    const place = (game, gameType, onlyEmpty) => {
        const { week } = game;
        if (!week || week > TOTAL_WEEKS) {
            return;
        }
        const { home, away } = sidesOf(game);
        [
            [home, away, true],
            [away, home, false],
        ].forEach(([team, opponent, isHome]) => {
            if (teamNames.has(team) && !(onlyEmpty && grid[team][week])) {
                grid[team][week] = { ...game, opponent, isHome, gameType };
            }
        });
    };
    conferenceSchedule.forEach((game) => place(game, 'CONFERENCE_GAME', false));
    allSeasonSchedule.forEach((game) => place(game, camelOrSnakeField(game, 'gameType', 'game_type'), true));
    return grid;
};

export const conferenceGameCounts = (conferenceSchedule) => {
    const counts = {};
    conferenceSchedule.forEach((game) => {
        const { home, away } = sidesOf(game);
        counts[home] = { home: (counts[home]?.home || 0) + 1, away: counts[home]?.away || 0 };
        counts[away] = { home: counts[away]?.home || 0, away: (counts[away]?.away || 0) + 1 };
    });
    return counts;
};

export const isNeutralSite = (cell) => Boolean(camelOrSnakeField(cell, 'neutralSite', 'neutral_site'));
