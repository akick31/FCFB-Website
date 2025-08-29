import React from 'react';
import {
    Box,
    Typography,
    useTheme
} from '@mui/material';
import {
    TrackChanges,
    Timer,
    HourglassEmpty,
    Tv,
    RadioButtonUnchecked
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import { 
    formatTVChannel, 
    formatCoinTossWinner, 
    formatWaitingOn, 
    formatGameTimer 
} from '../../utils/gameUtils';

const GameDetailsCard = ({ game, sx = {} }) => {
    const theme = useTheme();

    if (!game) return null;

    const gameStatus = [
        {
            label: 'Coin Toss Winner',
            value: formatCoinTossWinner(game.coin_toss_winner, game.home_team, game.away_team),
            icon: <RadioButtonUnchecked fontSize="small" />
        },
        {
            label: 'Coin Toss Choice',
            value: game.coin_toss_choice || 'N/A',
            icon: <TrackChanges fontSize="small" />
        },
        {
            label: 'Game Timer',
            value: formatGameTimer(game.game_timer, game.status),
            icon: <Timer fontSize="small" />
        },
        {
            label: 'Waiting On',
            value: formatWaitingOn(game.waiting_on, game.home_team, game.away_team, game.status),
            icon: <HourglassEmpty fontSize="small" />
        }
    ];

    const additionalInfo = [];
    if (game.tv_channel) {
        additionalInfo.push({
            label: 'TV Channel',
            value: formatTVChannel(game.tv_channel),
            icon: <Tv fontSize="small" />
        });
    }

    return (
        <Box sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            border: `2px solid ${theme.palette.primary.main}`,
            overflow: 'hidden',
            boxShadow: `0 4px 20px ${theme.palette.primary.main}20`,
            ...sx
        }}>
            {/* Header */}
            <Box sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                p: 1.5,
                textAlign: 'center'
            }}>
                <Typography variant="h6" sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem'
                }}>
                    Game Details
                </Typography>
                <Typography variant="body2" sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.75rem',
                    mt: 0.25
                }}>
                    Match Status & Additional Information
                </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ p: 1.5 }}>
                {/* Game Status Section */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{
                        color: theme.palette.secondary.main,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                    }}>
                        <TrackChanges fontSize="small" />
                        Game Status
                    </Typography>
                    
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 1
                    }}>
                        {gameStatus.map((status, index) => (
                            <Box key={index} sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1,
                                backgroundColor: theme.palette.grey[50],
                                borderRadius: 1,
                                border: '1px solid #e0e0e0'
                            }}>
                                <Box sx={{ color: theme.palette.secondary.main }}>
                                    {status.icon}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="caption" sx={{
                                        color: 'text.secondary',
                                        fontSize: '0.65rem',
                                        fontWeight: 500,
                                        display: 'block'
                                    }}>
                                        {status.label}
                                    </Typography>
                                    <Typography variant="body2" sx={{
                                        color: 'text.primary',
                                        fontWeight: 600,
                                        fontSize: '0.75rem'
                                    }}>
                                        {status.value}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Additional Information */}
                {additionalInfo.length > 0 && (
                    <Box>
                        <Typography variant="subtitle2" sx={{
                            color: theme.palette.info.main,
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}>
                            <Tv fontSize="small" />
                            Additional Info
                        </Typography>
                        
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: 1
                        }}>
                            {additionalInfo.map((info, index) => (
                                <Box key={index} sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1,
                                    backgroundColor: theme.palette.grey[50],
                                    borderRadius: 1,
                                    border: '1px solid #e0e0e0'
                                }}>
                                    <Box sx={{ color: theme.palette.info.main }}>
                                        {info.icon}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="caption" sx={{
                                            color: 'text.secondary',
                                            fontSize: '0.65rem',
                                            fontWeight: 500,
                                            display: 'block'
                                        }}>
                                            {info.label}
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: 'text.primary',
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                        }}>
                                            {info.value}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

GameDetailsCard.propTypes = {
    game: PropTypes.object.isRequired,
    homeTeam: PropTypes.object,
    awayTeam: PropTypes.object,
    sx: PropTypes.object
};

export default GameDetailsCard; 