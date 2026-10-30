const sideProbability = (probability, possession) => (possession === 'HOME' ? probability : 1 - probability);

export const homeWinProbability = (game, play) => {
    if (play?.win_probability != null) {
        return sideProbability(play.win_probability, play.possession);
    }
    if (game.win_probability != null) {
        return sideProbability(game.win_probability, game.possession);
    }
    return null;
};
