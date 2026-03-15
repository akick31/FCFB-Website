import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Grid,
    Typography,
    Avatar,
    Chip,
    Paper,
    Divider,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    useTheme,
} from '@mui/material';
import {
    SportsFootball,
    Person,
    EmojiEvents,
    TrendingUp,
    MilitaryTech,
    Timer,
    Warning,
    SwapHoriz,
    School,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { getAllUsers } from '../../api/userApi';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';
import { getAllTeams } from '../../api/teamApi';
import { getFilteredSeasonStats } from '../../api/seasonStatsApi';
import { formatOffensivePlaybook, formatDefensivePlaybook, formatPosition } from '../../utils/formatText';
import { formatResponseTime } from '../../utils/timeUtils';

// ── Stat row helper (same as TeamDetails) ─────────────────────
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

const UserDetails = () => {
    const { coachName } = useParams();
    const theme = useTheme();
    const navigate = useNavigate();
    const decodedName = decodeURIComponent(coachName || '');

    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [teams, setTeams] = useState([]);
    const [seasonStats, setSeasonStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = `FCFB | ${decodedName || 'User Details'}`;
    }, [decodedName]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [allUsers, allTransactions, allTeams] = await Promise.all([
                    getAllUsers(),
                    getEntireCoachTransactionLog(),
                    getAllTeams(),
                ]);

                // Find user by coach_name or username
                const foundUser = allUsers.find(u =>
                    u.coach_name === decodedName || u.username === decodedName
                );
                setUser(foundUser || null);

                // Filter transactions for this coach
                const coachTransactions = allTransactions.filter(t =>
                    t.coach_name === decodedName || t.coach === decodedName
                );
                // Sort by date descending (most recent first)
                coachTransactions.sort((a, b) => {
                    const dateA = a.date || a.created_at || '';
                    const dateB = b.date || b.created_at || '';
                    return dateB.localeCompare(dateA);
                });
                setTransactions(coachTransactions);
                setTeams(allTeams);

                // Fetch season stats for current team (all-time)
                if (foundUser?.team) {
                    setStatsLoading(true);
                    try {
                        const statsResponse = await getFilteredSeasonStats(foundUser.team, null, null, null, 0, 1).catch(() => null);
                        if (statsResponse?.content?.length > 0) {
                            setSeasonStats(statsResponse.content[0]);
                        }
                    } catch {
                        // silently fail
                    } finally {
                        setStatsLoading(false);
                    }
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            } finally {
                setLoading(false);
            }
        };
        if (decodedName) fetchData();
    }, [decodedName]);

    const teamMap = useMemo(() => {
        const map = {};
        teams.forEach(t => { map[t.name] = t; });
        return map;
    }, [teams]);

    // Compute team history from transactions (group into stints)
    const teamHistory = useMemo(() => {
        if (!transactions.length) return [];

        // Track stints: each hire starts a stint, each fire/resignation ends it
        const stints = [];
        const openStints = {}; // key: team name

        // Sort chronologically for processing
        const sorted = [...transactions].sort((a, b) => {
            const dateA = a.date || a.created_at || '';
            const dateB = b.date || b.created_at || '';
            return dateA.localeCompare(dateB);
        });

        sorted.forEach(tx => {
            const team = tx.team || tx.team_name;
            const type = (tx.transaction_type || tx.type || '').toUpperCase();
            const position = tx.position || 'HEAD_COACH';
            const date = tx.date || tx.created_at || '';

            if (type.includes('HIRE') || type.includes('ASSIGN')) {
                openStints[team] = { team, position, startDate: date, startType: type };
            } else if (type.includes('FIRE') || type.includes('RESIGN') || type.includes('RELEASE')) {
                if (openStints[team]) {
                    stints.push({
                        ...openStints[team],
                        endDate: date,
                        endType: type,
                    });
                    delete openStints[team];
                } else {
                    stints.push({ team, position, startDate: '', endDate: date, endType: type, startType: '' });
                }
            }
        });

        // Close any open stints (currently active)
        Object.values(openStints).forEach(stint => {
            stints.push({ ...stint, endDate: null, endType: null });
        });

        // Sort by start date descending
        stints.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));
        return stints;
    }, [transactions]);

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

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Present';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <PageLayout title="User Details">
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={48} />
                </Box>
            </PageLayout>
        );
    }

    if (!user) {
        return (
            <PageLayout title="User Not Found">
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h5" sx={{ color: 'text.secondary' }}>
                        No user found with the name "{decodedName}"
                    </Typography>
                </Box>
            </PageLayout>
        );
    }

    const currentTeamData = teamMap[user.team];

    return (
        <PageLayout
            title={user.coach_name || user.username}
            subtitle="Coach Profile"
        >
            {/* ═══ HEADER CARD ═══ */}
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                {/* Color banner */}
                <Box sx={{
                    height: 8,
                    background: currentTeamData?.primary_color
                        ? `linear-gradient(90deg, ${currentTeamData.primary_color}, ${currentTeamData.secondary_color || currentTeamData.primary_color})`
                        : theme.palette.primary.main,
                }} />

                <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: { md: 'center' } }}>
                    {/* Logo / Avatar */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {currentTeamData?.logo ? (
                            <Box
                                component="img"
                                src={currentTeamData.logo}
                                alt={user.team}
                                sx={{ width: 72, height: 72, objectFit: 'contain', cursor: 'pointer' }}
                                onClick={() => currentTeamData?.id && navigate(`/team-details/${currentTeamData.id}`)}
                            />
                        ) : (
                            <Avatar sx={{
                                width: 72, height: 72,
                                background: theme.palette.primary.main,
                                fontSize: '1.8rem', fontWeight: 700,
                            }}>
                                {(user.coach_name || user.username || 'U').charAt(0).toUpperCase()}
                            </Avatar>
                        )}

                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                {user.coach_name || user.username}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.25 }}>
                                @{user.username}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Chips */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: { md: 'auto' } }}>
                        <Chip icon={<Person sx={{ fontSize: 16 }} />} label={formatPosition(user.position)} size="small" />
                        {user.team && (
                            <Chip
                                icon={currentTeamData?.logo ? (
                                    <Avatar src={currentTeamData.logo} sx={{ width: 18, height: 18 }} />
                                ) : <School sx={{ fontSize: 16 }} />}
                                label={user.team}
                                size="small"
                                onClick={() => currentTeamData?.id && navigate(`/team-details/${currentTeamData.id}`)}
                                sx={{ cursor: currentTeamData?.id ? 'pointer' : 'default' }}
                            />
                        )}
                        {!user.team && (
                            <Chip label="Free Agent" size="small" color="warning" variant="outlined" />
                        )}
                        <Chip
                            icon={<TrendingUp sx={{ fontSize: 16 }} />}
                            label={`${winPercentage}% Win Rate`}
                            size="small"
                            color="success"
                            variant="outlined"
                        />
                        {user.discord_tag && (
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
                        <StatBox label="Avg Response" value={user.average_response_time ? formatResponseTime(user.average_response_time) : 'N/A'} icon={<Timer />} color="info" />
                        <StatBox label="DOG Count" value={user.delay_of_game_instances || 0} icon={<Warning />} color="warning" />
                    </Box>

                    {/* Records Card */}
                    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                        <Box sx={{ px: 2.5, py: 1.5, backgroundColor: theme.palette.primary.main + '08' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                Coaching Records
                            </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ px: 1.5, py: 0.5 }}>
                            <RecordRow label="Overall" wins={user.wins} losses={user.losses} icon={<EmojiEvents />} />
                            <Divider />
                            <RecordRow label="Bowl Games" wins={user.bowl_wins} losses={user.bowl_losses} icon={<MilitaryTech />} />
                            <Divider />
                            <RecordRow label="Playoffs" wins={user.playoff_wins} losses={user.playoff_losses} icon={<SportsFootball />} />
                            <Divider />
                            <RecordRow label="Conference Championships" wins={user.conference_championship_wins} losses={user.conference_championship_losses} icon={<EmojiEvents />} />
                            <Divider />
                            <RecordRow label="National Championships" wins={user.national_championship_wins} losses={user.national_championship_losses} icon={<MilitaryTech />} />
                        </Box>
                    </Paper>

                    {/* Season Stats Cards (current team, all-time) */}
                    {user.team && (
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                                    Team Stats
                                </Typography>
                                {currentTeamData?.logo && (
                                    <Avatar src={currentTeamData.logo} sx={{ width: 22, height: 22 }} />
                                )}
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {user.team} — All-Time
                                </Typography>
                            </Box>
                            {statsLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                    <CircularProgress size={28} />
                                </Box>
                            ) : seasonStats ? (
                                <Grid container spacing={2}>
                                    {/* Offense */}
                                    <Grid item xs={12} md={4}>
                                        <Card sx={{ height: '100%', boxShadow: theme.shadows[1] }}>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem', color: theme.palette.primary.main }}>
                                                    Offense
                                                </Typography>
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
                                    {/* Defense */}
                                    <Grid item xs={12} md={4}>
                                        <Card sx={{ height: '100%', boxShadow: theme.shadows[1] }}>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem', color: theme.palette.error.main }}>
                                                    Defense
                                                </Typography>
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
                                    {/* Turnovers & Special */}
                                    <Grid item xs={12} md={4}>
                                        <Card sx={{ height: '100%', boxShadow: theme.shadows[1] }}>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.95rem', color: theme.palette.warning.main }}>
                                                    Turnovers & Special
                                                </Typography>
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
                                <Box sx={{ p: 3, textAlign: 'center', backgroundColor: theme.palette.grey[50], borderRadius: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        No season stats available for {user.team}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Team History Card */}
                    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                        <Box sx={{ px: 2.5, py: 1.5, backgroundColor: theme.palette.primary.main + '08' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                Team History
                            </Typography>
                        </Box>
                        <Divider />
                        {teamHistory.length > 0 ? (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>From</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>To</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {teamHistory.map((stint, idx) => {
                                            const td = teamMap[stint.team];
                                            const isActive = !stint.endDate;
                                            return (
                                                <TableRow
                                                    key={idx}
                                                    hover
                                                    sx={{
                                                        cursor: td?.id ? 'pointer' : 'default',
                                                        backgroundColor: isActive ? theme.palette.success.main + '08' : 'inherit',
                                                    }}
                                                    onClick={() => td?.id && navigate(`/team-details/${td.id}`)}
                                                >
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {td?.logo && (
                                                                <Avatar src={td.logo} sx={{ width: 24, height: 24 }} />
                                                            )}
                                                            <Typography variant="body2" sx={{ fontWeight: isActive ? 700 : 400 }}>
                                                                {stint.team}
                                                            </Typography>
                                                            {isActive && (
                                                                <Chip label="Current" size="small" color="success" sx={{ height: 18, fontSize: '0.6rem' }} />
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {formatPosition(stint.position)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {formatDate(stint.startDate)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: isActive ? 600 : 400, color: isActive ? 'success.main' : 'text.primary' }}>
                                                            {isActive ? 'Present' : formatDate(stint.endDate)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    No team history found
                                </Typography>
                            </Box>
                        )}
                    </Paper>

                    {/* Full Transaction Log */}
                    {transactions.length > 0 && (
                        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Box sx={{ px: 2.5, py: 1.5, backgroundColor: theme.palette.primary.main + '08' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    Transaction Log
                                </Typography>
                            </Box>
                            <Divider />
                            <TableContainer sx={{ maxHeight: 300 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transactions.map((tx, idx) => {
                                            const team = tx.team || tx.team_name;
                                            const td = teamMap[team];
                                            const type = tx.transaction_type || tx.type || '';
                                            const isHire = type.toUpperCase().includes('HIRE') || type.toUpperCase().includes('ASSIGN');
                                            return (
                                                <TableRow key={idx} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                                            {formatDate(tx.date || tx.created_at)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                            {td?.logo && (
                                                                <Avatar src={td.logo} sx={{ width: 20, height: 20 }} />
                                                            )}
                                                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                                                {team}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            icon={<SwapHoriz sx={{ fontSize: 14 }} />}
                                                            label={type.replace(/_/g, ' ')}
                                                            size="small"
                                                            color={isHire ? 'success' : 'error'}
                                                            variant="outlined"
                                                            sx={{ height: 22, fontSize: '0.65rem' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                                            {formatPosition(tx.position)}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                </Grid>

                {/* ═══ RIGHT: Sidebar info ═══ */}
                <Grid item xs={12} lg={4}>
                    {/* Playbooks */}
                    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden', mb: 3, position: 'sticky', top: 80 }}>
                        <Box sx={{ px: 2.5, py: 1.5, backgroundColor: theme.palette.primary.main + '08' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                Coaching Strategy
                            </Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ p: 2.5 }}>
                            <Box sx={{ mb: 2.5 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                    Offensive Playbook
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {formatOffensivePlaybook(user.offensive_playbook) || 'Not Set'}
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 2.5 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                    Defensive Playbook
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {formatDefensivePlaybook(user.defensive_playbook) || 'Not Set'}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ mb: 2.5 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                    Average Response Time
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {user.average_response_time ? formatResponseTime(user.average_response_time) : 'N/A'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                    Delay of Game Instances
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {user.delay_of_game_instances || 0}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </PageLayout>
    );
};

export default UserDetails;
