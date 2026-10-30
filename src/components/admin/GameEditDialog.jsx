import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import EditDialog from '../ui/EditDialog';
import Panel from '../ui/Panel';
import Toggle from '../ui/Toggle';
import TeamMark from '../ui/TeamMark';
import GamePlaysTable from './GamePlaysTable';
import FormField from './form/FormField';
import NumberField from './form/NumberField';
import TextInputField from './form/TextInputField';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { getGameById, updateGame, restartGame } from '../../api/gameApi';
import { getAllPlaysByGameId, rollbackPlay } from '../../api/playApi';
import { generateGameStats } from '../../api/gameStatsApi.jsx';
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
    GAME_MODE_DESCRIPTIONS,
} from '../../constants/gameEnums';
import { OFFENSIVE_PLAYBOOKS, DEFENSIVE_PLAYBOOKS } from '../../constants/teamEnums';
import { formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';
import { formGridSx, primaryButtonSx, secondaryButtonSx, selectSx } from '../../styles/controls';

const ctrlWarnSx = {
    ...secondaryButtonSx,
    color: 'var(--gold)',
    '&:hover': { borderColor: 'var(--gold)', color: 'var(--text)' },
};
const ctrlLiveSx = {
    ...secondaryButtonSx,
    color: 'var(--live)',
    '&:hover': { borderColor: 'var(--live)', color: 'var(--text)' },
};
const SideField = ({ label, value, onChange, includeNone = false }) => (
    <FormField label={label}>
        <Box component="select" value={value ?? ''} onChange={(e) => onChange(e.target.value)} sx={selectSx}>
            {includeNone && <option value="">None</option>}
            {TEAM_SIDES.map((side) => (
                <option key={side} value={side}>
                    {side === 'HOME' ? 'Home' : 'Away'}
                </option>
            ))}
        </Box>
    </FormField>
);

SideField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    includeNone: PropTypes.bool,
};

const GameEditDialog = ({ gameId, onClose }) => {
    const teamsMap = useTeamsMap();
    const [game, setGame] = useState(null);
    const [plays, setPlays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [playsLoading, setPlaysLoading] = useState(true);

    const scopeRef = useRef(null);

    const fetchGame = useCallback(
        async (scope) => {
            if (!scope.active) {
                return;
            }
            const request = {};
            scope.gameRequest = request;
            try {
                const loadedGame = await getGameById(gameId);
                if (scope.active && scope.gameRequest === request) {
                    setGame(loadedGame);
                }
            } catch {
                if (scope.active && scope.gameRequest === request) {
                    console.error('Failed to fetch game');
                    setError('Failed to load game data');
                }
            } finally {
                if (scope.active && scope.gameRequest === request) {
                    setLoading(false);
                }
            }
        },
        [gameId]
    );

    const fetchPlays = useCallback(
        async (scope) => {
            if (!scope.active) {
                return;
            }
            const request = {};
            scope.playsRequest = request;
            try {
                const loadedPlays = await getAllPlaysByGameId(gameId);
                if (scope.active && scope.playsRequest === request) {
                    setPlays(loadedPlays || []);
                }
            } catch {
                if (scope.active && scope.playsRequest === request) {
                    console.error('Failed to fetch plays');
                    setError('Failed to load plays data');
                }
            } finally {
                if (scope.active && scope.playsRequest === request) {
                    setPlaysLoading(false);
                }
            }
        },
        [gameId]
    );

    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        setGame(null);
        setPlays([]);
        setLoading(true);
        setPlaysLoading(true);
        setSaving(false);
        setError(null);
        setSuccess(null);
        if (gameId) {
            fetchGame(scope);
            fetchPlays(scope);
        }
        return () => {
            scope.active = false;
        };
    }, [gameId, fetchGame, fetchPlays]);

    const handleChange = (field, value) => setGame((prev) => ({ ...prev, [field]: value }));

    const runGameAction = async (write, successMessage, failureMessage, reload) => {
        const scope = scopeRef.current;
        setSaving(true);
        setError(null);
        try {
            await write();
            if (scope.active) {
                setSuccess(successMessage);
                reload?.(scope);
            }
        } catch (err) {
            if (scope.active) {
                setError(`${failureMessage}: ${err.message}`);
            }
        } finally {
            if (scope.active) {
                setSaving(false);
            }
        }
    };

    const handleSave = () =>
        runGameAction(() => updateGame(game), 'Game updated successfully!', 'Failed to update game');

    const handleRestartGame = () => {
        if (!window.confirm('Are you sure you want to restart this game? This action cannot be undone.')) {
            return;
        }
        return runGameAction(
            () => restartGame(gameId),
            'Game restarted successfully!',
            'Failed to restart game',
            fetchGame
        );
    };

    const handleRollbackPlay = () => {
        if (!window.confirm('Are you sure you want to rollback the last play? This action cannot be undone.')) {
            return;
        }
        return runGameAction(
            () => rollbackPlay(gameId),
            'Play rolled back successfully!',
            'Failed to rollback play',
            (scope) => {
                fetchGame(scope);
                fetchPlays(scope);
            }
        );
    };

    const handleRegenerateStats = () => {
        if (!window.confirm('Are you sure you want to regenerate stats for this game?')) {
            return;
        }
        return runGameAction(
            () => generateGameStats(gameId),
            'Stats regenerated successfully!',
            'Failed to regenerate stats'
        );
    };

    const awayTeam = game && (game.awayTeam || game.away_team);
    const homeTeam = game && (game.homeTeam || game.home_team);
    const title = game ? (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {'Edit game: '}
            <TeamMark team={teamsMap[awayTeam] || { name: awayTeam }} size={22} />
            {`${awayTeam} @ `}
            <TeamMark team={teamsMap[homeTeam] || { name: homeTeam }} size={22} />
            {homeTeam}
        </Box>
    ) : (
        'Edit game'
    );

    const saveButton = game && (
        <Box component="button" type="button" onClick={handleSave} disabled={saving} sx={primaryButtonSx}>
            {saving ? 'Saving...' : 'Save changes'}
        </Box>
    );

    const tabs = game && [
        {
            value: 'game',
            label: 'Game',
            content: (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: '16px',
                        alignItems: 'start',
                    }}
                >
                    <Panel header="Basic game info">
                        <Box sx={formGridSx}>
                            <NumberField
                                label="Season"
                                value={game.season}
                                onChange={(v) => handleChange('season', v)}
                            />
                            <NumberField label="Week" value={game.week} onChange={(v) => handleChange('week', v)} />
                            <FormField label="Game type">
                                <Box
                                    component="select"
                                    value={game.gameType || game.game_type || ''}
                                    onChange={(e) => handleChange('gameType', e.target.value)}
                                    sx={selectSx}
                                >
                                    {GAME_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {GAME_TYPE_DESCRIPTIONS[type]}
                                        </option>
                                    ))}
                                </Box>
                            </FormField>
                            <FormField label="Game status">
                                <Box
                                    component="select"
                                    value={game.gameStatus || game.game_status || ''}
                                    onChange={(e) => handleChange('gameStatus', e.target.value)}
                                    sx={selectSx}
                                >
                                    {GAME_STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {GAME_STATUS_DESCRIPTIONS[status]}
                                        </option>
                                    ))}
                                </Box>
                            </FormField>
                            <FormField label="Game mode">
                                <Box
                                    component="select"
                                    value={game.gameMode || game.game_mode || ''}
                                    onChange={(e) => handleChange('gameMode', e.target.value)}
                                    sx={selectSx}
                                >
                                    {GAME_MODES.map((mode) => (
                                        <option key={mode} value={mode}>
                                            {GAME_MODE_DESCRIPTIONS[mode]}
                                        </option>
                                    ))}
                                </Box>
                            </FormField>
                            <FormField label="TV channel">
                                <Box
                                    component="select"
                                    value={game.tvChannel || game.tv_channel || ''}
                                    onChange={(e) => handleChange('tvChannel', e.target.value)}
                                    sx={selectSx}
                                >
                                    <option value="">None</option>
                                    {TV_CHANNELS.map((channel) => (
                                        <option key={channel} value={channel}>
                                            {channel}
                                        </option>
                                    ))}
                                </Box>
                            </FormField>
                        </Box>
                    </Panel>

                    <Panel header="Team playbooks">
                        <Box sx={formGridSx}>
                            <FormField label="Home offensive playbook">
                                <Box
                                    component="select"
                                    value={game.homeOffensivePlaybook || game.home_offensive_playbook || ''}
                                    onChange={(e) => handleChange('homeOffensivePlaybook', e.target.value)}
                                    sx={selectSx}
                                >
                                    {OFFENSIVE_PLAYBOOKS.map((playbook) => (
                                        <option key={playbook} value={playbook}>
                                            {formatOffensivePlaybook(playbook)}
                                        </option>
                                    ))}
                                </Box>
                            </FormField>
                            <FormField label="Away offensive playbook">
                                <Box
                                    component="select"
                                    value={game.awayOffensivePlaybook || game.away_offensive_playbook || ''}
                                    onChange={(e) => handleChange('awayOffensivePlaybook', e.target.value)}
                                    sx={selectSx}
                                >
                                    {OFFENSIVE_PLAYBOOKS.map((playbook) => (
                                        <option key={playbook} value={playbook}>
                                            {formatOffensivePlaybook(playbook)}
                                        </option>
                                    ))}
                                </Box>
                            </FormField>
                            <FormField label="Home defensive playbook">
                                <Box
                                    component="select"
                                    value={game.homeDefensivePlaybook || game.home_defensive_playbook || ''}
                                    onChange={(e) => handleChange('homeDefensivePlaybook', e.target.value)}
                                    sx={selectSx}
                                >
                                    {DEFENSIVE_PLAYBOOKS.map((playbook) => (
                                        <option key={playbook} value={playbook}>
                                            {formatDefensivePlaybook(playbook)}
                                        </option>
                                    ))}
                                </Box>
                            </FormField>
                            <FormField label="Away defensive playbook">
                                <Box
                                    component="select"
                                    value={game.awayDefensivePlaybook || game.away_defensive_playbook || ''}
                                    onChange={(e) => handleChange('awayDefensivePlaybook', e.target.value)}
                                    sx={selectSx}
                                >
                                    {DEFENSIVE_PLAYBOOKS.map((playbook) => (
                                        <option key={playbook} value={playbook}>
                                            {formatDefensivePlaybook(playbook)}
                                        </option>
                                    ))}
                                </Box>
                            </FormField>
                        </Box>
                    </Panel>
                </Box>
            ),
        },
        {
            value: 'state',
            label: 'Score & state',
            content: (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: '16px',
                        alignItems: 'start',
                    }}
                >
                    <Panel header="Scores & game state">
                        <Box sx={formGridSx}>
                            <NumberField
                                label="Home score"
                                value={game.homeScore ?? game.home_score}
                                onChange={(v) => handleChange('homeScore', v)}
                            />
                            <NumberField
                                label="Away score"
                                value={game.awayScore ?? game.away_score}
                                onChange={(v) => handleChange('awayScore', v)}
                            />
                            <NumberField
                                label="Quarter"
                                value={game.quarter}
                                onChange={(v) => handleChange('quarter', v)}
                                fallback={1}
                            />
                            <TextInputField
                                label="Clock"
                                value={game.clock || game.game_clock || '00:00'}
                                onChange={(v) => handleChange('clock', v)}
                            />
                            <NumberField
                                label="Ball location"
                                value={game.ballLocation ?? game.ball_location}
                                onChange={(v) => handleChange('ballLocation', v)}
                            />
                            <NumberField
                                label="Down"
                                value={game.down}
                                onChange={(v) => handleChange('down', v)}
                                fallback={1}
                            />
                            <NumberField
                                label="Yards to go"
                                value={game.yardsToGo ?? game.yards_to_go}
                                onChange={(v) => handleChange('yardsToGo', v)}
                                fallback={10}
                            />
                            <SideField
                                label="Possession"
                                value={game.possession}
                                onChange={(v) => handleChange('possession', v)}
                            />
                        </Box>
                    </Panel>

                    <Panel header="Team records & rankings">
                        <Box sx={formGridSx}>
                            <NumberField
                                label="Home team rank"
                                value={game.homeTeamRank ?? game.home_team_rank}
                                onChange={(v) => handleChange('homeTeamRank', v)}
                            />
                            <NumberField
                                label="Away team rank"
                                value={game.awayTeamRank ?? game.away_team_rank}
                                onChange={(v) => handleChange('awayTeamRank', v)}
                            />
                            <NumberField
                                label="Home wins"
                                value={game.homeWins ?? game.home_wins}
                                onChange={(v) => handleChange('homeWins', v)}
                            />
                            <NumberField
                                label="Home losses"
                                value={game.homeLosses ?? game.home_losses}
                                onChange={(v) => handleChange('homeLosses', v)}
                            />
                            <NumberField
                                label="Away wins"
                                value={game.awayWins ?? game.away_wins}
                                onChange={(v) => handleChange('awayWins', v)}
                            />
                            <NumberField
                                label="Away losses"
                                value={game.awayLosses ?? game.away_losses}
                                onChange={(v) => handleChange('awayLosses', v)}
                            />
                        </Box>
                    </Panel>
                </Box>
            ),
        },
        {
            value: 'flow',
            label: 'Flow & alerts',
            content: (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: '16px',
                        alignItems: 'start',
                    }}
                >
                    <Panel header="Game flow">
                        <Box sx={formGridSx}>
                            <SideField
                                label="Waiting on"
                                value={game.waitingOn || game.waiting_on}
                                onChange={(v) => handleChange('waitingOn', v)}
                            />
                            <NumberField
                                label="Home timeouts"
                                value={game.homeTimeouts ?? game.home_timeouts}
                                onChange={(v) => handleChange('homeTimeouts', v)}
                                fallback={3}
                            />
                            <NumberField
                                label="Away timeouts"
                                value={game.awayTimeouts ?? game.away_timeouts}
                                onChange={(v) => handleChange('awayTimeouts', v)}
                                fallback={3}
                            />
                            <SideField
                                label="Coin toss winner"
                                value={game.coinTossWinner || game.coin_toss_winner}
                                onChange={(v) => handleChange('coinTossWinner', v)}
                                includeNone
                            />
                            <FormField label="Coin toss choice">
                                <Box
                                    component="select"
                                    value={game.coinTossChoice || game.coin_toss_choice || ''}
                                    onChange={(e) => handleChange('coinTossChoice', e.target.value)}
                                    sx={selectSx}
                                >
                                    <option value="">None</option>
                                    {COIN_TOSS_CHOICES.map((choice) => (
                                        <option key={choice} value={choice}>
                                            {choice === 'RECEIVE' ? 'Receive' : 'Defer'}
                                        </option>
                                    ))}
                                </Box>
                            </FormField>
                            <TextInputField
                                label="Game timer"
                                value={game.gameTimer || game.game_timer || ''}
                                onChange={(v) => handleChange('gameTimer', v)}
                            />
                        </Box>
                    </Panel>

                    <Panel header="Game settings & alerts">
                        <Box sx={formGridSx}>
                            <FormField label="Game warning">
                                <Box
                                    component="select"
                                    value={game.gameWarning || game.game_warning || ''}
                                    onChange={(e) => handleChange('gameWarning', e.target.value)}
                                    sx={selectSx}
                                >
                                    {GAME_WARNINGS.map((warning) => (
                                        <option key={warning} value={warning}>
                                            {warning.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </Box>
                            </FormField>
                            <FormField label="Current play type">
                                <Box
                                    component="select"
                                    value={game.currentPlayType || game.current_play_type || ''}
                                    onChange={(e) => handleChange('currentPlayType', e.target.value)}
                                    sx={selectSx}
                                >
                                    <option value="">None</option>
                                    {PLAY_TYPES.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </Box>
                            </FormField>
                            <NumberField
                                label="Current play ID"
                                value={game.currentPlayId ?? game.current_play_id}
                                onChange={(v) => handleChange('currentPlayId', v)}
                            />
                            <FormField label="Overtime half">
                                <Box
                                    component="select"
                                    value={game.overtimeHalf ?? game.overtime_half ?? 0}
                                    onChange={(e) => handleChange('overtimeHalf', Number(e.target.value))}
                                    sx={selectSx}
                                >
                                    <option value={0}>Bottom</option>
                                    <option value={1}>Top</option>
                                </Box>
                            </FormField>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '20px', px: '16px', pb: '16px' }}>
                            {[
                                ['clockStopped', 'clock_stopped', 'Clock stopped'],
                                ['closeGame', 'close_game', 'Close game'],
                                ['closeGamePinged', 'close_game_pinged', 'Close game pinged'],
                                ['upsetAlert', 'upset_alert', 'Upset alert'],
                                ['upsetAlertPinged', 'upset_alert_pinged', 'Upset alert pinged'],
                            ].map(([camel, snake, label]) => (
                                <Box key={camel} sx={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                                    <Toggle
                                        on={!!(game[camel] ?? game[snake])}
                                        onClick={() => handleChange(camel, !(game[camel] ?? game[snake]))}
                                    />
                                    <Box sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{label}</Box>
                                </Box>
                            ))}
                        </Box>
                    </Panel>
                </Box>
            ),
        },
        {
            value: 'plays',
            label: 'Plays',
            content: (
                <Panel header={`Game plays (${plays.length})`}>
                    {playsLoading ? (
                        <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : plays.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                            No plays found for this game.
                        </Box>
                    ) : (
                        <GamePlaysTable plays={plays} />
                    )}
                </Panel>
            ),
        },
    ];

    return (
        <EditDialog
            open
            onClose={onClose}
            title={title}
            actions={saveButton}
            maxWidth="xl"
            tabs={!loading && game ? tabs : undefined}
        >
            {loading && (
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            )}
            {!loading && !game && <Alert severity="error">{error || 'Game not found'}</Alert>}
            {!loading && game && (
                <>
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}
                    {success && (
                        <Alert severity="success" onClose={() => setSuccess(null)}>
                            {success}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <Box
                            component="button"
                            type="button"
                            onClick={handleRestartGame}
                            disabled={saving}
                            sx={ctrlWarnSx}
                        >
                            &#8635; Restart game
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={handleRollbackPlay}
                            disabled={saving}
                            sx={ctrlLiveSx}
                        >
                            &#8617; Rollback play
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={handleRegenerateStats}
                            disabled={saving}
                            sx={secondaryButtonSx}
                        >
                            &#9635; Regenerate stats
                        </Box>
                    </Box>
                </>
            )}
        </EditDialog>
    );
};

GameEditDialog.propTypes = {
    gameId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default GameEditDialog;
