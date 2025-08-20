import React from 'react';
import {
    Box,
    Typography,
    useTheme
} from '@mui/material';
import PropTypes from 'prop-types';

const CustomScorebug = ({ game, homeTeam, awayTeam, scorebug, sx = {} }) => {
    const theme = useTheme();

    if (!game) return null;

    const formatQuarter = (quarter) => {
        if (quarter >= 6) return `${quarter - 4} OT`;
        if (quarter === 5) return 'OT';
        if (quarter === 4) return '4th';
        if (quarter === 3) return '3rd';
        if (quarter === 2) return '2nd';
        if (quarter === 1) return '1st';
        return 'Unknown';
    };

    const formatClock = (quarter, clock) => {
        if (quarter >= 5) return '';
        return clock || '00:00';
    };

    const formatBallLocation = (ballLocation, possession, homeTeam, awayTeam) => {
        if (ballLocation === 50) return '50';
        
        if (ballLocation < 50) {
            if (possession === 'HOME') {
                return `${homeTeam?.abbreviation || homeTeam?.name || 'HOME'} ${ballLocation}`;
            } else {
                return `${awayTeam?.abbreviation || awayTeam?.name || 'AWAY'} ${ballLocation}`;
            }
        } else {
            if (possession === 'HOME') {
                return `${awayTeam?.abbreviation || awayTeam?.name || 'AWAY'} ${100 - ballLocation}`;
            } else {
                return `${homeTeam?.abbreviation || homeTeam?.name || 'HOME'} ${100 - ballLocation}`;
            }
        }
    };

    const formatDownAndDistance = (game) => {
        if (game.currentPlayType === 'KICKOFF') return 'Kickoff';
        if (game.currentPlayType === 'PAT') return 'PAT';
        
        const down = game.down;
        const yardsToGo = game.yardsToGo;
        const ballLocation = game.ballLocation;
        
        let downText = '';
        switch (down) {
            case 1: downText = '1st'; break;
            case 2: downText = '2nd'; break;
            case 3: downText = '3rd'; break;
            case 4: downText = '4th'; break;
            default: downText = down?.toString() || '';
        }
        
        let distanceText = '';
        if ((ballLocation + yardsToGo) >= 100) {
            distanceText = 'Goal';
        } else {
            distanceText = yardsToGo?.toString() || '';
        }
        
        return `${downText} & ${distanceText}`;
    };

    const formatRecord = (wins, losses, isHome, gameStatus, homeScore, awayScore) => {
        if (gameStatus === 'FINAL') {
            if (isHome) {
                if (homeScore > awayScore) {
                    return `${(wins || 0) + 1}-${losses || 0}`;
                } else {
                    return `${wins || 0}-${(losses || 0) + 1}`;
                }
            } else {
                if (awayScore > homeScore) {
                    return `${(wins || 0) + 1}-${losses || 0}`;
                } else {
                    return `${wins || 0}-${(losses || 0) + 1}`;
                }
            }
        }
        return `${wins || 0}-${losses || 0}`;
    };

    const renderTimeoutBoxes = (timeouts, isActive) => {
        const boxes = [];
        for (let i = 0; i < 3; i++) {
            boxes.push(
                <Box
                    key={i}
                    sx={{
                        width: 38,
                        height: 7,
                        backgroundColor: i < timeouts ? '#FFD700' : 'rgba(211, 211, 211, 0.6)',
                        borderRadius: 1,
                        mr: 0.9
                    }}
                />
            );
        }
        return (
            <Box sx={{ display: 'flex', position: 'absolute', bottom: 8, left: 10 }}>
                {boxes}
            </Box>
        );
    };

    const isGameFinal = game.status === 'FINAL' || game.status === 'COMPLETED';

    return (
        <Box sx={{
            width: 360,
            height: 400,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            borderRadius: 2,
            border: '3px solid white',
            overflow: 'hidden',
            position: 'relative',
            ...sx
        }}>
            {/* Away Team Section (Top) */}
            <Box sx={{
                height: 70,
                background: `linear-gradient(135deg, ${awayTeam?.primaryColor || '#666'} 0%, ${awayTeam?.secondaryColor || '#444'} 100%)`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                px: 2
            }}>
                {/* Away Team Info */}
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    {/* Ranking */}
                    {game.away_team_rank && game.away_team_rank !== 0 && (
                        <Typography sx={{
                            color: 'white',
                            fontSize: '33px',
                            fontWeight: 400,
                            mr: 1.5
                        }}>
                            #{game.away_team_rank}
                        </Typography>
                    )}
                    
                    {/* Team Name */}
                    <Typography sx={{
                        color: 'white',
                        fontSize: '40px',
                        fontWeight: 400,
                        flex: 1
                    }}>
                        {awayTeam?.name || game.away_team}
                    </Typography>
                </Box>

                {/* Away Team Record */}
                <Typography sx={{
                    color: 'white',
                    fontSize: '33px',
                    fontWeight: 400
                }}>
                    {formatRecord(game.away_wins, game.away_losses, false, game.status, game.home_score, game.away_score)}
                </Typography>

                {/* Timeout Boxes */}
                {renderTimeoutBoxes(game.away_timeouts || 0, true)}
            </Box>

            {/* Home Team Section (Bottom) */}
            <Box sx={{
                height: 70,
                background: `linear-gradient(135deg, ${homeTeam?.primaryColor || '#666'} 0%, ${homeTeam?.secondaryColor || '#444'} 100%)`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                px: 2
            }}>
                {/* Home Team Info */}
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    {/* Ranking */}
                    {game.home_team_rank && game.home_team_rank !== 0 && (
                        <Typography sx={{
                            color: 'white',
                            fontSize: '33px',
                            fontWeight: 400,
                            mr: 1.5
                        }}>
                            #{game.home_team_rank}
                        </Typography>
                    )}
                    
                    {/* Team Name */}
                    <Typography sx={{
                        color: 'white',
                        fontSize: '40px',
                        fontWeight: 400,
                        flex: 1
                    }}>
                        {homeTeam?.name || game.home_team}
                    </Typography>
                </Box>

                {/* Home Team Record */}
                <Typography sx={{
                    color: 'white',
                    fontSize: '33px',
                    fontWeight: 400
                }}>
                    {formatRecord(game.home_wins, game.home_losses, true, game.status, game.home_score, game.away_score)}
                </Typography>

                {/* Timeout Boxes */}
                {renderTimeoutBoxes(game.home_timeouts || 0, true)}
            </Box>

            {/* Scores Section */}
            <Box sx={{ display: 'flex', height: 140 }}>
                {/* Away Team Score */}
                <Box sx={{
                    flex: 1,
                    background: `linear-gradient(135deg, ${awayTeam?.primaryColor || '#666'} 0%, ${awayTeam?.secondaryColor || '#444'} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{
                            color: 'white',
                            fontSize: '75px',
                            fontWeight: 700
                        }}>
                            {game.away_score || 0}
                        </Typography>
                        
                        {/* Possession Arrow */}
                        {game.possession === 'AWAY' && !isGameFinal && (
                            <Typography sx={{
                                color: 'white',
                                fontSize: '40px',
                                ml: 1.5
                            }}>
                                ◀
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Home Team Score */}
                <Box sx={{
                    flex: 1,
                    background: `linear-gradient(135deg, ${homeTeam?.primaryColor || '#666'} 0%, ${homeTeam?.secondaryColor || '#444'} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography sx={{
                            color: 'white',
                            fontSize: '75px',
                            fontWeight: 700
                        }}>
                            {game.home_score || 0}
                        </Typography>
                        
                        {/* Possession Arrow */}
                        {game.possession === 'HOME' && !isGameFinal && (
                            <Typography sx={{
                                color: 'white',
                                fontSize: '40px',
                                ml: 1.5
                            }}>
                                ◀
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Game Status Section */}
            {!isGameFinal ? (
                <>
                    {/* Quarter, Clock, Ball Location Row */}
                    <Box sx={{ display: 'flex', height: 70 }}>
                        {/* Quarter */}
                        <Box sx={{
                            flex: 1,
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRight: '3px solid #d3d3d3'
                        }}>
                            <Typography sx={{
                                color: 'black',
                                fontSize: '40px',
                                fontWeight: 400
                            }}>
                                {formatQuarter(game.quarter)}
                            </Typography>
                        </Box>

                        {/* Clock */}
                        <Box sx={{
                            flex: 1.6,
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRight: '3px solid #d3d3d3'
                        }}>
                            <Typography sx={{
                                color: 'black',
                                fontSize: '40px',
                                fontWeight: 400
                            }}>
                                {formatClock(game.quarter, game.clock)}
                            </Typography>
                        </Box>

                        {/* Ball Location */}
                        <Box sx={{
                            flex: 1,
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Typography sx={{
                                color: 'black',
                                fontSize: '29px',
                                fontWeight: 400,
                                textAlign: 'center'
                            }}>
                                {formatBallLocation(game.ball_location, game.possession, homeTeam, awayTeam)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Down & Distance Row */}
                    <Box sx={{
                        height: 60,
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        px: 2
                    }}>
                        <Typography sx={{
                            color: 'black',
                            fontSize: '43px',
                            fontWeight: 400
                        }}>
                            {formatDownAndDistance(game)}
                        </Typography>
                    </Box>
                </>
            ) : (
                /* Final Score Row */
                <Box sx={{
                    height: 130,
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    px: 2
                }}>
                    <Typography sx={{
                        color: 'black',
                        fontSize: '43px',
                        fontWeight: 700
                    }}>
                        {game.quarter >= 6 ? `FINAL/${game.quarter - 4} OT` : 
                         game.quarter === 5 ? 'FINAL/OT' : 'FINAL'}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

CustomScorebug.propTypes = {
    game: PropTypes.object.isRequired,
    homeTeam: PropTypes.object,
    awayTeam: PropTypes.object,
    scorebug: PropTypes.any,
    sx: PropTypes.object
};

export default CustomScorebug; 