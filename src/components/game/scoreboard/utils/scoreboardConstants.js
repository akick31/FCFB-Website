export const SCOREBOARD_CONSTANTS = {
    DEFAULT_ROWS_PER_PAGE: 10,
    ROWS_PER_PAGE_OPTIONS: [5, 10, 25, 50],
    GRID_COLUMNS: {
        LIVE_GAMES: '2.5fr 1fr 0.8fr 0.8fr 1.2fr 0.8fr 1fr 1fr 1fr',
        PAST_GAMES: '2.5fr 1fr 1fr'
    },
    COLUMN_HEADERS: {
        LIVE_GAMES: [
            'Team Matchup',
            'Score', 
            'Quarter',
            'Time',
            'Down & Distance',
            'Possession',
            'Ball Location',
            'Waiting On',
            'Status'
        ],
        PAST_GAMES: [
            'Team Matchup',
            'Score',
            'Game Type'
        ]
    }
};

export const GAME_CATEGORIES = {
    ONGOING: 'ONGOING',
    PAST: 'PAST',
    SCRIMMAGE: 'SCRIMMAGE',
    PAST_SCRIMMAGE: 'PAST_SCRIMMAGE'
};

export const GAME_SORTS = {
    CLOSEST_TO_END: 'CLOSEST_TO_END',
    MOST_TIME_REMAINING: 'MOST_TIME_REMAINING'
};

export const GAME_STATUSES = {
    PREGAME: 'PREGAME',
    OPENING_KICKOFF: 'OPENING_KICKOFF',
    IN_PROGRESS: 'IN_PROGRESS',
    HALFTIME: 'HALFTIME',
    FINAL: 'FINAL',
    END_OF_REGULATION: 'END_OF_REGULATION',
    OVERTIME: 'OVERTIME'
}; 