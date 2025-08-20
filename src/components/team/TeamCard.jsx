import React from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    Chip, 
    Card,
    CardContent,
    useTheme
} from '@mui/material';
import { formatConferenceName } from '../../utils/conferenceUtils';
import { 
    getTeamStatusText, 
    getTeamStatusColor, 
    formatTeamStats 
} from '../../utils/teamDataUtils';

/**
 * Reusable TeamCard component for displaying team information
 * @param {Object} props - Component props
 * @param {Object} props.team - Team object
 * @param {boolean} props.showLogo - Whether to show team logo (default: true)
 * @param {boolean} props.showStats - Whether to show team statistics (default: false)
 * @param {boolean} props.showConference - Whether to show conference (default: true)
 * @param {boolean} props.showStatus - Whether to show team status (default: true)
 * @param {string} props.variant - Card variant: 'compact', 'detailed', 'full' (default: 'compact')
 * @param {Function} props.onClick - Click handler for the card
 * @param {Object} props.sx - Additional styles
 * @returns {JSX.Element} - TeamCard component
 */
const TeamCard = ({ 
    team, 
    showLogo = true, 
    showStats = false, 
    showConference = true, 
    showStatus = true,
    variant = 'compact',
    onClick,
    sx = {}
}) => {
    const theme = useTheme();
    
    if (!team) return null;

    const stats = formatTeamStats(team);
    const isClickable = !!onClick;

    const cardContent = (
        <CardContent sx={{ p: variant === 'compact' ? { xs: 1.5, md: 2 } : { xs: 2, md: 3 } }}>
            <Grid container spacing={variant === 'compact' ? { xs: 1, md: 1 } : { xs: 1, md: 2 }} alignItems="center">
                {/* Team Logo */}
                {showLogo && (
                    <Grid item xs={variant === 'compact' ? 2 : 3}>
                        <Box
                            component="img"
                            src={team.logo || 'https://via.placeholder.com/40x40/004260/ffffff?text=T'}
                            alt={`${team.name} Logo`}
                            sx={{
                                width: variant === 'compact' ? { xs: 32, md: 40 } : { xs: 48, md: 60 },
                                height: variant === 'compact' ? { xs: 32, md: 40 } : { xs: 48, md: 60 },
                                objectFit: 'cover',
                                borderRadius: variant === 'compact' ? 1 : 2
                            }}
                        />
                    </Grid>
                )}

                {/* Team Info */}
                <Grid item xs={showLogo ? (variant === 'compact' ? 7 : 6) : (variant === 'compact' ? 9 : 8)}>
                    <Typography 
                        variant={variant === 'compact' ? 'body1' : 'h6'} 
                        sx={{ 
                            fontWeight: 600, 
                            mb: variant === 'compact' ? 0.5 : 1,
                            fontSize: variant === 'compact' ? { xs: '0.875rem', md: '1rem' } : { xs: '1rem', md: '1.25rem' }
                        }}
                    >
                        {team.name}
                    </Typography>
                    
                    {team.abbreviation && (
                        <Typography variant="caption" sx={{ 
                            color: 'text.secondary', 
                            display: 'block',
                            fontSize: { xs: '0.75rem', md: '0.75rem' }
                        }}>
                            {team.abbreviation}
                        </Typography>
                    )}

                    {/* Conference and Status Chips */}
                    <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        mt: variant === 'compact' ? 0.5 : 1, 
                        flexWrap: 'wrap' 
                    }}>
                        {showConference && team.conference && (
                            <Chip 
                                label={formatConferenceName(team.conference)} 
                                size="small"
                                color="primary"
                                sx={{ 
                                    fontWeight: 500,
                                    fontSize: { xs: '0.75rem', md: '0.75rem' }
                                }}
                            />
                        )}
                        
                        {showStatus && (
                            <Chip 
                                label={getTeamStatusText(team)} 
                                size="small"
                                color={getTeamStatusColor(team)}
                                sx={{ 
                                    fontWeight: 500,
                                    fontSize: { xs: '0.75rem', md: '0.75rem' }
                                }}
                            />
                        )}
                    </Box>
                </Grid>

                {/* Team Stats (if detailed variant) */}
                {showStats && variant === 'detailed' && (
                    <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 700, 
                                color: theme.palette.primary.main,
                                fontSize: { xs: '1rem', md: '1.25rem' }
                            }}>
                                {stats.currentRecord}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                                color: 'text.secondary',
                                fontSize: { xs: '0.75rem', md: '0.75rem' }
                            }}>
                                Current Record
                            </Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>

            {/* Additional Stats for Full Variant */}
            {showStats && variant === 'full' && (
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Grid container spacing={{ xs: 1, md: 2 }}>
                        <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 700, 
                                    color: theme.palette.primary.main,
                                    fontSize: { xs: '1rem', md: '1.25rem' }
                                }}>
                                    {stats.currentRecord}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                    color: 'text.secondary',
                                    fontSize: { xs: '0.75rem', md: '0.75rem' }
                                }}>
                                    Current Record
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 700, 
                                    color: theme.palette.secondary.main,
                                    fontSize: { xs: '1rem', md: '1.25rem' }
                                }}>
                                    {stats.currentConferenceRecord}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                    color: 'text.secondary',
                                    fontSize: { xs: '0.75rem', md: '0.75rem' }
                                }}>
                                    Conf Record
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 700, 
                                    color: theme.palette.warning.main,
                                    fontSize: { xs: '1rem', md: '1.25rem' }
                                }}>
                                    {stats.overallRecord}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                    color: 'text.secondary',
                                    fontSize: { xs: '0.75rem', md: '0.75rem' }
                                }}>
                                    Overall Record
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 700, 
                                    color: theme.palette.info.main,
                                    fontSize: { xs: '1rem', md: '1.25rem' }
                                }}>
                                    {stats.overallConferenceRecord}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                    color: 'text.secondary',
                                    fontSize: { xs: '0.75rem', md: '0.75rem' }
                                }}>
                                    Overall Conf
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </CardContent>
    );

    if (isClickable) {
        return (
            <Card
                sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                    },
                    ...sx
                }}
                onClick={() => onClick(team)}
            >
                {cardContent}
            </Card>
        );
    }

    return (
        <Card sx={{ ...sx }}>
            {cardContent}
        </Card>
    );
};

export default TeamCard; 