import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    Chip,
    Avatar,
    Card,
    CardContent,
    useTheme,
    IconButton,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    ArrowBack,
    Person,
    Message,
    EmojiEvents,
    TrendingUp
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, Legend as RechartsLegend
} from 'recharts';
import { getAllTeams } from '../../api/teamApi';
import { getEloHistory } from '../../api/eloHistoryApi.jsx';
import { getRankingsHistory } from '../../api/rankingsHistoryApi.jsx';
import { getFilteredSeasonStats } from '../../api/seasonStatsApi';
import { getCurrentSeason, getAllSeasons } from '../../api/seasonApi';
import { conferences as conferencesList } from '../../components/constants/conferences';
import {
    formatTeamStats,
    getTeamCoaches,
    getTeamRankings,
} from '../../utils/teamDataUtils';
import PageLayout from '../../components/layout/PageLayout';
import LoadingSpinner from '../../components/icons/LoadingSpinner';
import ErrorMessage from '../../components/message/ErrorMessage';
import PlaybooksSection from '../../components/team/PlaybooksSection';

const TeamDetails = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Season selector
    const [seasons, setSeasons] = useState([]);
    const [currentSeason, setCurrentSeason] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState('current'); // 'current', 'all', or season number

    // Chart data
    const [eloData, setEloData] = useState([]);
    const [rankingsData, setRankingsData] = useState([]);
    const [seasonStats, setSeasonStats] = useState(null);
    const [chartsLoading, setChartsLoading] = useState(false);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const [teams, season, allSeasonsData] = await Promise.all([
                    getAllTeams(),
                    getCurrentSeason(),
                    getAllSeasons()
                ]);
                const foundTeam = teams.find(t => t.id === parseInt(teamId));
                if (foundTeam) {
                    setTeam(foundTeam);
                    document.title = `FCFB | ${foundTeam.name}`;
                } else {
                    setError('Team not found');
                }
                setCurrentSeason(season);
                const seasonNumbers = allSeasonsData
                    .map(s => s.season_number || s.seasonNumber)
                    .filter(Boolean)
                    .sort((a, b) => b - a);
                setSeasons(seasonNumbers);
                setLoading(false);
            } catch (error) {
                setError('Failed to load team information');
                setLoading(false);
            }
        };
        fetchTeam();
    }, [teamId]);

    // Aggregate multiple seasons' stats into one object
    const aggregateSeasonStats = (statsList) => {
        if (!statsList || statsList.length === 0) return null;
        if (statsList.length === 1) return statsList[0];

        const sumKeys = [
            'total_yards', 'pass_yards', 'rush_yards', 'touchdowns', 'first_downs',
            'opponent_total_yards', 'opponent_pass_yards', 'opponent_rush_yards', 'opponent_touchdowns',
            'sacks_forced', 'interceptions_forced', 'interceptions_lost', 'fumbles_lost',
            'pick_sixes_forced', 'turnover_differential',
        ];
        const avgKeys = [
            'average_offensive_diff', 'averageOffensiveDiff',
            'average_defensive_diff', 'averageDefensiveDiff',
            'third_down_conversion_percentage', 'red_zone_success_percentage',
            'opponent_third_down_conversion_percentage', 'field_goal_percentage',
            'average_punt_length',
        ];
        const maxKeys = ['largest_lead', 'longest_field_goal'];

        const result = { ...statsList[0] };
        sumKeys.forEach(key => {
            result[key] = statsList.reduce((sum, s) => sum + (Number(s[key]) || 0), 0);
        });
        avgKeys.forEach(key => {
            const valid = statsList.filter(s => s[key] != null);
            result[key] = valid.length > 0
                ? valid.reduce((sum, s) => sum + (Number(s[key]) || 0), 0) / valid.length
                : null;
        });
        maxKeys.forEach(key => {
            result[key] = Math.max(...statsList.map(s => Number(s[key]) || 0));
        });
        return result;
    };

    // Fetch chart data when team or selected season changes
    useEffect(() => {
        if (!team || currentSeason === null) return;

        const fetchChartData = async () => {
            setChartsLoading(true);
            try {
                const seasonParam = selectedSeason === 'all' ? null : (selectedSeason === 'current' ? currentSeason : selectedSeason);
                const isAllTime = selectedSeason === 'all';

                const [elo, rankings, statsResponse] = await Promise.all([
                    getEloHistory(team.name, seasonParam).catch(() => []),
                    getRankingsHistory(team.name, seasonParam).catch(() => []),
                    // For all-time, fetch up to 100 season rows so we can aggregate
                    isAllTime
                        ? getFilteredSeasonStats(team.name, null, null, null, 0, 100).catch(() => null)
                        : getFilteredSeasonStats(team.name, null, seasonParam, null, 0, 1).catch(() => null)
                ]);

                // Format ELO data for chart
                if (elo && elo.length > 0) {
                    const formatted = elo.map(entry => ({
                        week: isAllTime
                            ? `S${entry.season || ''}W${entry.week || entry.game_week || ''}`
                            : `W${entry.week || entry.game_week || ''}`,
                        elo: Math.round(entry.elo || entry.elo_rating || 0)
                    }));
                    setEloData(formatted);
                } else {
                    setEloData([]);
                }

                // Format rankings data for chart
                if (rankings && rankings.length > 0) {
                    const formatted = rankings.map(game => {
                        const isHome = game.home_team === team.name;
                        const rank = isHome ? game.home_team_rank : game.away_team_rank;
                        const pcRank = isHome ? game.home_playoff_committee_rank : game.away_playoff_committee_rank;
                        return {
                            week: isAllTime
                                ? `S${game.season || ''}W${game.week || ''}`
                                : `W${game.week || ''}`,
                            coachesPoll: (rank && rank > 0) ? rank : null,
                            playoffCommittee: (pcRank && pcRank > 0) ? pcRank : null,
                        };
                    });
                    setRankingsData(formatted);
                } else {
                    setRankingsData([]);
                }

                // Season stats — aggregate multiple seasons when 'all' selected
                if (statsResponse?.content?.length > 0) {
                    if (isAllTime && statsResponse.content.length > 1) {
                        setSeasonStats(aggregateSeasonStats(statsResponse.content));
                    } else {
                        setSeasonStats(statsResponse.content[0]);
                    }
                } else {
                    setSeasonStats(null);
                }
            } catch (err) {
                console.error('Failed to load chart data:', err);
            } finally {
                setChartsLoading(false);
            }
        };

        fetchChartData();
    }, [team, selectedSeason, currentSeason]);

    if (loading) {
        return (
            <PageLayout title="Team Details" subtitle="Loading team information...">
                <LoadingSpinner />
            </PageLayout>
        );
    }

    if (error || !team) {
        return (
            <PageLayout title="Team Details" subtitle="Error loading team">
                <ErrorMessage message={error || 'Team not found'} />
            </PageLayout>
        );
    }

    const stats = formatTeamStats(team);
    const coaches = getTeamCoaches(team);
    const rankings = getTeamRankings(team);
    const confData = conferencesList.find(c => c.value === team.conference);
    const hasPlayoffCommitteeData = rankingsData.some(d => d.playoffCommittee != null);

    return (
        <PageLayout title="" subtitle="">
            {/* Back Button */}
            <Box component="a" href="/teams" onClick={(e) => { if (!e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); navigate('/teams'); } }} sx={{ mb: 3, display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                <IconButton
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

            {/* Team Header */}
            <Box sx={{
                mb: 4,
                p: { xs: 2, md: 4 },
                backgroundColor: 'background.paper',
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[2],
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    gap: 3
                }}>
                    {/* Team Logo */}
                    <Box
                        component="img"
                        src={team.logo || 'https://via.placeholder.com/120x120/004260/ffffff?text=T'}
                        alt={`${team.name} Logo`}
                        sx={{ width: { xs: 80, md: 100 }, height: { xs: 80, md: 100 }, objectFit: 'contain' }}
                    />

                    {/* Team Info */}
                    <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                            {team.name}
                        </Typography>
                        {team.abbreviation && (
                            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                                {team.abbreviation}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' }, alignItems: 'center' }}>
                            {confData?.logo ? (
                                <Chip
                                    avatar={<Avatar src={confData.logo} sx={{ width: 22, height: 22 }} variant="rounded" />}
                                    label={confData.label}
                                    color="primary"
                                    sx={{ fontWeight: 600 }}
                                />
                            ) : (
                                <Chip label={confData?.label || team.conference} color="primary" sx={{ fontWeight: 600 }} />
                            )}
                            <Chip label={team.is_taken ? 'Taken' : 'Available'} color={team.is_taken ? 'secondary' : 'success'} size="small" sx={{ fontWeight: 600 }} />
                            {team.current_elo != null && (
                                <Chip label={`ELO: ${Math.round(team.current_elo)}`} color="warning" size="small" sx={{ fontWeight: 600 }} />
                            )}
                            {rankings.coachesPoll && (
                                <Chip label={`#${rankings.coachesPoll} Coaches Poll`} size="small" variant="outlined" sx={{ fontWeight: 600, borderColor: theme.palette.primary.main, color: theme.palette.primary.main }} />
                            )}
                            {rankings.playoffCommittee && (
                                <Chip label={`#${rankings.playoffCommittee} Playoff Committee`} size="small" variant="outlined" sx={{ fontWeight: 600, borderColor: theme.palette.secondary.main, color: theme.palette.secondary.main }} />
                            )}
                        </Box>
                    </Box>

                    {/* Quick Records */}
                    <Box sx={{ display: 'flex', gap: 2, textAlign: 'center' }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Record</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.currentRecord}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Conf</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.currentConferenceRecord}</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Coaches Row */}
                {coaches.length > 0 && (
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                        {coaches.map((coach, index) => (
                            <Box
                                key={index}
                                component="a"
                                href={`/user-details/${encodeURIComponent(coach.name)}`}
                                sx={{
                                    display: 'flex', alignItems: 'center', gap: 1,
                                    cursor: 'pointer',
                                    textDecoration: 'none', color: 'inherit',
                                    '&:hover': { opacity: 0.7 },
                                }}
                                onClick={(e) => {
                                    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                                    e.preventDefault();
                                    navigate(`/user-details/${encodeURIComponent(coach.name)}`);
                                }}
                            >
                                <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.main, fontSize: '0.75rem' }}>
                                    <Person sx={{ fontSize: 16 }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', textDecoration: 'underline', textDecorationColor: 'transparent', '&:hover': { textDecorationColor: 'inherit' } }}>
                                        {coach.name}
                                    </Typography>
                                    {coach.discordTag && (
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                                            <Message sx={{ fontSize: 11 }} /> {coach.discordTag}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Season Selector + Charts */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Season</InputLabel>
                    <Select
                        value={selectedSeason}
                        label="Season"
                        onChange={(e) => setSelectedSeason(e.target.value)}
                    >
                        <MenuItem value="current">Current Season</MenuItem>
                        <MenuItem value="all">All-Time</MenuItem>
                        {seasons.map(s => (
                            <MenuItem key={s} value={s}>Season {s}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {chartsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={32} />
                </Box>
            ) : (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* ELO History Chart - always show */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%', boxShadow: theme.shadows[1] }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                                    ELO History
                                </Typography>
                                {eloData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={eloData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="week" fontSize={11} angle={selectedSeason === 'all' ? -45 : 0} textAnchor={selectedSeason === 'all' ? 'end' : 'middle'} height={selectedSeason === 'all' ? 60 : 30} />
                                            <YAxis domain={['auto', 'auto']} fontSize={12} />
                                            <RechartsTooltip />
                                            <Line type="monotone" dataKey="elo" name="ELO" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography color="text.secondary" variant="body2">No ELO data available for this period</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Rankings History Chart - always show */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%', boxShadow: theme.shadows[1] }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem' }}>
                                    Rankings History
                                </Typography>
                                {rankingsData.some(d => d.coachesPoll != null || d.playoffCommittee != null) ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={rankingsData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="week" fontSize={11} angle={selectedSeason === 'all' ? -45 : 0} textAnchor={selectedSeason === 'all' ? 'end' : 'middle'} height={selectedSeason === 'all' ? 60 : 30} />
                                            <YAxis reversed domain={[1, 'auto']} fontSize={12} />
                                            <RechartsTooltip />
                                            {hasPlayoffCommitteeData && <RechartsLegend />}
                                            <Line type="monotone" dataKey="coachesPoll" name="Coaches Poll" stroke={theme.palette.primary.main} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
                                            {hasPlayoffCommitteeData && (
                                                <Line type="monotone" dataKey="playoffCommittee" name="Playoff Committee" stroke={theme.palette.secondary.main} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls strokeDasharray="5 5" />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography color="text.secondary" variant="body2">No ranking data available for this period</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Season Stats Cards */}
            {seasonStats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', boxShadow: theme.shadows[1] }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem', color: theme.palette.primary.main }}>Offense</Typography>
                                <StatRow label="Total Yards" value={seasonStats.total_yards} />
                                <StatRow label="Pass Yards" value={seasonStats.pass_yards} />
                                <StatRow label="Rush Yards" value={seasonStats.rush_yards} />
                                <StatRow label="Touchdowns" value={seasonStats.touchdowns} />
                                <StatRow label="First Downs" value={seasonStats.first_downs} />
                                <StatRow label="Avg Off Diff" value={seasonStats.average_offensive_diff ?? seasonStats.averageOffensiveDiff} decimals={1} />
                                <StatRow label="3rd Down %" value={seasonStats.third_down_conversion_percentage} suffix="%" decimals={1} />
                                <StatRow label="Red Zone %" value={seasonStats.red_zone_success_percentage} suffix="%" decimals={1} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', boxShadow: theme.shadows[1] }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem', color: theme.palette.error.main }}>Defense</Typography>
                                <StatRow label="Opp Total Yards" value={seasonStats.opponent_total_yards} />
                                <StatRow label="Opp Pass Yards" value={seasonStats.opponent_pass_yards} />
                                <StatRow label="Opp Rush Yards" value={seasonStats.opponent_rush_yards} />
                                <StatRow label="Opp Touchdowns" value={seasonStats.opponent_touchdowns} />
                                <StatRow label="Avg Def Diff" value={seasonStats.average_defensive_diff ?? seasonStats.averageDefensiveDiff} decimals={1} />
                                <StatRow label="Sacks Forced" value={seasonStats.sacks_forced} />
                                <StatRow label="INTs Forced" value={seasonStats.interceptions_forced} />
                                <StatRow label="Opp 3rd Down %" value={seasonStats.opponent_third_down_conversion_percentage} suffix="%" decimals={1} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', boxShadow: theme.shadows[1] }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1rem', color: theme.palette.warning.main }}>Turnovers & Special</Typography>
                                <StatRow label="Turnover Diff" value={seasonStats.turnover_differential} highlight />
                                <StatRow label="INTs Lost" value={seasonStats.interceptions_lost} />
                                <StatRow label="Fumbles Lost" value={seasonStats.fumbles_lost} />
                                <StatRow label="Pick Sixes Forced" value={seasonStats.pick_sixes_forced} />
                                <StatRow label="FG %" value={seasonStats.field_goal_percentage} suffix="%" decimals={1} />
                                <StatRow label="Longest FG" value={seasonStats.longest_field_goal} suffix=" yds" />
                                <StatRow label="Avg Punt" value={seasonStats.average_punt_length} suffix=" yds" decimals={1} />
                                <StatRow label="Largest Lead" value={seasonStats.largest_lead} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Records Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', boxShadow: theme.shadows[1] }}>
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TrendingUp sx={{ mr: 1, color: theme.palette.primary.main }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Current Season</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Overall</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.currentRecord}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Conference</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.currentConferenceRecord}</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', boxShadow: theme.shadows[1] }}>
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <EmojiEvents sx={{ mr: 1, color: theme.palette.secondary.main }} />
                                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>All-Time Records</Typography>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Overall</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.overallRecord}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary">Conference</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.overallConferenceRecord}</Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Championships */}
            <Box sx={{ mb: 4, p: { xs: 2, md: 3 }, backgroundColor: 'background.paper', borderRadius: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: theme.shadows[1] }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontSize: '1.1rem' }}>Championships & Playoffs</Typography>
                <Grid container spacing={2}>
                    {[
                        { label: 'National Championships', value: team.national_championship_wins || 0, color: theme.palette.primary.main },
                        { label: 'Conference Championships', value: team.conference_championship_wins || 0, color: theme.palette.secondary.main },
                        { label: 'Playoff Wins', value: team.playoff_wins || 0, color: theme.palette.warning.main },
                        { label: 'Bowl Wins', value: team.bowl_wins || 0, color: theme.palette.info.main },
                    ].map((item) => (
                        <Grid item xs={6} sm={3} key={item.label}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: item.color, fontSize: { xs: '1.5rem', md: '2rem' } }}>{item.value}</Typography>
                                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Playbooks */}
            <PlaybooksSection team={team} />
        </PageLayout>
    );
};

const StatRow = ({ label, value, suffix = '', decimals = 0, highlight = false }) => {
    if (value === null || value === undefined) return null;
    const displayValue = decimals > 0 ? Number(value).toFixed(decimals) : value;
    return (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{label}</Typography>
            <Typography variant="body2" sx={{
                fontWeight: 600, fontSize: '0.8rem',
                color: highlight ? (value > 0 ? 'success.main' : value < 0 ? 'error.main' : 'text.primary') : 'text.primary'
            }}>
                {highlight && value > 0 ? '+' : ''}{displayValue}{suffix}
            </Typography>
        </Box>
    );
};

export default TeamDetails;
