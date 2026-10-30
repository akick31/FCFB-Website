export const stadiumFixture = (name, teams = [], extra = {}) => ({
    name,
    teams,
    bowls: [],
    conferences: [],
    playoff_rounds: [],
    active: true,
    ...extra,
});
