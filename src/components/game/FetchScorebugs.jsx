import { getLatestScorebugByGameId } from "../../api/scorebugApi";

export const fetchScorebugs = async (games) => {
    const newScorebugs = {};
    const promises = games.map(async (game) => {
        try {
            const scorebug = await getLatestScorebugByGameId(game.game_id);
            newScorebugs[game.game_id] = scorebug;
        } catch (err) {
            console.error(`Failed to fetch scorebug for game ${game.game_id}:`, err);
        }
    });

    await Promise.all(promises);
    return newScorebugs;
};