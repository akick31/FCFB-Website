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

export const getStatusColor = (status) => {
    if (!status) return '#757575';
    
    const statusColors = {
        'IN_PROGRESS': '#FF5722',
        'HALFTIME': '#FF9800',
        'OVERTIME': '#FFD700',
        'OPENING_KICKOFF': '#9C27B0',
        'PREGAME': '#2196F3',
        'FINAL': '#4CAF50',
        'END_OF_REGULATION': '#4CAF50'
    };

    return statusColors[status] || '#757575';
};

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

export const formatDownAndDistance = (down, yardsToGo) => {
    if (!down || !yardsToGo) return '--';
    
    const downSuffix = down === 1 ? 'st' : down === 2 ? 'nd' : down === 3 ? 'rd' : 'th';
    return `${down}${downSuffix} & ${yardsToGo}`;
};

export const formatPossession = (possession) => {
    if (!possession) return '--';
    
    if (possession === 'AWAY') return 'Away';
    if (possession === 'HOME') return 'Home';
    
    return possession;
};

export const formatBallLocation = (ballLocation) => {
    if (!ballLocation) return '--';
    return ballLocation;
};

export const formatWaitingOn = (waitingOn, homeTeam, awayTeam) => {
    if (!waitingOn) return '--';
    
    if (waitingOn === 'HOME') return homeTeam || 'Home';
    if (waitingOn === 'AWAY') return awayTeam || 'Away';
    
    return waitingOn;
};

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
        'SEC_NETWORK': 'SEC Network',
        'TNT': 'TNT',
        'PAC_12_NETWORK': 'PAC-12 Network',
        'PEACOCK': 'Peacock',
        'ESPNEWS': 'ESPNEWS'
    };
    
    return tvChannelMappings[tvChannel] || tvChannel;
};

export const formatCoinTossWinner = (coinTossWinner, homeTeam, awayTeam) => {
    if (!coinTossWinner) return 'N/A';
    
    if (coinTossWinner === 'HOME') return homeTeam;
    if (coinTossWinner === 'AWAY') return awayTeam;
    
    return coinTossWinner;
};

export const formatWaitingOnDetailed = (waitingOn, homeTeam, awayTeam, gameStatus) => {
    if (gameStatus === 'FINAL') return 'N/A';
    
    if (waitingOn === 'HOME') return homeTeam;
    if (waitingOn === 'AWAY') return awayTeam;
    
    return waitingOn || 'N/A';
};

export const formatGameTimer = (gameTimer, gameStatus) => {
    if (gameStatus === 'FINAL') return 'N/A';
    
    return gameTimer ? `${gameTimer} EST` : 'N/A';
};

export const formatRecord = (wins, losses) => {
    if (wins === undefined || losses === undefined) return 'N/A';
    return `${wins}-${losses}`;
};

export const formatRank = (rank) => {
    if (!rank || rank === 0) return 'Unranked';
    return `#${rank}`;
}; 
