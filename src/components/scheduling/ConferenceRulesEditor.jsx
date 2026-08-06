import React, { useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';

const TOTAL_WEEKS = 12;
const DEFAULT_CONFERENCE_GAMES = 9;

const selectSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', cursor: 'pointer', '& option': { background: 'var(--surface)', color: 'var(--text)' } };
const inputSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem' };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '14px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };
const removeBtnSx = { border: 0, background: 'transparent', color: 'var(--live)', cursor: 'pointer', fontSize: '0.9rem', px: '6px' };

const ConferenceRulesEditor = ({
    conference,
    conferenceTeams,
    numConferenceGames,
    protectedRivalries,
    divisions,
    onNumConferenceGamesChange,
    onAddRivalry,
    onRemoveRivalry,
    onUpdateRivalry,
    onToggleDivisions,
    onUpdateDivision,
    onSave,
    disabled = false,
}) => {
    const [savingRules, setSavingRules] = useState(false);
    const [rulesError, setRulesError] = useState(null);
    const divisionsEnabled = divisions.length > 0;

    return (
        <Box>
            {conferenceTeams.length <= numConferenceGames + 1 && (
                <Alert severity="info" sx={{ mb: '14px', py: 0.5 }}>Round robin format: each team plays every other team once.</Alert>
            )}
            {rulesError && (
                <Alert severity="error" sx={{ mb: '14px', py: 0.5 }}>{rulesError}</Alert>
            )}

            <Box sx={{ mb: '18px', maxWidth: 260 }}>
                <Box sx={{ display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' }}>Conference games per team</Box>
                <Box component="input" type="number" min={1} max={TOTAL_WEEKS} value={numConferenceGames} onChange={(e) => onNumConferenceGamesChange(parseInt(e.target.value, 10) || DEFAULT_CONFERENCE_GAMES)} sx={{ ...inputSx, width: '100%' }} />
                <Box sx={{ mt: '4px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>OOC games: {TOTAL_WEEKS - numConferenceGames}</Box>
            </Box>

            <Box sx={{ borderTop: '1px solid var(--line-soft)', pt: '16px', pb: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6px' }}>
                    <Box sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Divisions</Box>
                    <Box component="button" type="button" onClick={() => onToggleDivisions(!divisionsEnabled)} sx={ctrlSx}>
                        {divisionsEnabled ? 'Disable divisions' : 'Enable divisions'}
                    </Box>
                </Box>
                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', mb: '12px' }}>
                    Optional. A conference has exactly two divisions. When enabled, teams assigned to a division
                    (from the Teams tab) play a full round robin against every other team in their division, plus any
                    protected rivalries, before remaining conference games are filled with the other division&apos;s teams.
                </Box>

                {!divisionsEnabled ? (
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                        No divisions set. This conference schedules as one flat group.
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Box component="input" value={divisions[0] || ''} onChange={(e) => onUpdateDivision(0, e.target.value)} placeholder="Division 1 name" sx={{ ...inputSx, flex: '1 1 220px' }} />
                        <Box component="input" value={divisions[1] || ''} onChange={(e) => onUpdateDivision(1, e.target.value)} placeholder="Division 2 name" sx={{ ...inputSx, flex: '1 1 220px' }} />
                    </Box>
                )}
            </Box>

            <Box sx={{ borderTop: '1px solid var(--line-soft)', pt: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6px' }}>
                    <Box sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Protected rivalries</Box>
                    <Box component="button" type="button" onClick={onAddRivalry} sx={ctrlSx}>+ Add rivalry</Box>
                </Box>
                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', mb: '12px' }}>
                    Protected rivalries are always scheduled when auto-generating. The schedule cannot be finalized if any protected rivalry is missing.
                </Box>

                {protectedRivalries.length === 0 && (
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic', mb: '12px' }}>
                        No protected rivalries set. Click &quot;Add rivalry&quot; to define guaranteed matchups.
                    </Box>
                )}

                {protectedRivalries.map((rivalry, index) => {
                    const isLocked = rivalry.team1 && rivalry.team2;
                    return (
                        <Box key={index} sx={{ display: 'flex', gap: '8px', mb: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Box component="select" value={rivalry.team1 || ''} onChange={(e) => onUpdateRivalry(index, 'team1', e.target.value)} disabled={isLocked} sx={{ ...selectSx, flex: '1 1 160px' }}>
                                <option value="">Team 1</option>
                                {conferenceTeams.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                            </Box>
                            <Box sx={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>vs</Box>
                            <Box component="select" value={rivalry.team2 || ''} onChange={(e) => onUpdateRivalry(index, 'team2', e.target.value)} disabled={isLocked} sx={{ ...selectSx, flex: '1 1 160px' }}>
                                <option value="">Team 2</option>
                                {conferenceTeams.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                            </Box>
                            <Box component="select" value={rivalry.week || ''} onChange={(e) => onUpdateRivalry(index, 'week', e.target.value ? Number(e.target.value) : null)} sx={{ ...selectSx, minWidth: 90 }}>
                                <option value="">Any week</option>
                                {Array.from({ length: TOTAL_WEEKS }, (_, i) => <option key={i + 1} value={i + 1}>Wk {i + 1}</option>)}
                            </Box>
                            <Box component="button" type="button" onClick={() => onRemoveRivalry(index)} sx={removeBtnSx}>&times;</Box>
                        </Box>
                    );
                })}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '14px' }}>
                    <Box
                        component="button" type="button"
                        onClick={async () => {
                            if (!onSave) return;
                            setSavingRules(true);
                            setRulesError(null);
                            try {
                                await onSave(conference, numConferenceGames, protectedRivalries, divisions);
                            } catch (err) {
                                setRulesError(err.message || 'Failed to save conference rules');
                            } finally {
                                setSavingRules(false);
                            }
                        }}
                        disabled={savingRules || disabled}
                        sx={btnPrimarySx}
                    >
                        {savingRules ? 'Saving...' : 'Save conference rules'}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

ConferenceRulesEditor.propTypes = {
    conference: PropTypes.string.isRequired,
    conferenceTeams: PropTypes.array.isRequired,
    numConferenceGames: PropTypes.number.isRequired,
    protectedRivalries: PropTypes.array.isRequired,
    divisions: PropTypes.array.isRequired,
    onNumConferenceGamesChange: PropTypes.func.isRequired,
    onAddRivalry: PropTypes.func.isRequired,
    onRemoveRivalry: PropTypes.func.isRequired,
    onUpdateRivalry: PropTypes.func.isRequired,
    onToggleDivisions: PropTypes.func.isRequired,
    onUpdateDivision: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default ConferenceRulesEditor;
