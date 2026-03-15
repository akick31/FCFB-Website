export const SCOREBOARD_CONSTANTS = {
    DEFAULT_ROWS_PER_PAGE: 10,
    ROWS_PER_PAGE_OPTIONS: [5, 10, 25, 50],
    GRID_COLUMNS: {
        LIVE_GAMES: {
            small: '200px 80px 70px 70px 80px 70px 80px 80px 80px 80px 80px',
            large: '350px 140px 100px 100px 160px 100px 120px 120px 120px 100px 100px'
        },
        PAST_GAMES: {
            small: '1fr 80px 90px 80px',
            large: '1fr 140px 200px 160px'
        }
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
            'Status',
            'Game Mode',
            'Spread'
        ],
        PAST_GAMES: [
            'Team Matchup',
            'Score',
            'Game Type',
            'Spread'
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