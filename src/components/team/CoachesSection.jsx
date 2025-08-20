import React from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    Avatar,
    useTheme
} from '@mui/material';
import { 
    Person,
    Message
} from '@mui/icons-material';
import { getTeamCoaches } from '../../utils/teamDataUtils';

/**
 * Reusable CoachesSection component for displaying team coaching staff
 * @param {Object} props - Component props
 * @param {Object} props.team - Team object
 * @param {string} props.title - Section title (default: "Coaching Staff")
 * @param {boolean} props.showDiscordIds - Whether to show Discord IDs (default: false)
 * @param {Object} props.sx - Additional styles
 * @returns {JSX.Element} - CoachesSection component
 */
const CoachesSection = ({ 
    team, 
    title = "Coaching Staff", 
    showDiscordIds = false,
    sx = {}
}) => {
    const theme = useTheme();
    const coaches = getTeamCoaches(team);

    if (!coaches || coaches.length === 0) {
        return null;
    }

    return (
        <Box sx={{ 
            mb: 4, 
            p: 3, 
            backgroundColor: 'background.paper',
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[1],
            ...sx
        }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                {title}
            </Typography>
            
            <Grid container spacing={2}>
                {coaches.map((coach, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box sx={{ 
                            p: 2, 
                            backgroundColor: theme.palette.grey[50], 
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ mr: 2, bgcolor: theme.palette.primary.main }}>
                                    <Person />
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        {coach.name}
                                    </Typography>
                                    {coach.username && (
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            @{coach.username}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            
                            {coach.discordTag && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    <Message sx={{ fontSize: 16, mr: 1, color: theme.palette.info.main }} />
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {coach.discordTag}
                                    </Typography>
                                </Box>
                            )}
                            
                            {showDiscordIds && coach.discordId && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                        Discord ID: {coach.discordId}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default CoachesSection; 