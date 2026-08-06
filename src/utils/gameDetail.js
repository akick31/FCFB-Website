export const formatClock = (seconds) => {
    if (seconds == null) return '';
    const total = Math.max(0, Math.round(seconds));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const ROUND_LABELS = { 1: 'First Round', 2: 'Second Round', 3: 'Quarterfinal', 4: 'Semifinal' };

export const gameHeaderTitle = (game, conferenceLabel) => {
    if (!game) return 'Game';
    switch (game.game_type) {
        case 'NATIONAL_CHAMPIONSHIP':
            return `Season ${game.season} National Championship`;
        case 'CONFERENCE_CHAMPIONSHIP':
            return `${conferenceLabel || 'Conference'} Championship`;
        case 'PLAYOFFS':
            return game.postseason_game_name || ROUND_LABELS[game.playoff_round] || 'Playoffs';
        case 'BOWL':
            return game.postseason_game_name || 'Bowl';
        case 'SCRIMMAGE':
            return 'Scrimmage';
        default:
            return `Season ${game.season}, Week ${game.week}`;
    }
};

export const gameTypeName = (gameType) => {
    switch (gameType) {
        case 'NATIONAL_CHAMPIONSHIP': return 'National Championship';
        case 'PLAYOFFS': return 'Playoff Game';
        case 'BOWL': return 'Bowl Game';
        case 'CONFERENCE_CHAMPIONSHIP': return 'Conference Championship Game';
        case 'CONFERENCE_GAME': return 'Conference Game';
        case 'OUT_OF_CONFERENCE': return 'Out of Conference';
        case 'SCRIMMAGE': return 'Scrimmage';
        default: return 'Game';
    }
};

export const buildWinProbSeries = (plays) => plays
    .filter((play) => play.win_probability != null)
    .map((play, index) => {
        const homeWinProb = play.possession === 'HOME' ? play.win_probability : 1 - play.win_probability;
        return {
            index,
            homeWinProb: Math.round(homeWinProb * 100),
            quarter: play.quarter,
            clock: formatClock(play.clock),
            awayScore: play.away_score,
            homeScore: play.home_score,
            down: play.down,
            distance: play.yards_to_go,
        };
    });

export const buildScoreSeries = (plays) => plays.map((play, index) => ({
    index,
    away: play.away_score || 0,
    home: play.home_score || 0,
    quarter: play.quarter,
    clock: formatClock(play.clock),
}));

export const quarterBoundaries = (series) => {
    const marks = [];
    let previous = null;
    series.forEach((point) => {
        if (point.quarter != null && point.quarter !== previous) {
            marks.push({ index: point.index, label: point.quarter > 4 ? 'OT' : `Q${point.quarter}` });
            previous = point.quarter;
        }
    });
    return marks;
};
