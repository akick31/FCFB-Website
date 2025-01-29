import {getTeamByName} from "../api/teamApi";

export const GameFilter = async (games, selectedConference, top25Only, week, season, selectedGameTypes) => {
    const filteredGames = [];

    // Fetch teams for all games asynchronously
    const gamesWithTeams = await Promise.all(
        games.map(async (game) => {
            const homeTeam = await getTeamByName(game.home_team);
            const awayTeam = await getTeamByName(game.away_team);

            if (!homeTeam || !awayTeam) return null;

            return { game, homeTeam, awayTeam };
        })
    );

    // Filter the games after fetching the teams
    for (let { game, homeTeam, awayTeam } of gamesWithTeams) {
        if (!game) continue;

        const matchesConference =
            selectedConference === 'All' ||
            selectedConference === '' ||
            homeTeam.conference === selectedConference ||
            awayTeam.conference === selectedConference;

        const isTop25 = top25Only ? (
            (homeTeam.coaches_poll_ranking >= 1 && homeTeam.coaches_poll_ranking <= 25) ||
            (awayTeam.coaches_poll_ranking >= 1 && awayTeam.coaches_poll_ranking <= 25) ||
            (homeTeam.playoff_committee_ranking >= 1 && homeTeam.playoff_committee_ranking <= 25) ||
            (awayTeam.playoff_committee_ranking >= 1 && awayTeam.playoff_committee_ranking <= 25)
        ) : true;

        const matchesGameType = selectedGameTypes.length > 0
            ? selectedGameTypes.includes(game.game_type)
            : true;

        const matchesWeek = week != null ? game.week.toString() === week.toString() : true;

        const matchesSeason = season != null ? game.season.toString() === season : true;

        if (matchesWeek && matchesSeason && matchesConference && matchesGameType && isTop25) {
            filteredGames.push(game);
        }
    }

    return filteredGames;
};