import { camelOrSnakeField } from '../../../utils/fieldHelper';
import { pickTeamColor } from '../../../utils/teamColor';
import { conferenceLabel } from '../../../hooks/useConferencesMap';
import { gameHeaderTitle } from '../../../utils/gameDetail';

const quarterLines = (awayStats, homeStats) => {
    const hasOt = Boolean(awayStats?.ot_score || homeStats?.ot_score);
    const keys = ['q1_score', 'q2_score', 'q3_score', 'q4_score', ...(hasOt ? ['ot_score'] : [])];
    const awayQuarters = keys.map((key) => awayStats?.[key]);
    const homeQuarters = keys.map((key) => homeStats?.[key]);
    return {
        columns: ['Q1', 'Q2', 'Q3', 'Q4', ...(hasOt ? ['OT'] : [])],
        awayQuarters,
        homeQuarters,
        showQuarters:
            Boolean(awayStats && homeStats) && [...awayQuarters, ...homeQuarters].some((value) => value != null),
    };
};

const venueOf = (game, homeTeam, venuesMap) => {
    const venueName = camelOrSnakeField(game, 'venue', 'venue') || homeTeam?.stadium || null;
    const location = venueName ? venuesMap[venueName] : null;
    const venueText =
        venueName && location?.city && location?.state
            ? `${venueName} - ${location.city}, ${location.state}`
            : venueName;
    return { venueName, venueText, venueId: location?.venue_id };
};

export const spreadTextOf = (game, homeMark) =>
    game.home_vegas_spread != null
        ? `${homeMark?.abbreviation} ${game.home_vegas_spread > 0 ? '+' : ''}${game.home_vegas_spread}`
        : null;

export const buildScoreboardProps = ({
    game,
    awayMark,
    homeMark,
    homeTeam,
    awayStats,
    homeStats,
    venuesMap,
    mode,
}) => ({
    game,
    awayMark,
    homeMark,
    homeTeam,
    awayColor: pickTeamColor(awayMark, mode),
    homeColor: pickTeamColor(homeMark, mode),
    spreadText: spreadTextOf(game, homeMark),
    subtitle: gameHeaderTitle(game, conferenceLabel(homeTeam?.conference)),
    threadLink:
        game.home_platform === 'DISCORD' && game.home_platform_id
            ? `https://discord.com/channels/862571689342533663/${game.home_platform_id}`
            : null,
    ...venueOf(game, homeTeam, venuesMap),
    ...quarterLines(awayStats, homeStats),
});
