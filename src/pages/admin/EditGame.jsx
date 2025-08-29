import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    TextField, 
    Grid, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    Switch,
    FormControlLabel,
    IconButton
} from '@mui/material';
import { 
    Save, 
    Refresh, 
    Undo, 
    BarChart,
    ArrowBack
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminNavigationItems } from '../../config/adminNavigation';
import { getGameById, updateGame, restartGame } from '../../api/gameApi';
import { getAllPlaysByGameId, rollbackPlay } from '../../api/playApi';
import { generateGameStats } from '../../api/gameStatsApi';
import StyledTable from '../../components/ui/StyledTable';
import { 
    TV_CHANNELS, 
    TEAM_SIDES, 
    COIN_TOSS_CHOICES, 
    GAME_WARNINGS, 
    PLAY_TYPES, 
    GAME_STATUSES, 
    GAME_TYPES, 
    GAME_MODES,
    GAME_STATUS_DESCRIPTIONS,
    GAME_TYPE_DESCRIPTIONS,
    GAME_MODE_DESCRIPTIONS
} from '../../constants/gameEnums';
import { OFFENSIVE_PLAYBOOKS, DEFENSIVE_PLAYBOOKS } from '../../constants/teamEnums';

const EditGame = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [plays, setPlays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [playsLoading, setPlaysLoading] = useState(true);

    const navigationItems = adminNavigationItems;

    useEffect(() => {
        if (gameId) {
            fetchGame();
            fetchPlays();
        }
    }, [gameId]);

    const fetchGame = async () => {
        try {
            const gameData = await getGameById(gameId);
            setGame(gameData);
        } catch (error) {
            console.error('Failed to fetch game:', error);
            setError('Failed to load game data');
        } finally {
            setLoading(false);
        }
    };

    const fetchPlays = async () => {
        try {
            const playsData = await getAllPlaysByGameId(gameId);
            setPlays(playsData || []);
        } catch (error) {
            console.error('Failed to fetch plays:', error);
            setError('Failed to load plays data');
        } finally {
            setPlaysLoading(false);
        }
    };

    const handleNavigationChange = (item) => {
        navigate(item.path);
    };

    const handleInputChange = (field, value) => {
        setGame(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleBooleanChange = (field, value) => {
        setGame(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await updateGame(gameId, game);
            setSuccess('Game updated successfully!');
        } catch (error) {
            setError(`Failed to update game: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleRestartGame = async () => {
        if (!window.confirm('Are you sure you want to restart this game? This action cannot be undone.')) {
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await restartGame(gameId);
            setSuccess('Game restarted successfully!');
            fetchGame(); // Refresh game data
        } catch (error) {
            setError(`Failed to restart game: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleRollbackPlay = async () => {
        if (!window.confirm('Are you sure you want to rollback the last play? This action cannot be undone.')) {
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await rollbackPlay(gameId);
            setSuccess('Play rolled back successfully!');
            fetchGame(); // Refresh game data
            fetchPlays(); // Refresh plays
        } catch (error) {
            setError(`Failed to rollback play: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerateStats = async () => {
        if (!window.confirm('Are you sure you want to regenerate stats for this game?')) {
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await generateGameStats(gameId);
            setSuccess('Stats regenerated successfully!');
        } catch (error) {
            setError(`Failed to regenerate stats: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleGoBack = () => {
        navigate('/admin/game-management');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!game) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Game not found</Alert>
            </Box>
        );
    }

    const playColumns = [
        { id: 'play_number', label: 'Play #', width: 60 },
        { id: 'home_score', label: 'Home Score', width: 80 },
        { id: 'away_score', label: 'Away Score', width: 80 },
        { id: 'quarter', label: 'Quarter', width: 70 },
        { id: 'clock', label: 'Clock', width: 80 },
        { id: 'ball_location', label: 'Ball Location', width: 120 },
        { id: 'possession', label: 'Possession', width: 100 },
        { id: 'down', label: 'Down', width: 60 },
        { id: 'yards_to_go', label: 'Yards to Go', width: 100 },
        { id: 'defensive_number', label: 'Defensive #', width: 100 },
        { id: 'offensive_number', label: 'Offensive #', width: 100 },
        { id: 'difference', label: 'Difference', width: 100 },
        { id: 'defensive_submitter', label: 'Defensive Submitter', width: 140 },
        { id: 'offensive_submitter', label: 'Offensive Submitter', width: 140 },
        { id: 'play_call', label: 'Play Call', width: 120 },
        { id: 'result', label: 'Result', width: 120 },
        { id: 'actual_result', label: 'Actual Result', width: 120 },
        { id: 'yards', label: 'Yards', width: 80 },
        { id: 'play_time', label: 'Play Time', width: 100 },
        { id: 'runoff_time', label: 'Runoff Time', width: 100 },
        { id: 'win_probability', label: 'Win Probability', width: 120 },
        { id: 'win_probability_added', label: 'Win Prob Added', width: 120 },
        { id: 'offensive_response_speed', label: 'Off Response Speed', width: 140 },
        { id: 'defensive_response_speed', label: 'Def Response Speed', width: 140 }
    ];

    const playData = plays.map((play, index) => ({
        ...play,
        play_number: play.play_number || index + 1,
        home_score: play.home_score || 0,
        away_score: play.away_score || 0,
        quarter: play.quarter || 1,
        clock: play.clock || '00:00',
        ball_location: play.ball_location || 'N/A',
        possession: play.possession || 'N/A',
        down: play.down || 'N/A',
        yards_to_go: play.yards_to_go || 'N/A',
        defensive_number: play.defensive_number || 'N/A',
        offensive_number: play.offensive_number || 'N/A',
        difference: play.difference || 'N/A',
        defensive_submitter: play.defensive_submitter || 'N/A',
        offensive_submitter: play.offensive_submitter || 'N/A',
        play_call: play.play_call || 'N/A',
        result: play.result || 'N/A',
        actual_result: play.actual_result || 'N/A',
        yards: play.yards || 'N/A',
        play_time: play.play_time || 'N/A',
        runoff_time: play.runoff_time || 'N/A',
        win_probability: play.win_probability || 'N/A',
        win_probability_added: play.win_probability_added || 'N/A',
        offensive_response_speed: play.offensive_response_speed || 'N/A',
        defensive_response_speed: play.defensive_response_speed || 'N/A'
    }));

    return (
        <DashboardLayout
            title="Edit Game"
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
            hideHeader={true}
            textColor="primary.main"
        >
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={handleGoBack} sx={{ mr: 2 }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Edit Game: {game.awayTeam || game.away_team} @ {game.homeTeam || game.home_team}
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                {/* Action Buttons */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        // disabled={saving}
                        disabled={true}
                        startIcon={<Save />}
                    >
                        {saving ? <CircularProgress size={20} /> : 'Save Changes'}
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleRestartGame}
                        disabled={saving}
                        startIcon={<Refresh />}
                        color="warning"
                    >
                        Restart Game
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleRollbackPlay}
                        disabled={saving}
                        startIcon={<Undo />}
                        color="secondary"
                    >
                        Rollback Play
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleRegenerateStats}
                        disabled={saving}
                        startIcon={<BarChart />}
                        color="info"
                    >
                        Regenerate Stats
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {/* Basic Game Info */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                                    Basic Game Info
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Season"
                                            type="number"
                                            value={game.season || ''}
                                            onChange={(e) => handleInputChange('season', parseInt(e.target.value) || null)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Week"
                                            type="number"
                                            value={game.week || ''}
                                            onChange={(e) => handleInputChange('week', parseInt(e.target.value) || null)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Game Type</InputLabel>
                                            <Select
                                                value={game.gameType || game.game_type || ''}
                                                onChange={(e) => handleInputChange('gameType', e.target.value)}
                                            >
                                                {GAME_TYPES.map(type => (
                                                    <MenuItem key={type} value={type}>
                                                        {GAME_TYPE_DESCRIPTIONS[type]}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Game Status</InputLabel>
                                            <Select
                                                value={game.gameStatus || game.game_status || ''}
                                                onChange={(e) => handleInputChange('gameStatus', e.target.value)}
                                            >
                                                {GAME_STATUSES.map(status => (
                                                    <MenuItem key={status} value={status}>
                                                        {GAME_STATUS_DESCRIPTIONS[status]}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Game Mode</InputLabel>
                                            <Select
                                                value={game.gameMode || game.game_mode || ''}
                                                onChange={(e) => handleInputChange('gameMode', e.target.value)}
                                            >
                                                {GAME_MODES.map(mode => (
                                                    <MenuItem key={mode} value={mode}>
                                                        {GAME_MODE_DESCRIPTIONS[mode]}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>TV Channel</InputLabel>
                                            <Select
                                                value={game.tvChannel || game.tv_channel || ''}
                                                onChange={(e) => handleInputChange('tvChannel', e.target.value)}
                                            >
                                                <MenuItem value="">None</MenuItem>
                                                {TV_CHANNELS.map(channel => (
                                                    <MenuItem key={channel} value={channel}>
                                                        {channel}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Team Playbooks */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                                    Team Playbooks
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Home Offensive Playbook</InputLabel>
                                            <Select
                                                value={game.homeOffensivePlaybook || game.home_offensive_playbook || ''}
                                                onChange={(e) => handleInputChange('homeOffensivePlaybook', e.target.value)}
                                            >
                                                {OFFENSIVE_PLAYBOOKS.map(playbook => (
                                                    <MenuItem key={playbook} value={playbook}>
                                                        {playbook.replace(/_/g, ' ')}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Away Offensive Playbook</InputLabel>
                                            <Select
                                                value={game.awayOffensivePlaybook || game.away_offensive_playbook || ''}
                                                onChange={(e) => handleInputChange('awayOffensivePlaybook', e.target.value)}
                                            >
                                                {OFFENSIVE_PLAYBOOKS.map(playbook => (
                                                    <MenuItem key={playbook} value={playbook}>
                                                        {playbook.replace(/_/g, ' ')}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Home Defensive Playbook</InputLabel>
                                            <Select
                                                value={game.homeDefensivePlaybook || game.home_defensive_playbook || ''}
                                                onChange={(e) => handleInputChange('homeDefensivePlaybook', e.target.value)}
                                            >
                                                {DEFENSIVE_PLAYBOOKS.map(playbook => (
                                                    <MenuItem key={playbook} value={playbook}>
                                                        {playbook.replace(/_/g, ' ')}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Away Defensive Playbook</InputLabel>
                                            <Select
                                                value={game.awayDefensivePlaybook || game.away_defensive_playbook || ''}
                                                onChange={(e) => handleInputChange('awayDefensivePlaybook', e.target.value)}
                                            >
                                                {DEFENSIVE_PLAYBOOKS.map(playbook => (
                                                    <MenuItem key={playbook} value={playbook}>
                                                        {playbook.replace(/_/g, ' ')}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Scores and Game State */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                                    Scores and Game State
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Home Score"
                                            type="number"
                                            value={game.homeScore || game.home_score || 0}
                                            onChange={(e) => handleInputChange('homeScore', parseInt(e.target.value) || 0)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Away Score"
                                            type="number"
                                            value={game.awayScore || game.away_score || 0}
                                            onChange={(e) => handleInputChange('awayScore', parseInt(e.target.value) || 0)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Quarter"
                                            type="number"
                                            value={game.quarter || 1}
                                            onChange={(e) => handleInputChange('quarter', parseInt(e.target.value) || 1)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Clock"
                                            value={game.clock || game.game_clock || '00:00'}
                                            onChange={(e) => handleInputChange('clock', e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Ball Location"
                                            type="number"
                                            value={game.ballLocation || game.ball_location || 0}
                                            onChange={(e) => handleInputChange('ballLocation', parseInt(e.target.value) || 0)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Down"
                                            type="number"
                                            value={game.down || 1}
                                            onChange={(e) => handleInputChange('down', parseInt(e.target.value) || 1)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Yards to Go"
                                            type="number"
                                            value={game.yardsToGo || game.yards_to_go || 10}
                                            onChange={(e) => handleInputChange('yardsToGo', parseInt(e.target.value) || 10)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Possession</InputLabel>
                                            <Select
                                                value={game.possession || ''}
                                                onChange={(e) => handleInputChange('possession', e.target.value)}
                                            >
                                                {TEAM_SIDES.map(side => (
                                                    <MenuItem key={side} value={side}>
                                                        {side === 'HOME' ? 'Home' : 'Away'}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Team Records and Rankings */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                                    Team Records and Rankings
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Home Team Rank"
                                            type="number"
                                            value={game.homeTeamRank || game.home_team_rank || ''}
                                            onChange={(e) => handleInputChange('homeTeamRank', parseInt(e.target.value) || null)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Away Team Rank"
                                            type="number"
                                            value={game.awayTeamRank || game.away_team_rank || ''}
                                            onChange={(e) => handleInputChange('awayTeamRank', parseInt(e.target.value) || null)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Home Wins"
                                            type="number"
                                            value={game.homeWins || game.home_wins || ''}
                                            onChange={(e) => handleInputChange('homeWins', parseInt(e.target.value) || null)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Home Losses"
                                            type="number"
                                            value={game.homeLosses || game.home_losses || ''}
                                            onChange={(e) => handleInputChange('homeLosses', parseInt(e.target.value) || null)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Away Wins"
                                            type="number"
                                            value={game.awayWins || game.away_wins || ''}
                                            onChange={(e) => handleInputChange('awayWins', parseInt(e.target.value) || null)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Away Losses"
                                            type="number"
                                            value={game.awayLosses || game.away_losses || ''}
                                            onChange={(e) => handleInputChange('awayLosses', parseInt(e.target.value) || null)}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Game Flow */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                                    Game Flow
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Waiting On</InputLabel>
                                            <Select
                                                value={game.waitingOn || game.waiting_on || ''}
                                                onChange={(e) => handleInputChange('waitingOn', e.target.value)}
                                            >
                                                {TEAM_SIDES.map(side => (
                                                    <MenuItem key={side} value={side}>
                                                        {side === 'HOME' ? 'Home' : 'Away'}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Home Timeouts"
                                            type="number"
                                            value={game.homeTimeouts || game.home_timeouts || 3}
                                            onChange={(e) => handleInputChange('homeTimeouts', parseInt(e.target.value) || 3)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Away Timeouts"
                                            type="number"
                                            value={game.awayTimeouts || game.away_timeouts || 3}
                                            onChange={(e) => handleInputChange('awayTimeouts', parseInt(e.target.value) || 3)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Coin Toss Winner</InputLabel>
                                            <Select
                                                value={game.coinTossWinner || game.coin_toss_winner || ''}
                                                onChange={(e) => handleInputChange('coinTossWinner', e.target.value)}
                                            >
                                                <MenuItem value="">None</MenuItem>
                                                {TEAM_SIDES.map(side => (
                                                    <MenuItem key={side} value={side}>
                                                        {side === 'HOME' ? 'Home' : 'Away'}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Coin Toss Choice</InputLabel>
                                            <Select
                                                value={game.coinTossChoice || game.coin_toss_choice || ''}
                                                onChange={(e) => handleInputChange('coinTossChoice', e.target.value)}
                                            >
                                                <MenuItem value="">None</MenuItem>
                                                {COIN_TOSS_CHOICES.map(choice => (
                                                    <MenuItem key={choice} value={choice}>
                                                        {choice === 'RECEIVE' ? 'Receive' : 'Defer'}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Game Timer"
                                            value={game.gameTimer || game.game_timer || ''}
                                            onChange={(e) => handleInputChange('gameTimer', e.target.value)}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Game Settings and Alerts */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                                    Game Settings and Alerts
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Game Warning</InputLabel>
                                            <Select
                                                value={game.gameWarning || game.game_warning || ''}
                                                onChange={(e) => handleInputChange('gameWarning', e.target.value)}
                                            >
                                                {GAME_WARNINGS.map(warning => (
                                                    <MenuItem key={warning} value={warning}>
                                                        {warning.replace(/_/g, ' ')}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Current Play Type</InputLabel>
                                            <Select
                                                value={game.currentPlayType || game.current_play_type || ''}
                                                onChange={(e) => handleInputChange('currentPlayType', e.target.value)}
                                            >
                                                <MenuItem value="">None</MenuItem>
                                                {PLAY_TYPES.map(type => (
                                                    <MenuItem key={type} value={type}>
                                                        {type}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Current Play ID"
                                            type="number"
                                            value={game.currentPlayId || game.current_play_id || ''}
                                            onChange={(e) => handleInputChange('currentPlayId', parseInt(e.target.value) || null)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: 'primary.main' }}>Overtime Half</InputLabel>
                                            <Select
                                                value={game.overtimeHalf || game.overtime_half || 0}
                                                onChange={(e) => handleInputChange('overtimeHalf', e.target.value)}
                                                sx={{
                                                    color: 'primary.main',
                                                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }}
                                            >
                                                <MenuItem value={0}>Bottom</MenuItem>
                                                <MenuItem value={1}>Top</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={game.clockStopped || game.clock_stopped || false}
                                                    onChange={(e) => handleBooleanChange('clockStopped', e.target.checked)}
                                                />
                                            }
                                            label="Clock Stopped"
                                            sx={{ color: 'primary.main' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={game.closeGame || game.close_game || false}
                                                    onChange={(e) => handleBooleanChange('closeGame', e.target.checked)}
                                                />
                                            }
                                            label="Close Game"
                                            sx={{ color: 'primary.main' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={game.closeGamePinged || game.close_game_pinged || false}
                                                    onChange={(e) => handleBooleanChange('closeGamePinged', e.target.checked)}
                                                />
                                            }
                                            label="Close Game Pinged"
                                            sx={{ color: 'primary.main' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={game.upsetAlert || game.upset_alert || false}
                                                    onChange={(e) => handleBooleanChange('upsetAlert', e.target.checked)}
                                                />
                                            }
                                            label="Upset Alert"
                                            sx={{ color: 'primary.main' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={game.upsetAlertPinged || game.upset_alert_pinged || false}
                                                    onChange={(e) => handleBooleanChange('upsetAlertPinged', e.target.checked)}
                                                />
                                            }
                                            label="Upset Alert Pinged"
                                            sx={{ color: 'primary.main' }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Plays Table */}
                <Card sx={{ mt: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                            Game Plays ({plays.length})
                        </Typography>
                        
                        {playsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : plays.length === 0 ? (
                            <Box sx={{ textAlign: 'center', p: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                    No plays found for this game
                                </Typography>
                            </Box>
                        ) : (
                            <StyledTable
                                columns={playColumns}
                                data={playData}
                                headerBackground="primary.main"
                                headerTextColor="white"
                            />
                        )}
                    </CardContent>
                </Card>
            </Box>
        </DashboardLayout>
    );
};

export default EditGame;
