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

    // Debug logging for ranks
    console.log('Scorebug Debug - Away Team Rank:', {
        gameRank: game.away_team_rank,
        teamRank: awayTeam?.rank,
        finalRank: game.away_team_rank || awayTeam?.rank
    });
    console.log('Scorebug Debug - Home Team Rank:', {
        gameRank: game.home_team_rank,
        teamRank: homeTeam?.rank,
        finalRank: game.home_team_rank || homeTeam?.rank
    });

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
                return `${homeTeam?.abbreviation || 'HOME'} ${ballLocation}`;
            } else {
                return `${awayTeam?.abbreviation || 'AWAY'} ${ballLocation}`;
            }
        } else {
            if (possession === 'HOME') {
                return `${awayTeam?.abbreviation || 'AWAY'} ${100 - ballLocation}`;
            } else {
                return `${homeTeam?.abbreviation || 'HOME'} ${100 - ballLocation}`;
            }
        }
    };

    const formatDownAndDistance = (game) => {
        if (game.currentPlayType === 'KICKOFF') return 'Kickoff';
        if (game.currentPlayType === 'PAT') return 'PAT';
        
        const down = game.down;
        const yardsToGo = game.yards_to_go;
        const ballLocation = game.ballLocation;
        
        let downText = '';
        switch (down) {
            case 1: downText = '1st'; break;
            case 2: downText = '2nd'; break;
            case 3: downText = '3rd'; break;
            case 4: downText = '4th'; break;
            default: downText = down?.toString() || '';
        }
        
        let yardsText = '';
        if ((ballLocation + yardsToGo) >= 100) {
            yardsText = 'Goal';
        } else {
            yardsText = yardsToGo?.toString() || '';
        }
        
        return `${downText} & ${yardsText}`;
    };

    const renderTimeoutBoxes = (timeouts) => {
        const boxes = [];
        for (let i = 0; i < 3; i++) {
            boxes.push(
                <Box
                    key={i}
                    sx={{
                        width: 16,
                        height: 3,
                        backgroundColor: i < timeouts ? '#FFD700' : 'rgba(255, 255, 255, 0.3)',
                        borderRadius: 0.5,
                        mr: 0.5
                    }}
                />
            );
        }
        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {boxes}
            </Box>
        );
    };

    const isGameFinal = game.status === 'FINAL' || game.status === 'COMPLETED';

    return (
        <Box sx={{
            width: 320,
            backgroundColor: 'rgba(0, 0, 0, 0.85)', // Black with transparency
            borderRadius: 1.5,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            ...sx
        }}>
            {/* Away Team Row */}
            <Box sx={{
                display: 'flex',
                alignItems: 'flex-start',
                p: 1.5,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRight: game.possession === 'AWAY' && !isGameFinal ? '4px solid #FFD700' : 'none'
            }}>
                {/* Team Info - Left Side */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Logo and Team Name Row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        {/* Logo */}
                        <Box sx={{
                            width: 32,
                            height: 32,
                            mr: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {awayTeam?.scorebug_logo ? (
                                <Box
                                    component="img"
                                    src={awayTeam.scorebug_logo}
                                    alt={`${awayTeam.name} Logo`}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            ) : (
                                <Box sx={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Typography sx={{
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: 600
                                    }}>
                                        {game.away_team?.charAt(0) || 'A'}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Ranking - LEFT side in front of team name */}
                        {(() => {
                            const rank = game.away_team_rank || game.awayTeam?.rank;
                            if (rank && rank > 0) {
                                return (
                                    <Typography sx={{
                                        color: 'white',
                                        fontSize: '1.05rem',
                                        fontWeight: 600,
                                        mr: 1,
                                        opacity: 0.9
                                    }}>
                                        #{rank}
                                    </Typography>
                                );
                            }
                            return null;
                        })()}

                        {/* Team Name */}
                        <Typography sx={{
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: 600
                        }}>
                            {awayTeam?.name || game.away_team}
                        </Typography>
                    </Box>

                    {/* Timeouts - aligned with start of rank/team name text */}
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 5.5 }}>
                        {renderTimeoutBoxes(game.away_timeouts || 0)}
                    </Box>
                </Box>

                {/* Score - Right Side with space from possession bar */}
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Typography sx={{
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        minWidth: 40,
                        textAlign: 'right'
                    }}>
                        {game.away_score || 0}
                    </Typography>
                </Box>
            </Box>

            {/* Home Team Row */}
            <Box sx={{
                display: 'flex',
                alignItems: 'flex-start',
                p: 1.5,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRight: game.possession === 'HOME' && !isGameFinal ? '4px solid #FFD700' : 'none'
            }}>
                {/* Team Info - Left Side */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Logo and Team Name Row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        {/* Logo */}
                        <Box sx={{
                            width: 32,
                            height: 32,
                            mr: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {homeTeam?.scorebug_logo ? (
                                <Box
                                    component="img"
                                    src={homeTeam.scorebug_logo}
                                    alt={`${homeTeam.name} Logo`}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            ) : (
                                <Box sx={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Typography sx={{
                                        color: 'white',
                                        fontSize: '1rem',
                                        fontWeight: 600
                                    }}>
                                        {game.home_team?.charAt(0) || 'H'}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Ranking - LEFT side in front of team name */}
                        {(() => {
                            const rank = game.home_team_rank || game.homeTeam?.rank;
                            if (rank && rank > 0) {
                                return (
                                    <Typography sx={{
                                        color: 'white',
                                        fontSize: '1.05rem',
                                        fontWeight: 600,
                                        mr: 1,
                                        opacity: 0.9
                                    }}>
                                        #{rank}
                                    </Typography>
                                );
                            }
                            return null;
                        })()}

                        {/* Team Name */}
                        <Typography sx={{
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: 600
                        }}>
                            {homeTeam?.name || game.home_team}
                        </Typography>
                    </Box>

                    {/* Timeouts - aligned with start of rank/team name text */}
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 5.5 }}>
                        {renderTimeoutBoxes(game.home_timeouts || 0)}
                    </Box>
                </Box>

                {/* Score - Right Side with space from possession bar */}
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    <Typography sx={{
                        color: 'white',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        minWidth: 40,
                        textAlign: 'right'
                    }}>
                        {game.home_score || 0}
                    </Typography>
                </Box>
            </Box>

            {/* Game Status Row */}
            {!isGameFinal ? (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }}>
                    {/* Quarter */}
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            mb: 0.25
                        }}>
                            QTR
                        </Typography>
                        <Typography sx={{
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            {formatQuarter(game.quarter)}
                        </Typography>
                    </Box>

                    {/* Clock */}
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            mb: 0.25
                        }}>
                            TIME
                        </Typography>
                        <Typography sx={{
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: 600
                        }}>
                            {formatClock(game.quarter, game.clock)}
                        </Typography>
                    </Box>

                    {/* Ball Location */}
                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            mb: 0.25
                        }}>
                            BALL
                        </Typography>
                        <Typography sx={{
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: 600
                        }}>
                            {formatBallLocation(game.ball_location, game.possession, homeTeam, awayTeam)}
                        </Typography>
                    </Box>

                    {/* Down & Yards to Go */}
                    <Box sx={{ flex: 1.5, textAlign: 'center' }}>
                        <Typography sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            mb: 0.25
                        }}>
                            DOWN
                        </Typography>
                        <Typography sx={{
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: 600
                        }}>
                            {formatDownAndDistance(game)}
                        </Typography>
                    </Box>
                </Box>
            ) : (
                /* Final Status */
                <Box sx={{
                    p: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    textAlign: 'center'
                }}>
                    <Typography sx={{
                        color: 'white',
                        fontSize: '1rem',
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