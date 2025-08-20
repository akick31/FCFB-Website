/**
 * Game utility functions for consistent formatting across the application
 */

/**
 * Formats game type enum to human-readable description
 * @param {string} gameType - Game type enum value
 * @returns {string} - Formatted game type description
 */
export const formatGameType = (gameType) => {
    if (!gameType) return 'Regular Season';
    
    const gameTypeMappings = {
        'OUT_OF_CONFERENCE': 'Out of Conference',
        'CONFERENCE_GAME': 'Conference Game',
        'CONFERENCE_CHAMPIONSHIP': 'Conference Championship',
        'PLAYOFFS': 'Playoffs',
        'NATIONAL_CHAMPIONSHIP': 'National Championship',
        'BOWL': 'Bowl',
        'SCRIMMAGE': 'Scrimmage'
    };
    
    return gameTypeMappings[gameType] || gameType;
};

/**
 * Formats game status enum to human-readable description
 * @param {string} gameStatus - Game status enum value
 * @returns {string} - Formatted game status description
 */
export const formatGameStatus = (gameStatus) => {
    if (!gameStatus) return 'Unknown';
    
    const gameStatusMappings = {
        'PREGAME': 'PREGAME',
        'OPENING_KICKOFF': 'OPENING KICKOFF',
        'IN_PROGRESS': 'IN PROGRESS',
        'HALFTIME': 'HALFTIME',
        'FINAL': 'FINAL',
        'END_OF_REGULATION': 'END OF REGULATION',
        'OVERTIME': 'OVERTIME'
    };
    
    return gameStatusMappings[gameStatus] || gameStatus;
};

/**
 * Formats TV channel enum to human-readable description
 * @param {string} tvChannel - TV channel enum value
 * @returns {string} - Formatted TV channel description
 */
export const formatTVChannel = (tvChannel) => {
    if (!tvChannel) return 'N/A';
    
    const tvChannelMappings = {
        'ABC': 'ABC',
        'CBS': 'CBS',
        'ESPN': 'ESPN',
        'ESPN2': 'ESPN2',
        'FOX': 'FOX',
        'FS1': 'FS1',
        'FS2': 'FS2',
        'NBC': 'NBC',
        'ACC_NETWORK': 'ACC Network',
        'BIG_TEN_NETWORK': 'Big Ten Network',
        'CBS_SPORTS_NETWORK': 'CBS Sports Network',
        'THE_CW': 'The CW',
        'ESPNU': 'ESPNU',
        'ESPN_PLUS': 'ESPN+',
        'SEC_NETWORK': 'SEC Network'
    };
    
    return tvChannelMappings[tvChannel] || tvChannel;
};

/**
 * Formats coin toss winner to team name
 * @param {string} coinTossWinner - Coin toss winner ('HOME' or 'AWAY')
 * @param {string} homeTeam - Home team name
 * @param {string} awayTeam - Away team name
 * @returns {string} - Team name that won coin toss
 */
export const formatCoinTossWinner = (coinTossWinner, homeTeam, awayTeam) => {
    if (!coinTossWinner) return 'N/A';
    
    if (coinTossWinner === 'HOME') return homeTeam;
    if (coinTossWinner === 'AWAY') return awayTeam;
    
    return coinTossWinner;
};

/**
 * Formats waiting on information
 * @param {string} waitingOn - Team that the game is waiting on
 * @param {string} homeTeam - Home team name
 * @param {string} awayTeam - Away team name
 * @param {string} gameStatus - Current game status
 * @returns {string} - Team name or 'N/A' if game is final
 */
export const formatWaitingOn = (waitingOn, homeTeam, awayTeam, gameStatus) => {
    if (gameStatus === 'FINAL') return 'N/A';
    
    if (waitingOn === 'HOME') return homeTeam;
    if (waitingOn === 'AWAY') return awayTeam;
    
    return waitingOn || 'N/A';
};

/**
 * Formats game timer with EST timezone
 * @param {string} gameTimer - Game timer value
 * @param {string} gameStatus - Current game status
 * @returns {string} - Formatted timer with EST or 'N/A' if game is final
 */
export const formatGameTimer = (gameTimer, gameStatus) => {
    if (gameStatus === 'FINAL') return 'N/A';
    
    return gameTimer ? `${gameTimer} EST` : 'N/A';
};

/**
 * Formats record from wins and losses
 * @param {number} wins - Number of wins
 * @param {number} losses - Number of losses
 * @returns {string} - Formatted record (e.g., "5-2")
 */
export const formatRecord = (wins, losses) => {
    if (wins === undefined || losses === undefined) return 'N/A';
    return `${wins}-${losses}`;
};

/**
 * Formats team rank
 * @param {number} rank - Team rank
 * @returns {string} - Formatted rank or "Unranked" if 0
 */
export const formatRank = (rank) => {
    if (!rank || rank === 0) return 'Unranked';
    return `#${rank}`;
}; 