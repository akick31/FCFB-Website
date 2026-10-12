import { camelOrSnakeField } from './fieldHelper';
import {
    QF_SEED_GROUPS,
    SF_SEED_GROUPS,
    ROUND_LABELS,
    playoffWeekForRound,
    CFP_LOGO_URL,
} from '../constants/playoffBracket';

const isPlaceholder = (teamName) => !teamName || teamName === 'TBD' || teamName === 'OPEN';

const findSeedGroupGame = (games, seedGroups, winnerSeed) => {
    const groupSeeds = seedGroups.find((group) => group.includes(winnerSeed));
    if (!groupSeeds) {
        return null;
    }
    return games.find((game) => {
        const homeTeam = camelOrSnakeField(game, 'homeTeam', 'home_team');
        const awayTeam = camelOrSnakeField(game, 'awayTeam', 'away_team');
        const homeSeed = camelOrSnakeField(game, 'playoffHomeSeed', 'playoff_home_seed');
        const awaySeed = camelOrSnakeField(game, 'playoffAwaySeed', 'playoff_away_seed');
        return (
            (isPlaceholder(homeTeam) || isPlaceholder(awayTeam)) &&
            (groupSeeds.includes(homeSeed) || groupSeeds.includes(awaySeed))
        );
    });
};

export const playoffAdvancement = (game, winner, schedule, season) => {
    const currentRound = camelOrSnakeField(game, 'playoffRound', 'playoff_round') || 1;
    const nextRound = currentRound + 1;
    const home = camelOrSnakeField(game, 'homeTeam', 'home_team');
    const homeSeed = camelOrSnakeField(game, 'playoffHomeSeed', 'playoff_home_seed');
    const awaySeed = camelOrSnakeField(game, 'playoffAwaySeed', 'playoff_away_seed');
    const winnerSeed = winner === home ? homeSeed : awaySeed;
    const gameType = nextRound >= 5 ? 'NATIONAL_CHAMPIONSHIP' : 'PLAYOFFS';
    const nextWeek = playoffWeekForRound(nextRound);

    if (currentRound === 1 && homeSeed) {
        const byeSeed = 17 - homeSeed;
        const secondRoundPlaceholder = schedule.find((scheduledGame) => {
            const scheduledRound = camelOrSnakeField(scheduledGame, 'playoffRound', 'playoff_round');
            const scheduledHomeSeed = camelOrSnakeField(scheduledGame, 'playoffHomeSeed', 'playoff_home_seed');
            return scheduledRound === 2 && scheduledHomeSeed === byeSeed;
        });

        if (secondRoundPlaceholder) {
            return {
                operation: 'update',
                scheduleEntryId: secondRoundPlaceholder.id,
                entry: {
                    season,
                    week: nextWeek,
                    subdivision: 'FBS',
                    homeTeam: camelOrSnakeField(secondRoundPlaceholder, 'homeTeam', 'home_team'),
                    awayTeam: winner,
                    gameType: 'PLAYOFFS',
                    playoffRound: 2,
                    playoffHomeSeed: byeSeed,
                    playoffAwaySeed: winnerSeed,
                    postseasonGameLogo: CFP_LOGO_URL,
                    postseasonGameName: ROUND_LABELS[2],
                },
                message: `${winner} (#${winnerSeed}) advances to face #${byeSeed} in ${ROUND_LABELS[2]} (Week ${nextWeek})!`,
            };
        }
    }

    const nextRoundGames = schedule.filter((scheduledGame) => {
        const scheduledGameType = camelOrSnakeField(scheduledGame, 'gameType', 'game_type');
        const scheduledRound = camelOrSnakeField(scheduledGame, 'playoffRound', 'playoff_round');
        return (
            (scheduledGameType === 'PLAYOFFS' || scheduledGameType === 'NATIONAL_CHAMPIONSHIP') &&
            scheduledRound === nextRound
        );
    });

    let targetGame = null;

    if (currentRound === 2) {
        targetGame = findSeedGroupGame(nextRoundGames, QF_SEED_GROUPS, winnerSeed);
    } else if (currentRound === 3) {
        targetGame = findSeedGroupGame(nextRoundGames, SF_SEED_GROUPS, winnerSeed);
    } else if (currentRound === 4) {
        targetGame = nextRoundGames.find((scheduledGame) => {
            const targetHomeTeam = camelOrSnakeField(scheduledGame, 'homeTeam', 'home_team');
            const targetAwayTeam = camelOrSnakeField(scheduledGame, 'awayTeam', 'away_team');
            return isPlaceholder(targetHomeTeam) || isPlaceholder(targetAwayTeam);
        });
    }

    let plan;
    if (targetGame) {
        const targetHomeTeam = camelOrSnakeField(targetGame, 'homeTeam', 'home_team');
        const targetAwayTeam = camelOrSnakeField(targetGame, 'awayTeam', 'away_team');
        const existingHomeSeed = camelOrSnakeField(targetGame, 'playoffHomeSeed', 'playoff_home_seed');
        const existingAwaySeed = camelOrSnakeField(targetGame, 'playoffAwaySeed', 'playoff_away_seed');

        plan = {
            operation: 'update',
            scheduleEntryId: targetGame.id,
            entry: {
                season,
                week: nextWeek,
                subdivision: 'FBS',
                homeTeam: isPlaceholder(targetHomeTeam) ? winner : targetHomeTeam,
                awayTeam: isPlaceholder(targetAwayTeam) ? winner : targetAwayTeam,
                gameType,
                playoffRound: nextRound,
                playoffHomeSeed: isPlaceholder(targetHomeTeam) ? winnerSeed : existingHomeSeed,
                playoffAwaySeed: isPlaceholder(targetAwayTeam) ? winnerSeed : existingAwaySeed,
                postseasonGameLogo: CFP_LOGO_URL,
                postseasonGameName: ROUND_LABELS[nextRound],
            },
        };
    } else {
        plan = {
            operation: 'create',
            entry: {
                season,
                week: nextWeek,
                subdivision: 'FBS',
                homeTeam: winner,
                awayTeam: 'OPEN',
                gameType,
                playoffRound: nextRound,
                playoffHomeSeed: winnerSeed,
                playoffAwaySeed: null,
                postseasonGameLogo: CFP_LOGO_URL,
                postseasonGameName: ROUND_LABELS[nextRound],
            },
        };
    }

    return {
        ...plan,
        message: `${winner} advanced to ${ROUND_LABELS[nextRound] || `Round ${nextRound}`} (Week ${nextWeek})!`,
    };
};
