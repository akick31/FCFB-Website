import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    Avatar,
    Chip,
    Divider,
    TextField,
    Button,
    Paper,
    Card,
    CardContent,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useTheme,
} from '@mui/material';
import {
    SportsFootball,
    Person,
    School,
    EmojiEvents,
    TrendingUp,
    MilitaryTech,
    Timer,
    Warning,
    Edit,
    Save,
    Cancel
} from '@mui/icons-material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import PageLayout from '../../components/layout/PageLayout';
import { formatOffensivePlaybook, formatDefensivePlaybook, formatPosition } from '../../utils/formatText';
import { formatResponseTime } from '../../utils/timeUtils';
import { getTeamByName } from '../../api/teamApi';
import { getFilteredSeasonStats } from '../../api/seasonStatsApi';
import { getEloHistory } from '../../api/eloHistoryApi';
import { getCurrentSeason, getAllSeasons } from '../../api/seasonApi';
import { useNavigate } from 'react-router-dom';

// ── Stat row helper ────────────────────────────────────────────
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

// ── Aggregate multiple season stat rows into one ───────────────
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
    sumKeys.forEach(key => { result[key] = statsList.reduce((s, x) => s + (Number(x[key]) || 0), 0); });
    avgKeys.forEach(key => {
        const valid = statsList.filter(x => x[key] != null);
        result[key] = valid.length > 0 ? valid.reduce((s, x) => s + (Number(x[key]) || 0), 0) / valid.length : null;
    });
    maxKeys.forEach(key => { result[key] = Math.max(...statsList.map(x => Number(x[key]) || 0)); });
    return result;
};

const Profile = ({ user }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => { document.title = 'FCFB | Profile'; }, []);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [teamData, setTeamData] = useState(null);

    // Season / stats / elo state
    const [seasons, setSeasons] = useState([]);
    const [currentSeason, setCurrentSeason] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState('current');
    const [seasonStats, setSeasonStats] = useState(null);
    const [eloData, setEloData] = useState([]);
    const [statsLoading, setStatsLoading] = useState(false);

    // Fetch team data once
    useEffect(() => {
        const fetchTeamData = async () => {
            if (user?.team) {
                try {
                    const team = await getTeamByName(user.team);
                    setTeamData(team);
                } catch (error) {
                    console.error('Error fetching team data:', error);
                }
            }
        };
        fetchTeamData();
    }, [user?.team]);

    // Fetch available seasons once
    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const [season, allSeasonData] = await Promise.all([getCurrentSeason(), getAllSeasons()]);
                setCurrentSeason(season);
                const nums = allSeasonData
                    .map(s => s.season_number || s.seasonNumber)
                    .filter(Boolean)
                    .sort((a, b) => b - a);
                setSeasons(nums);
            } catch { /* silently fail */ }
        };
        fetchSeasons();
    }, []);

    // Fetch stats + ELO when team or season changes
    useEffect(() => {
        if (!user?.team || currentSeason === null) return;
        const fetchStats = async () => {
            setStatsLoading(true);
            try {
                const isAllTime = selectedSeason === 'all';
                const seasonParam = isAllTime ? null : (selectedSeason === 'current' ? currentSeason : selectedSeason);

                const [statsResponse, elo] = await Promise.all([
                    isAllTime
                        ? getFilteredSeasonStats(user.team, null, null, null, 0, 100).catch(() => null)
                        : getFilteredSeasonStats(user.team, null, seasonParam, null, 0, 1).catch(() => null),
                    getEloHistory(user.team, seasonParam).catch(() => []),
                ]);

                // Stats
                if (statsResponse?.content?.length > 0) {
                    setSeasonStats(
                        isAllTime && statsResponse.content.length > 1
                            ? aggregateSeasonStats(statsResponse.content)
                            : statsResponse.content[0]
                    );
                } else {
                    setSeasonStats(null);
                }

                // ELO history chart
                if (elo && elo.length > 0) {
                    setEloData(elo.map(entry => ({
                        week: isAllTime
                            ? `S${entry.season || ''}W${entry.week || entry.game_week || ''}`
                            : `W${entry.week || entry.game_week || ''}`,
                        elo: Math.round(entry.elo || entry.elo_rating || 0),
                    })));
                } else {
                    setEloData([]);
                }
            } catch { /* silently fail */ } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, [user?.team, selectedSeason, currentSeason]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleCancel = () => {
        setFormData({ username: user?.username || '', email: '', password: '', confirmPassword: '' });
        setIsEditing(false);
    };

    const winPercentage = user?.win_percentage ? (user.win_percentage * 100).toFixed(1) : '0.0';
    const totalGames = (user?.wins || 0) + (user?.losses || 0);

    // ── Stat pill helper ───────────────────────────────────────────
    const StatBox = ({ label, value, icon, color = 'primary' }) => (
        <Paper elevation={0} sx={{
            p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
            textAlign: 'center', flex: 1, minWidth: 100,
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <Box sx={{
                    width: 36, height: 36, borderRadius: '50%',
                    backgroundColor: 'white',
                    border: '1.5px solid',
                    borderColor: `${color}.main`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                    '& .MuiSvgIcon-root': { fontSize: 18, color: `${color}.main` }
                }}>
                    {icon}
                </Box>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
        </Paper>
    );

    // ── Record row helper ──────────────────────────────────────────
    const RecordRow = ({ label, wins, losses, icon }) => (
        <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            py: 1.25, px: 1,
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                    width: 28, height: 28, borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main + '15',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    '& .MuiSvgIcon-root': { fontSize: 15, color: 'primary.main' }
                }}>
                    {icon}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{label}</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                {wins || 0} - {losses || 0}
            </Typography>
        </Box>
    );

    return (
        <PageLayout
            title="My Profile"
            subtitle="View your FCFB coaching statistics and profile information"
        >
            {/* ═══ HEADER CARD ═══ */}
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                {/* Color banner */}
                <Box sx={{
                    height: 8,
                    background: teamData?.primary_color
                        ? `linear-gradient(90deg, ${teamData.primary_color}, ${teamData.secondary_color || teamData.primary_color})`
                        : theme.custom?.gradients?.primary || theme.palette.primary.main,
                }} />

                <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: { md: 'center' } }}>
                    {/* Logo / Avatar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {teamData?.logo ? (
                            <Box
                                component="a"
                                href={teamData?.id ? `/team-details/${teamData.id}` : undefined}
                                onClick={(e) => { if (teamData?.id) { if (!e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); navigate(`/team-details/${teamData.id}`); } } }}
                                sx={{ display: 'inline-block', cursor: 'pointer' }}
                            >
                                <img
                                    src={teamData.logo}
                                    alt={user?.team}
                                    style={{ width: 72, height: 72, objectFit: 'contain' }}
                                />
                            </Box>
                        ) : (
                            <Avatar sx={{
                                width: 72, height: 72,
                                background: theme.custom?.gradients?.primary || theme.palette.primary.main,
                                fontSize: '1.8rem', fontWeight: 700,
                            }}>
                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                        )}

                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {user?.coach_name || user?.username || 'Coach'}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.25 }}>
                                @{user?.username}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Chips */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: { md: 'auto' } }}>
                        <Chip icon={<Person sx={{ fontSize: 16 }} />} label={formatPosition(user?.position)} size="small" />
                        {user?.team && (
                            <Chip
                                component={teamData?.id ? 'a' : 'div'}
                                href={teamData?.id ? `/team-details/${teamData.id}` : undefined}
                                icon={teamData?.logo ? (
                                    <Avatar src={teamData.logo} sx={{ width: 18, height: 18 }} />
                                ) : <School sx={{ fontSize: 16 }} />}
                                label={user.team}
                                size="small"
                                clickable={!!teamData?.id}
                                onClick={(e) => { if (teamData?.id) { if (!e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); navigate(`/team-details/${teamData.id}`); } } }}
                                sx={{ cursor: teamData?.id ? 'pointer' : 'default' }}
                            />
                        )}
                        {user?.role && (
                            <Chip label={user.role} size="small" color="success" variant="outlined" />
                        )}
                        {user?.discord_tag && (
                            <Chip label={user.discord_tag} size="small" variant="outlined" />
                        )}
                    </Box>
                </Box>
            </Paper>

            <Grid container spacing={3}>
                {/* ═══ LEFT: Stats & Records ═══ */}
                <Grid item xs={12} lg={8}>
                    {/* Quick Stats Row */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                        <StatBox label="Total Games" value={totalGames} icon={<SportsFootball />} color="primary" />
                        <StatBox label="Win Rate" value={`${winPercentage}%`} icon={<TrendingUp />} color="success" />
                        <StatBox label="Avg Response" value={user?.average_response_time ? formatResponseTime(user.average_response_time) : 'N/A'} icon={<Timer />} color="info" />
                        <StatBox label="DOG Count" value={user?.delay_of_game_instances || 0} icon={<Warning />} color="warning" />
                    </Box>

                    {/* Records Card */}
                    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                        <Box sx={{ px: 2.5, py: 1.5, backgroundColor: theme.palette.primary.main + '08' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Coaching Records</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ px: 1.5, py: 0.5 }}>
                            <RecordRow label="Overall" wins={user?.wins} losses={user?.losses} icon={<EmojiEvents />} />
                            <Divider />
                            <RecordRow label="Bowl Games" wins={user?.bowl_wins} losses={user?.bowl_losses} icon={<MilitaryTech />} />
                            <Divider />
                            <RecordRow label="Playoffs" wins={user?.playoff_wins} losses={user?.playoff_losses} icon={<SportsFootball />} />
                            <Divider />
                            <RecordRow label="Conference Championships" wins={user?.conference_championship_wins} losses={user?.conference_championship_losses} icon={<EmojiEvents />} />
                            <Divider />
                            <RecordRow label="National Championships" wins={user?.national_championship_wins} losses={user?.national_championship_losses} icon={<MilitaryTech />} />
                        </Box>
                    </Paper>

                    {/* Season Stats + ELO (if user has a team) */}
                    {user?.team && (
                        <>
                            {/* Season selector */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Team Stats</Typography>
                                    {teamData?.logo && <Avatar src={teamData.logo} sx={{ width: 22, height: 22 }} />}
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{user.team}</Typography>
                                </Box>
                                <FormControl size="small" sx={{ minWidth: 160 }}>
                                    <InputLabel>Season</InputLabel>
                                    <Select value={selectedSeason} label="Season" onChange={e => setSelectedSeason(e.target.value)}>
                                        <MenuItem value="current">Current Season</MenuItem>
                                        <MenuItem value="all">All-Time</MenuItem>
                                        {seasons.map(s => <MenuItem key={s} value={s}>Season {s}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Box>

                            {statsLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3, mb: 3 }}>
                                    <CircularProgress size={28} />
                                </Box>
                            ) : (
                                <>
                                    {/* ELO Chart */}
                                    {eloData.length > 0 && (
                                        <Card sx={{ boxShadow: theme.shadows[1], borderRadius: 2, mb: 3 }}>
                                            <CardContent>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>ELO History</Typography>
                                                <ResponsiveContainer width="100%" height={200}>
                                                    <LineChart data={eloData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="week" fontSize={10} tick={false} axisLine={false} />
                                                        <YAxis domain={['auto', 'auto']} fontSize={11} />
                                                        <RechartsTooltip />
                                                        <Line type="monotone" dataKey="elo" name="ELO" stroke={teamData?.primary_color || theme.palette.primary.main} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Season Stats Cards */}
                                    {seasonStats ? (
                                        <Grid container spacing={2} sx={{ mb: 3 }}>
                                            <Grid item xs={12} md={4}>
                                                <Card sx={{ height: '100%', boxShadow: theme.shadows[1] }}>
                                                    <CardContent>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem', color: theme.palette.primary.main }}>Offense</Typography>
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
                                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem', color: theme.palette.error.main }}>Defense</Typography>
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
                                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem', color: theme.palette.warning.main }}>Turnovers & Special</Typography>
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
                                    ) : (
                                        <Box sx={{ p: 3, textAlign: 'center', backgroundColor: theme.palette.grey[50], borderRadius: 2, mb: 3 }}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                No season stats available for {user.team}
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* Playbooks Card */}
                    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ px: 2.5, py: 1.5, backgroundColor: theme.palette.primary.main + '08' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Coaching Strategy</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ p: 2.5 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Offensive Playbook</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {formatOffensivePlaybook(user?.offensive_playbook) || 'Not Set'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Defensive Playbook</Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {formatDefensivePlaybook(user?.defensive_playbook) || 'Not Set'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>

                {/* ═══ RIGHT: Account Details ═══ */}
                <Grid item xs={12} lg={4}>
                    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', position: 'sticky', top: 80 }}>
                        <Box sx={{
                            px: 2.5, py: 1.5,
                            backgroundColor: theme.palette.primary.main + '08',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Account Details</Typography>
                            {!isEditing ? (
                                <Button size="small" startIcon={<Edit />} onClick={() => setIsEditing(true)}>Edit</Button>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Button size="small" variant="contained" startIcon={<Save />} onClick={handleSave}>Save</Button>
                                    <Button size="small" variant="outlined" startIcon={<Cancel />} onClick={handleCancel}>Cancel</Button>
                                </Box>
                            )}
                        </Box>
                        <Divider />
                        <Box sx={{ p: 2.5 }}>
                            <Box sx={{ mb: 2.5 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Username</Typography>
                                {isEditing ? (
                                    <TextField fullWidth size="small" name="username" value={formData.username} onChange={handleChange} />
                                ) : (
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{user?.username || 'Not Set'}</Typography>
                                )}
                            </Box>
                            <Box sx={{ mb: 2.5 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Coach Name</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{user?.coach_name || 'Not Set'}</Typography>
                            </Box>
                            <Box sx={{ mb: 2.5 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Role</Typography>
                                <Chip label={user?.role || 'Member'} size="small" color="success" />
                            </Box>
                            <Box sx={{ mb: 2.5 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Discord Tag</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>{user?.discord_tag || 'Not Set'}</Typography>
                            </Box>
                            <Box sx={{ mb: isEditing ? 2.5 : 0 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>DOG Warning Opt-out</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {user?.delay_of_game_warning_opt_out ? 'Yes' : 'No'}
                                </Typography>
                            </Box>
                            {isEditing && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ mb: 2.5 }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Email</Typography>
                                        <TextField fullWidth size="small" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter new email" />
                                    </Box>
                                    <Box sx={{ mb: 2.5 }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>New Password</Typography>
                                        <TextField fullWidth size="small" name="password" type="password" value={formData.password} onChange={handleChange} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>Confirm Password</Typography>
                                        <TextField fullWidth size="small" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </PageLayout>
    );
};

export default Profile;
