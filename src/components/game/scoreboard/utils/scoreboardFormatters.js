export const formatBallLocationWithTeam = (ballLocation, possession, homeTeam, awayTeam, homeTeamData, awayTeamData) => {
    if (!ballLocation) return '--';
    
    const ballLocationNum = parseInt(ballLocation);
    
    if (ballLocationNum === 50) {
        return '50';
    }
    
    if (ballLocationNum < 50) {
        if (possession === 'HOME') {
            return (homeTeamData?.abbreviation || homeTeam?.substring(0, 3) || 'H') + ' ' + ballLocationNum;
        } else if (possession === 'AWAY') {
            return (awayTeamData?.abbreviation || awayTeam?.substring(0, 3) || 'A') + ' ' + ballLocationNum;
        }
    }
    
    if (ballLocationNum > 50) {
        const convertedYards = 100 - ballLocationNum;
        if (possession === 'HOME') {
            return (awayTeamData?.abbreviation || awayTeam?.substring(0, 3) || 'A') + ' ' + convertedYards;
        } else if (possession === 'AWAY') {
            return (homeTeamData?.abbreviation || homeTeam?.substring(0, 3) || 'H') + ' ' + convertedYards;
        }
    }
    
    return '? ' + ballLocationNum;
};

export const isGameOngoing = (gameStatus) => {
    return gameStatus === 'IN_PROGRESS' || 
           gameStatus === 'HALFTIME' || 
           gameStatus === 'OVERTIME' ||
           gameStatus === 'OPENING_KICKOFF' ||
           gameStatus === 'PREGAME' ||
           gameStatus === 'END_OF_REGULATION';
}; 