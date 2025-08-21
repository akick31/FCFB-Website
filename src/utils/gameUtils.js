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
 * Formats game status enum to human-readable description for scoreboard display
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
 * Formats game status for scoreboard display (simplified)
 * @param {string} gameStatus - Game status enum value
 * @returns {string} - Simplified status for scoreboard
 */
export const formatScoreboardStatus = (gameStatus) => {
    if (!gameStatus) return 'Unknown';
    
    const statusMappings = {
        'PREGAME': 'Pregame',
        'OPENING_KICKOFF': 'Kickoff',
        'IN_PROGRESS': 'Live',
        'HALFTIME': 'Halftime',
        'OVERTIME': 'OT',
        'FINAL': 'Final',
        'END_OF_REGULATION': 'Final'
    };
    
    return statusMappings[gameStatus] || gameStatus;
};

/**
 * Gets status color for scoreboard display
 * @param {string} status - Game status
 * @returns {string} - Hex color for status
 */
export const getStatusColor = (status) => {
    if (!status) return '#757575';
    
    const statusColors = {
        'IN_PROGRESS': '#FF5722',        // Gold for live games
        'HALFTIME': '#FF9800',           // Orange for halftime
        'OVERTIME': '#FFD700',           // Red for overtime
        'OPENING_KICKOFF': '#9C27B0',    // Purple for kickoff
        'PREGAME': '#2196F3',            // Blue for scheduled
        'FINAL': '#4CAF50',              // Green for completed
        'END_OF_REGULATION': '#4CAF50'   // Green for completed
    };
    
    return statusColors[status] || '#757575'; // Gray for unknown
};

/**
 * Formats quarter information for scoreboard display
 * @param {number} quarter - Quarter number
 * @returns {string} - Formatted quarter
 */
export const formatScoreboardQuarter = (quarter) => {
    if (!quarter) return 'Unknown';
    
    if (quarter >= 6) return `${quarter - 4} OT`;
    if (quarter === 5) return 'OT';
    if (quarter === 4) return '4th';
    if (quarter === 3) return '3rd';
    if (quarter === 2) return '2nd';
    if (quarter === 1) return '1st';
    return 'Unknown';
};

/**
 * Formats down and distance for scoreboard display
 * @param {number} down - Down number
 * @param {number} yardsToGo - Yards to go
 * @returns {string} - Formatted down and distance
 */
export const formatDownAndDistance = (down, yardsToGo) => {
    if (!down || !yardsToGo) return '--';
    
    const downSuffix = down === 1 ? 'st' : down === 2 ? 'nd' : down === 3 ? 'rd' : 'th';
    return `${down}${downSuffix} & ${yardsToGo}`;
};

/**
 * Formats possession for scoreboard display
 * @param {string} possession - Possession ('HOME' or 'AWAY')
 * @returns {string} - Formatted possession
 */
export const formatPossession = (possession) => {
    if (!possession) return '--';
    
    if (possession === 'AWAY') return 'Away';
    if (possession === 'HOME') return 'Home';
    
    return possession;
};

/**
 * Formats ball location for scoreboard display
 * @param {string} ballLocation - Ball location
 * @returns {string} - Formatted ball location or '--'
 */
export const formatBallLocation = (ballLocation) => {
    if (!ballLocation) return '--';
    return ballLocation;
};

/**
 * Formats waiting on information for scoreboard display
 * @param {string} waitingOn - Who the game is waiting on
 * @param {string} homeTeam - Home team name
 * @param {string} awayTeam - Away team name
 * @returns {string} - Formatted waiting on or '--'
 */
export const formatWaitingOn = (waitingOn, homeTeam, awayTeam) => {
    if (!waitingOn) return '--';
    
    if (waitingOn === 'HOME') return homeTeam || 'Home';
    if (waitingOn === 'AWAY') return awayTeam || 'Away';
    
    return waitingOn;
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
export const formatWaitingOnDetailed = (waitingOn, homeTeam, awayTeam, gameStatus) => {
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