import React, { useState, useEffect, useCallback } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import Toggle from '../../components/ui/Toggle';
import { getGameById, updateGame, restartGame } from '../../api/gameApi';
import { getAllPlaysByGameId, rollbackPlay } from '../../api/playApi';
import { generateGameStats } from '../../api/gameStatsApi.jsx';
import {
    TV_CHANNELS, TEAM_SIDES, COIN_TOSS_CHOICES, GAME_WARNINGS, PLAY_TYPES, GAME_STATUSES, GAME_TYPES, GAME_MODES,
    GAME_STATUS_DESCRIPTIONS, GAME_TYPE_DESCRIPTIONS, GAME_MODE_DESCRIPTIONS,
} from '../../constants/gameEnums';
import { OFFENSIVE_PLAYBOOKS, DEFENSIVE_PLAYBOOKS } from '../../constants/teamEnums';
import { slugId } from '../../utils/a11y';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', py: '10px', font: 'inherit', fontSize: '0.85rem' };
const selectSx = { ...inputSx, cursor: 'pointer', '& option': { background: 'var(--surface-2)', color: 'var(--text)' } };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '14px', py: '9px', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '14px', py: '9px', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };
const ctrlWarnSx = { ...ctrlSx, color: 'var(--gold)', '&:hover': { borderColor: 'var(--gold)', color: 'var(--text)' } };
const ctrlLiveSx = { ...ctrlSx, color: 'var(--live)', '&:hover': { borderColor: 'var(--live)', color: 'var(--text)' } };
const backSx = { color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block', mb: '14px' };
const gridSx = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0 16px', p: '16px' };

const Field = ({ label, children }) => {
    const id = slugId(label);
    return (
        <Box sx={{ mb: '14px' }}>
            <Box component="label" htmlFor={id} sx={labelSx}>{label}</Box>
            {React.cloneElement(children, { id })}
        </Box>
    );
};

Field.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

const NumberField = ({ label, value, onChange, fallback = 0 }) => (
    <Field label={label}>
        <Box component="input" type="number" value={value ?? fallback} onChange={(e) => onChange(parseInt(e.target.value, 10) || fallback)} sx={inputSx} />
    </Field>
);

NumberField.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), onChange: PropTypes.func.isRequired, fallback: PropTypes.number };

const TextInputField = ({ label, value, onChange }) => (
    <Field label={label}>
        <Box component="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} sx={inputSx} />
    </Field>
);

TextInputField.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string, onChange: PropTypes.func.isRequired };

const SideField = ({ label, value, onChange, includeNone = false }) => (
    <Field label={label}>
        <Box component="select" value={value ?? ''} onChange={(e) => onChange(e.target.value)} sx={selectSx}>
            {includeNone && <option value="">None</option>}
            {TEAM_SIDES.map((side) => <option key={side} value={side}>{side === 'HOME' ? 'Home' : 'Away'}</option>)}
        </Box>
    </Field>
);

SideField.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.string, onChange: PropTypes.func.isRequired, includeNone: PropTypes.bool };

const playColumns = [
    'play_number', 'home_score', 'away_score', 'quarter', 'clock', 'ball_location', 'possession', 'down', 'yards_to_go',
    'defensive_number', 'offensive_number', 'difference', 'defensive_submitter', 'offensive_submitter', 'play_call',
    'result', 'actual_result', 'yards', 'play_time', 'runoff_time', 'win_probability', 'win_probability_added',
    'offensive_response_speed', 'defensive_response_speed',
];

const playColumnLabel = (id) => id.split('_').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');

const EditGame = () => {
    const { gameId } = useParams();
    const [game, setGame] = useState(null);
    const [plays, setPlays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [playsLoading, setPlaysLoading] = useState(true);

    const fetchGame = useCallback(async () => {
        try {
            setGame(await getGameById(gameId));
        } catch (err) {
            console.error('Failed to fetch game:', err);
            setError('Failed to load game data');
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    const fetchPlays = useCallback(async () => {
        try {
            setPlays((await getAllPlaysByGameId(gameId)) || []);
        } catch (err) {
            console.error('Failed to fetch plays:', err);
            setError('Failed to load plays data');
        } finally {
            setPlaysLoading(false);
        }
    }, [gameId]);

    useEffect(() => {
        if (gameId) {
            fetchGame();
            fetchPlays();
        }
    }, [gameId, fetchGame, fetchPlays]);

    const handleChange = (field, value) => setGame((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await updateGame(game);
            setSuccess('Game updated successfully!');
        } catch (err) {
            setError(`Failed to update game: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleRestartGame = async () => {
        if (!window.confirm('Are you sure you want to restart this game? This action cannot be undone.')) return;
        setSaving(true);
        setError(null);
        try {
            await restartGame(gameId);
            setSuccess('Game restarted successfully!');
            fetchGame();
        } catch (err) {
            setError(`Failed to restart game: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleRollbackPlay = async () => {
        if (!window.confirm('Are you sure you want to rollback the last play? This action cannot be undone.')) return;
        setSaving(true);
        setError(null);
        try {
            await rollbackPlay(gameId);
            setSuccess('Play rolled back successfully!');
            fetchGame();
            fetchPlays();
        } catch (err) {
            setError(`Failed to rollback play: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerateStats = async () => {
        if (!window.confirm('Are you sure you want to regenerate stats for this game?')) return;
        setSaving(true);
        setError(null);
        try {
            await generateGameStats(gameId);
            setSuccess('Stats regenerated successfully!');
        } catch (err) {
            setError(`Failed to regenerate stats: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Edit Game">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            </AdminLayout>
        );
    }

    if (!game) {
        return (
            <AdminLayout title="Edit Game">
                <Alert severity="error">Game not found</Alert>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={`Edit Game: ${game.awayTeam || game.away_team} @ ${game.homeTeam || game.home_team}`}>
            <Box component={Link} to="/admin/game-management" sx={backSx}>&larr; Game management</Box>

            {error && <Alert severity="error" sx={{ mb: '16px' }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: '16px' }} onClose={() => setSuccess(null)}>{success}</Alert>}

            <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', mb: '16px' }}>
                <Box component="button" type="button" onClick={handleSave} disabled={saving} sx={btnPrimarySx}>{saving ? 'Saving...' : 'Save changes'}</Box>
                <Box component="button" type="button" onClick={handleRestartGame} disabled={saving} sx={ctrlWarnSx}>&#8635; Restart game</Box>
                <Box component="button" type="button" onClick={handleRollbackPlay} disabled={saving} sx={ctrlLiveSx}>&#8617; Rollback play</Box>
                <Box component="button" type="button" onClick={handleRegenerateStats} disabled={saving} sx={ctrlSx}>&#9635; Regenerate stats</Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '16px', mb: '16px' }}>
                <Panel header="Basic game info">
                    <Box sx={gridSx}>
                        <NumberField label="Season" value={game.season} onChange={(v) => handleChange('season', v)} />
                        <NumberField label="Week" value={game.week} onChange={(v) => handleChange('week', v)} />
                        <Field label="Game type">
                            <Box component="select" value={game.gameType || game.game_type || ''} onChange={(e) => handleChange('gameType', e.target.value)} sx={selectSx}>
                                {GAME_TYPES.map((type) => <option key={type} value={type}>{GAME_TYPE_DESCRIPTIONS[type]}</option>)}
                            </Box>
                        </Field>
                        <Field label="Game status">
                            <Box component="select" value={game.gameStatus || game.game_status || ''} onChange={(e) => handleChange('gameStatus', e.target.value)} sx={selectSx}>
                                {GAME_STATUSES.map((status) => <option key={status} value={status}>{GAME_STATUS_DESCRIPTIONS[status]}</option>)}
                            </Box>
                        </Field>
                        <Field label="Game mode">
                            <Box component="select" value={game.gameMode || game.game_mode || ''} onChange={(e) => handleChange('gameMode', e.target.value)} sx={selectSx}>
                                {GAME_MODES.map((mode) => <option key={mode} value={mode}>{GAME_MODE_DESCRIPTIONS[mode]}</option>)}
                            </Box>
                        </Field>
                        <Field label="TV channel">
                            <Box component="select" value={game.tvChannel || game.tv_channel || ''} onChange={(e) => handleChange('tvChannel', e.target.value)} sx={selectSx}>
                                <option value="">None</option>
                                {TV_CHANNELS.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
                            </Box>
                        </Field>
                    </Box>
                </Panel>

                <Panel header="Team playbooks">
                    <Box sx={gridSx}>
                        <Field label="Home offensive playbook">
                            <Box component="select" value={game.homeOffensivePlaybook || game.home_offensive_playbook || ''} onChange={(e) => handleChange('homeOffensivePlaybook', e.target.value)} sx={selectSx}>
                                {OFFENSIVE_PLAYBOOKS.map((playbook) => <option key={playbook} value={playbook}>{playbook.replace(/_/g, ' ')}</option>)}
                            </Box>
                        </Field>
                        <Field label="Away offensive playbook">
                            <Box component="select" value={game.awayOffensivePlaybook || game.away_offensive_playbook || ''} onChange={(e) => handleChange('awayOffensivePlaybook', e.target.value)} sx={selectSx}>
                                {OFFENSIVE_PLAYBOOKS.map((playbook) => <option key={playbook} value={playbook}>{playbook.replace(/_/g, ' ')}</option>)}
                            </Box>
                        </Field>
                        <Field label="Home defensive playbook">
                            <Box component="select" value={game.homeDefensivePlaybook || game.home_defensive_playbook || ''} onChange={(e) => handleChange('homeDefensivePlaybook', e.target.value)} sx={selectSx}>
                                {DEFENSIVE_PLAYBOOKS.map((playbook) => <option key={playbook} value={playbook}>{playbook.replace(/_/g, ' ')}</option>)}
                            </Box>
                        </Field>
                        <Field label="Away defensive playbook">
                            <Box component="select" value={game.awayDefensivePlaybook || game.away_defensive_playbook || ''} onChange={(e) => handleChange('awayDefensivePlaybook', e.target.value)} sx={selectSx}>
                                {DEFENSIVE_PLAYBOOKS.map((playbook) => <option key={playbook} value={playbook}>{playbook.replace(/_/g, ' ')}</option>)}
                            </Box>
                        </Field>
                    </Box>
                </Panel>

                <Panel header="Scores & game state">
                    <Box sx={gridSx}>
                        <NumberField label="Home score" value={game.homeScore ?? game.home_score} onChange={(v) => handleChange('homeScore', v)} />
                        <NumberField label="Away score" value={game.awayScore ?? game.away_score} onChange={(v) => handleChange('awayScore', v)} />
                        <NumberField label="Quarter" value={game.quarter} onChange={(v) => handleChange('quarter', v)} fallback={1} />
                        <TextInputField label="Clock" value={game.clock || game.game_clock || '00:00'} onChange={(v) => handleChange('clock', v)} />
                        <NumberField label="Ball location" value={game.ballLocation ?? game.ball_location} onChange={(v) => handleChange('ballLocation', v)} />
                        <NumberField label="Down" value={game.down} onChange={(v) => handleChange('down', v)} fallback={1} />
                        <NumberField label="Yards to go" value={game.yardsToGo ?? game.yards_to_go} onChange={(v) => handleChange('yardsToGo', v)} fallback={10} />
                        <SideField label="Possession" value={game.possession} onChange={(v) => handleChange('possession', v)} />
                    </Box>
                </Panel>

                <Panel header="Team records & rankings">
                    <Box sx={gridSx}>
                        <NumberField label="Home team rank" value={game.homeTeamRank ?? game.home_team_rank} onChange={(v) => handleChange('homeTeamRank', v)} />
                        <NumberField label="Away team rank" value={game.awayTeamRank ?? game.away_team_rank} onChange={(v) => handleChange('awayTeamRank', v)} />
                        <NumberField label="Home wins" value={game.homeWins ?? game.home_wins} onChange={(v) => handleChange('homeWins', v)} />
                        <NumberField label="Home losses" value={game.homeLosses ?? game.home_losses} onChange={(v) => handleChange('homeLosses', v)} />
                        <NumberField label="Away wins" value={game.awayWins ?? game.away_wins} onChange={(v) => handleChange('awayWins', v)} />
                        <NumberField label="Away losses" value={game.awayLosses ?? game.away_losses} onChange={(v) => handleChange('awayLosses', v)} />
                    </Box>
                </Panel>

                <Panel header="Game flow">
                    <Box sx={gridSx}>
                        <SideField label="Waiting on" value={game.waitingOn || game.waiting_on} onChange={(v) => handleChange('waitingOn', v)} />
                        <NumberField label="Home timeouts" value={game.homeTimeouts ?? game.home_timeouts} onChange={(v) => handleChange('homeTimeouts', v)} fallback={3} />
                        <NumberField label="Away timeouts" value={game.awayTimeouts ?? game.away_timeouts} onChange={(v) => handleChange('awayTimeouts', v)} fallback={3} />
                        <SideField label="Coin toss winner" value={game.coinTossWinner || game.coin_toss_winner} onChange={(v) => handleChange('coinTossWinner', v)} includeNone />
                        <Field label="Coin toss choice">
                            <Box component="select" value={game.coinTossChoice || game.coin_toss_choice || ''} onChange={(e) => handleChange('coinTossChoice', e.target.value)} sx={selectSx}>
                                <option value="">None</option>
                                {COIN_TOSS_CHOICES.map((choice) => <option key={choice} value={choice}>{choice === 'RECEIVE' ? 'Receive' : 'Defer'}</option>)}
                            </Box>
                        </Field>
                        <TextInputField label="Game timer" value={game.gameTimer || game.game_timer || ''} onChange={(v) => handleChange('gameTimer', v)} />
                    </Box>
                </Panel>

                <Panel header="Game settings & alerts">
                    <Box sx={gridSx}>
                        <Field label="Game warning">
                            <Box component="select" value={game.gameWarning || game.game_warning || ''} onChange={(e) => handleChange('gameWarning', e.target.value)} sx={selectSx}>
                                {GAME_WARNINGS.map((warning) => <option key={warning} value={warning}>{warning.replace(/_/g, ' ')}</option>)}
                            </Box>
                        </Field>
                        <Field label="Current play type">
                            <Box component="select" value={game.currentPlayType || game.current_play_type || ''} onChange={(e) => handleChange('currentPlayType', e.target.value)} sx={selectSx}>
                                <option value="">None</option>
                                {PLAY_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                            </Box>
                        </Field>
                        <NumberField label="Current play ID" value={game.currentPlayId ?? game.current_play_id} onChange={(v) => handleChange('currentPlayId', v)} />
                        <Field label="Overtime half">
                            <Box component="select" value={game.overtimeHalf ?? game.overtime_half ?? 0} onChange={(e) => handleChange('overtimeHalf', Number(e.target.value))} sx={selectSx}>
                                <option value={0}>Bottom</option>
                                <option value={1}>Top</option>
                            </Box>
                        </Field>
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
                                <Toggle on={!!(game[camel] ?? game[snake])} onClick={() => handleChange(camel, !(game[camel] ?? game[snake]))} />
                                <Box sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{label}</Box>
                            </Box>
                        ))}
                    </Box>
                </Panel>
            </Box>

            <Panel header={`Game plays (${plays.length})`}>
                {playsLoading ? (
                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
                ) : plays.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No plays found for this game.</Box>
                ) : (
                    <DataTable minWidth={2200}>
                        <thead>
                            <tr>
                                {playColumns.map((col) => <th key={col} className={col === 'play_number' ? 'lft stick' : 'lft'}>{playColumnLabel(col)}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {plays.map((play, index) => (
                                <tr key={play.id || index}>
                                    {playColumns.map((col) => (
                                        <td key={col} className={col === 'play_number' ? 'lft stick' : 'lft'}>
                                            {(col === 'play_number' ? play[col] || index + 1 : play[col]) ?? 'N/A'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </DataTable>
                )}
            </Panel>
        </AdminLayout>
    );
};

export default EditGame;
