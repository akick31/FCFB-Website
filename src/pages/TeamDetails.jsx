import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    Chip, 
    Avatar,
    Divider,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
    IconButton
} from '@mui/material';
import { 
    ArrowBack,
    SportsFootball,
    Person,
    Message,
    EmojiEvents,
    TrendingUp
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllTeams } from '../api/teamApi';
import { formatConferenceName } from '../utils/conferenceUtils';
import { 
    formatTeamStats, 
    getTeamCoaches, 
    getTeamPlaybooks, 
    getTeamRankings,
    getTeamColors
} from '../utils/teamDataUtils';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/icons/LoadingSpinner';
import ErrorMessage from '../components/message/ErrorMessage';
import CoachesSection from '../components/team/CoachesSection';
import PlaybooksSection from '../components/team/PlaybooksSection';

const TeamDetails = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { teamId } = useParams();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const teams = await getAllTeams();
                const foundTeam = teams.find(t => t.id === parseInt(teamId));
                if (foundTeam) {
                    setTeam(foundTeam);
                } else {
                    setError('Team not found');
                }
                setLoading(false);
            } catch (error) {
                setError('Failed to load team information');
                setLoading(false);
            }
        };
        fetchTeam();
    }, [teamId]);

    if (loading) {
        return (
            <PageLayout
                title="Team Details"
                subtitle="Loading team information..."
            >
                <LoadingSpinner />
            </PageLayout>
        );
    }

    if (error || !team) {
        return (
            <PageLayout
                title="Team Details"
                subtitle="Error loading team"
            >
                <ErrorMessage message={error || 'Team not found'} />
            </PageLayout>
        );
    }

    const stats = formatTeamStats(team);
    const coaches = getTeamCoaches(team);
    const playbooks = getTeamPlaybooks(team);
    const rankings = getTeamRankings(team);
    const colors = getTeamColors(team);

    return (
        <PageLayout
            title=""
            subtitle=""
        >
            {/* Back Button */}
            <Box sx={{ mb: 3 }}>
                <IconButton 
                    onClick={() => navigate('/teams')}
                    sx={{ 
                        color: theme.palette.primary.main,
                        '&:hover': { backgroundColor: theme.palette.primary.light + '20' }
                    }}
                >
                    <ArrowBack />
                </IconButton>
                <Typography variant="body2" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
                    Back to Teams
                </Typography>
            </Box>

            {/* Team Header with Coaches */}
            <Box sx={{ 
                mb: 4, 
                p: { xs: 2, md: 4 }, 
                backgroundColor: 'background.paper',
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[2],
                textAlign: 'center'
            }}>
                <Grid container spacing={3} alignItems="center">
                    {/* Team Logo */}
                    <Grid item xs={12} md={3}>
                        <Box
                            component="img"
                            src={team.logo || 'https://via.placeholder.com/120x120/004260/ffffff?text=T'}
                            alt={`${team.name} Logo`}
                            sx={{
                                width: { xs: 80, md: 120 },
                                height: { xs: 80, md: 120 },
                                objectFit: 'cover',
                                borderRadius: 2
                            }}
                        />
                    </Grid>
                    
                    {/* Team Info */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" sx={{ 
                            fontWeight: 700, 
                            mb: 1,
                            fontSize: { xs: '1.5rem', md: '2rem' }
                        }}>
                            {team.name}
                        </Typography>
                        {team.abbreviation && (
                            <Typography variant="h6" sx={{ 
                                color: 'text.secondary', 
                                mb: 2,
                                fontSize: { xs: '1rem', md: '1.25rem' }
                            }}>
                                {team.abbreviation}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 3 }}>
                            <Chip 
                                label={formatConferenceName(team.conference)} 
                                color="primary"
                                sx={{ fontWeight: 600 }}
                            />
                            <Chip 
                                label={team.is_taken ? 'Team Taken' : 'Available'} 
                                color={team.is_taken ? 'secondary' : 'success'}
                                sx={{ fontWeight: 600 }}
                            />
                        </Box>
                    </Grid>
                    
                    {/* Coaches Section */}
                    <Grid item xs={12} md={3}>
                        {coaches.length > 0 && (
                            <Box>
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 600, 
                                    mb: 2,
                                    fontSize: { xs: '1rem', md: '1.25rem' }
                                }}>
                                    Coaching Staff
                                </Typography>
                                {coaches.map((coach, index) => (
                                    <Box key={index} sx={{ 
                                        mb: 2, 
                                        p: 2, 
                                        backgroundColor: theme.palette.grey[50], 
                                        borderRadius: 2,
                                        border: `1px solid ${theme.palette.divider}`
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Avatar sx={{ 
                                                mr: 2, 
                                                bgcolor: theme.palette.primary.main,
                                                width: { xs: 32, md: 40 },
                                                height: { xs: 32, md: 40 }
                                            }}>
                                                <Person />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ 
                                                    fontWeight: 600,
                                                    fontSize: { xs: '0.875rem', md: '1rem' }
                                                }}>
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
                                                <Message sx={{ 
                                                    fontSize: { xs: 14, md: 16 }, 
                                                    mr: 1, 
                                                    color: theme.palette.info.main 
                                                }} />
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                    {coach.discordTag}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Box>

            {/* Team Stats Grid */}
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
                {/* Current Season Stats */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ 
                        height: '100%',
                        backgroundColor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.shadows[1]
                    }}>
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TrendingUp sx={{ mr: 1, color: theme.palette.primary.main }} />
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 600,
                                    fontSize: { xs: '1.125rem', md: '1.25rem' }
                                }}>
                                    Current Season
                                </Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Overall Record
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {stats.currentRecord}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Conference Record
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {stats.currentConferenceRecord}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Overall Stats */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ 
                        height: '100%',
                        backgroundColor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: theme.shadows[1]
                    }}>
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <EmojiEvents sx={{ mr: 1, color: theme.palette.secondary.main }} />
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 600,
                                    fontSize: { xs: '1.125rem', md: '1.25rem' }
                                }}>
                                    All-Time Records
                                </Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Overall Record
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {stats.overallRecord}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Conference Record
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {stats.overallConferenceRecord}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Championships and Playoffs */}
            <Box sx={{ 
                mb: 4, 
                p: { xs: 2, md: 3 }, 
                backgroundColor: 'background.paper',
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[1]
            }}>
                <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 3,
                    fontSize: { xs: '1.125rem', md: '1.25rem' }
                }}>
                    Championships & Playoffs
                </Typography>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid item xs={6} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 800, 
                                color: theme.palette.primary.main,
                                fontSize: { xs: '1.5rem', md: '2.125rem' }
                            }}>
                                {team.national_championship_wins || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: { xs: '0.75rem', md: '0.875rem' }
                            }}>
                                National Championships
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 800, 
                                color: theme.palette.secondary.main,
                                fontSize: { xs: '1.5rem', md: '2.125rem' }
                            }}>
                                {team.conference_championship_wins || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: { xs: '0.75rem', md: '0.875rem' }
                            }}>
                                Conference Championships
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 800, 
                                color: theme.palette.warning.main,
                                fontSize: { xs: '1.5rem', md: '2.125rem' }
                            }}>
                                {team.playoff_wins || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: { xs: '0.75rem', md: '0.875rem' }
                            }}>
                                Playoff Wins
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                            <Typography variant="h4" sx={{ 
                                fontWeight: 800, 
                                color: theme.palette.info.main,
                                fontSize: { xs: '1.5rem', md: '2.125rem' }
                            }}>
                                {team.bowl_wins || 0}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontSize: { xs: '0.75rem', md: '0.875rem' }
                            }}>
                                Bowl Wins
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Playbooks */}
            <PlaybooksSection team={team} />

            {/* Rankings */}
            {(rankings.coachesPoll || rankings.playoffCommittee) && (
                <Box sx={{ 
                    p: { xs: 2, md: 3 }, 
                    backgroundColor: 'background.paper',
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[1]
                }}>
                    <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        mb: 3,
                        fontSize: { xs: '1.125rem', md: '1.25rem' }
                    }}>
                        Current Rankings
                    </Typography>
                    <Grid container spacing={{ xs: 2, md: 3 }}>
                        {rankings.coachesPoll && (
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                                    <Typography variant="h4" sx={{ 
                                        fontWeight: 800, 
                                        color: theme.palette.primary.main,
                                        fontSize: { xs: '1.5rem', md: '2.125rem' }
                                    }}>
                                        #{rankings.coachesPoll}
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                        color: 'text.secondary',
                                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                                    }}>
                                        Coaches Poll Ranking
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                        {rankings.playoffCommittee && (
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ textAlign: 'center', p: { xs: 1, md: 2 } }}>
                                    <Typography variant="h4" sx={{ 
                                        fontWeight: 800, 
                                        color: theme.palette.secondary.main,
                                        fontSize: { xs: '1.5rem', md: '2.125rem' }
                                    }}>
                                        #{rankings.playoffCommittee}
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                        color: 'text.secondary',
                                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                                    }}>
                                        Playoff Committee Ranking
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            )}
        </PageLayout>
    );
};

export default TeamDetails;