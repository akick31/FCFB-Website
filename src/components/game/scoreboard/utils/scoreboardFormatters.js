import { 
    formatScoreboardStatus, 
    getStatusColor,
} from '../../../../utils/gameUtils';

export const formatBallLocationWithTeam = (ballLocation, possession, homeTeam, awayTeam, homeTeamData, awayTeamData) => {
    if (!ballLocation) return '--';
    
    const ballLocationNum = parseInt(ballLocation);
    
    if (ballLocationNum === 50) {
        return '50';
    }
    
    if (ballLocationNum < 50) {
        // Ball is on the home team's side
        if (possession === 'HOME') {
            return (homeTeamData?.abbreviation || homeTeam?.substring(0, 3) || 'H') + ' ' + ballLocationNum;
        } else if (possession === 'AWAY') {
            return (awayTeamData?.abbreviation || awayTeam?.substring(0, 3) || 'A') + ' ' + ballLocationNum;
        }
    }
    
    if (ballLocationNum > 50) {
        // Ball is on the away team's side, convert to yards from their end zone
        const convertedYards = 100 - ballLocationNum;
        if (possession === 'HOME') {
            return (awayTeamData?.abbreviation || awayTeam?.substring(0, 3) || 'A') + ' ' + convertedYards;
        } else if (possession === 'AWAY') {
            return (homeTeamData?.abbreviation || homeTeam?.substring(0, 3) || 'H') + ' ' + convertedYards;
        }
    }
    
    return '? ' + ballLocationNum;
};

export const formatPossessionWithLogo = (possession, homeTeamData, awayTeamData) => {
    if (!possession) return '--';
    
    if (possession === 'HOME') {
        return homeTeamData?.logo ? homeTeamData.logo : 'H';
    } else if (possession === 'AWAY') {
        return awayTeamData?.logo ? awayTeamData.logo : 'A';
    }
    
    return possession;
};

export const formatWaitingOnWithLogo = (waitingOn, homeTeam, awayTeam, homeTeamData, awayTeamData) => {
    if (!waitingOn) return '--';
    
    if (waitingOn === 'HOME') {
        return homeTeamData?.logo ? homeTeamData.logo : 'H';
    } else if (waitingOn === 'AWAY') {
        return awayTeamData?.logo ? awayTeamData.logo : 'A';
    }
    
    return waitingOn;
};

export const getGameStatusInfo = (gameStatus) => {
    return {
        status: formatScoreboardStatus(gameStatus),
        color: getStatusColor(gameStatus)
    };
};

export const isGameOngoing = (gameStatus) => {
    return gameStatus === 'IN_PROGRESS' || 
           gameStatus === 'HALFTIME' || 
           gameStatus === 'OVERTIME' ||
           gameStatus === 'OPENING_KICKOFF';
}; 