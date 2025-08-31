import React from 'react';
import {
    Box,
    Typography,
    Chip,
    useTheme
} from '@mui/material';
import PropTypes from 'prop-types';
import { getTeamPlaybooks } from '../../utils/teamDataUtils';
import {formatConferenceName} from "../../utils/conferenceUtils";

const TeamDetailsCard = ({ team, game, isHomeTeam, sx = {} }) => {
    const theme = useTheme();

    if (!team || !game) return null;

    const formatRanking = (rank) => {
        if (!rank || rank === 0) return 'Unranked';
        return `#${rank}`;
    };

    const formatRecord = (wins, losses) => {
        if (wins === undefined || losses === undefined) return "N/A";
        return `${wins}-${losses}`;
    };

    // Get team colors with fallbacks
    const getTeamColors = (team) => {
        if (!team || !team.primaryColor) {
            return {
                primary: theme.palette.primary.main,
                secondary: theme.palette.primary.dark
            };
        }
        
        return {
            primary: team.primaryColor,
            secondary: team.secondaryColor || theme.palette.primary.dark
        };
    };

    const teamColors = getTeamColors(team);
    const isHome = isHomeTeam;
    
    // Get team data based on home/away
    const teamData = isHome ? {
        coaches: game.home_coaches,
        offensivePlaybook: game.home_offensive_playbook,
        defensivePlaybook: game.home_defensive_playbook,
        wins: game.home_wins,
        losses: game.home_losses,
        conferenceWins: game.home_conference_wins,
        conferenceLosses: game.home_conference_losses,
        rank: game.home_team_rank
    } : {
        coaches: game.away_coaches,
        offensivePlaybook: game.away_offensive_playbook,
        defensivePlaybook: game.away_defensive_playbook,
        wins: game.away_wins,
        losses: game.away_losses,
        conferenceWins: game.away_conference_wins,
        conferenceLosses: game.away_conference_losses,
        rank: game.away_team_rank
    };

    return (
        <Box sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            border: `2px solid ${teamColors.primary}`,
            overflow: 'hidden',
            boxShadow: `0 4px 20px ${teamColors.primary}20`,
            position: 'relative',
            ...sx
        }}>
            {/* Header with team logo and name */}
            <Box sx={{
                background: `linear-gradient(135deg, ${teamColors.primary} 0%, ${teamColors.secondary} 100%)`,
                p: 1.9,
                textAlign: 'center',
                position: 'relative'
            }}>
                {/* Home/Away indicator - moved to top-left corner */}
                <Box sx={{
                    position: 'absolute',
                    top: 6,
                    left: 6,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Typography variant="caption" sx={{ 
                        color: 'white', 
                        fontWeight: 700,
                        fontSize: '0.65rem'
                    }}>
                        {isHome ? 'H' : 'A'}
                    </Typography>
                </Box>
                
                <img
                    src={team.logo}
                    alt={`${team.name} Logo`}
                    style={{
                        width: 55,
                        height: 55,
                        margin: '0 auto 6px auto',
                        display: 'block',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        padding: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                />
                
                <Typography variant="h6" sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    mb: 0.4
                }}>
                    {team.name}
                </Typography>
                
                {team.abbreviation && (
                    <Typography variant="body2" sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.75rem'
                    }}>
                        {team.abbreviation}
                    </Typography>
                )}
            </Box>

            {/* Team Stats Grid */}
            <Box sx={{ p: 1.9 }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 1.9,
                    mb: 1.9
                }}>
                    {/* Overall Record */}
                    <Box sx={{
                        textAlign: 'center',
                        p: 1.4,
                        backgroundColor: theme.palette.grey[50],
                        borderRadius: 1,
                        border: '1px solid #e0e0e0'
                    }}>
                        <Typography variant="caption" sx={{
                            color: 'text.secondary',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            display: 'block',
                            mb: 0.4
                        }}>
                            Record
                        </Typography>
                        <Typography variant="h6" sx={{
                            color: teamColors.primary,
                            fontWeight: 700,
                            fontSize: '1rem'
                        }}>
                            {formatRecord(teamData.wins, teamData.losses)}
                        </Typography>
                    </Box>

                    {/* Conference Record */}
                    <Box sx={{
                        textAlign: 'center',
                        p: 1.4,
                        backgroundColor: theme.palette.grey[50],
                        borderRadius: 1,
                        border: '1px solid #e0e0e0'
                    }}>
                        <Typography variant="caption" sx={{
                            color: 'text.secondary',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            display: 'block',
                            mb: 0.4
                        }}>
                            Conference
                        </Typography>
                        <Typography variant="h6" sx={{
                            color: teamColors.primary,
                            fontWeight: 700,
                            fontSize: '1rem'
                        }}>
                            {formatRecord(teamData.conferenceWins || 0, teamData.conferenceLosses || 0)}
                        </Typography>
                    </Box>
                </Box>

                {/* Ranking */}
                <Box sx={{
                    textAlign: 'center',
                    mb: 1.9
                }}>
                    <Typography variant="caption" sx={{
                        color: 'text.secondary',
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        display: 'block',
                        mb: 0.4
                    }}>
                        Ranking
                    </Typography>
                    <Chip
                        label={formatRanking(teamData.rank)}
                        size="small"
                        sx={{
                            backgroundColor: teamData.rank && teamData.rank !== 0 ? teamColors.primary : theme.palette.grey[300],
                            color: teamData.rank && teamData.rank !== 0 ? 'white' : 'text.secondary',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                        }}
                    />
                </Box>

                {/* Playbooks */}
                <Box sx={{ mb: 1.9, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{
                        color: 'text.secondary',
                        fontSize: '0.65rem',
                        fontWeight: 500,
                        display: 'block',
                        mb: 0.9
                    }}>
                        Playbooks
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.9, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {teamData.offensivePlaybook && (
                            <Chip
                                label={`Off: ${getTeamPlaybooks({ offensive_playbook: teamData.offensivePlaybook }).offensive}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                    borderColor: teamColors.primary,
                                    color: teamColors.primary,
                                    fontSize: '0.65rem'
                                }}
                            />
                        )}
                        {teamData.defensivePlaybook && (
                            <Chip
                                label={`Def: ${getTeamPlaybooks({ defensive_playbook: teamData.defensivePlaybook }).defensive}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                    borderColor: teamColors.secondary,
                                    color: teamColors.secondary,
                                    fontSize: '0.65rem'
                                }}
                            />
                        )}
                    </Box>
                </Box>

                {/* Coaches */}
                {teamData.coaches && teamData.coaches.length > 0 && (
                    <Box sx={{ mb: 1.9 }}>
                        <Typography variant="caption" sx={{
                            color: 'text.secondary',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            display: 'block',
                            mb: 0.9
                        }}>
                            Coaches
                        </Typography>
                        <Box sx={{
                            backgroundColor: theme.palette.grey[50],
                            p: 1.4,
                            borderRadius: 1,
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="body2" sx={{
                                color: 'text.primary',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                textAlign: 'center'
                            }}>
                                {teamData.coaches.join(", ")}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Conference */}
                {team.conference && (
                    <Box sx={{ mt: 1.9, textAlign: 'center' }}>
                        <Typography variant="caption" sx={{
                            color: 'text.secondary',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            display: 'block',
                            mb: 0.4
                        }}>
                            Conference
                        </Typography>
                        <Typography variant="body2" sx={{
                            color: teamColors.primary,
                            fontWeight: 600,
                            fontSize: '0.75rem'
                        }}>
                            {formatConferenceName(team.conference)}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

TeamDetailsCard.propTypes = {
    team: PropTypes.object.isRequired,
    game: PropTypes.object.isRequired,
    isHomeTeam: PropTypes.bool.isRequired,
    sx: PropTypes.object
};

export default TeamDetailsCard; 