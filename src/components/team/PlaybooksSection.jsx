import React from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    Chip,
    useTheme
} from '@mui/material';
import { getTeamPlaybooks } from '../../utils/teamDataUtils';

/**
 * Reusable PlaybooksSection component for displaying team playbook information
 * @param {Object} props - Component props
 * @param {Object} props.team - Team object
 * @param {string} props.title - Section title (default: "Team Strategy")
 * @param {Object} props.sx - Additional styles
 * @returns {JSX.Element} - PlaybooksSection component
 */
const PlaybooksSection = ({ 
    team, 
    title = "Team Strategy",
    sx = {}
}) => {
    const theme = useTheme();
    const playbooks = getTeamPlaybooks(team);

    if (!playbooks.offensive && !playbooks.defensive) {
        return null;
    }

    return (
        <Box sx={{ 
            mb: 4, 
            p: { xs: 2, md: 3 }, 
            backgroundColor: 'background.paper',
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[1],
            ...sx
        }}>
            <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3,
                fontSize: { xs: '1.125rem', md: '1.25rem' }
            }}>
                {title}
            </Typography>
            <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ p: { xs: 1.5, md: 2 }, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            fontSize: { xs: '0.875rem', md: '1rem' }
                        }}>
                            Offensive Playbook
                        </Typography>
                        <Chip 
                            label={playbooks.offensive} 
                            color="primary"
                            variant="outlined"
                            size="small"
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box sx={{ p: { xs: 1.5, md: 2 }, backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            fontSize: { xs: '0.875rem', md: '1rem' }
                        }}>
                            Defensive Playbook
                        </Typography>
                        <Chip 
                            label={playbooks.defensive} 
                            color="secondary"
                            variant="outlined"
                            size="small"
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PlaybooksSection; 