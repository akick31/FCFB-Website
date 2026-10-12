import { R2_BYE_SEEDS, playoffWeekForRound } from '../constants/playoffBracket';

export const initialPlayoffGames = (teams) => {
    const firstRoundGames = Array.from({ length: 8 }, (_, index) => {
        const homeSeed = 9 + index;
        const awaySeed = 24 - index;
        return {
            week: playoffWeekForRound(1),
            homeTeam: teams[homeSeed - 1]?.name,
            awayTeam: teams[awaySeed - 1]?.name,
            gameType: 'PLAYOFFS',
            playoffRound: 1,
            playoffHomeSeed: homeSeed,
            playoffAwaySeed: awaySeed,
        };
    });
    const secondRoundGames = R2_BYE_SEEDS.map((seed) => ({
        week: playoffWeekForRound(2),
        homeTeam: teams[seed - 1]?.name,
        awayTeam: 'OPEN',
        gameType: 'PLAYOFFS',
        playoffRound: 2,
        playoffHomeSeed: seed,
        playoffAwaySeed: null,
    }));
    return { firstRoundGames, secondRoundGames };
};
