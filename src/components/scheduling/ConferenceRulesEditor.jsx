import React, { useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import NumberInput from '../ui/NumberInput';
import TeamSelect from '../ui/TeamSelect';
import { inputSx, primaryButtonSx, secondaryButtonSx, selectSx } from '../../styles/controls';

const TOTAL_WEEKS = 12;
const DEFAULT_CONFERENCE_GAMES = 9;

const removeBtnSx = {
    border: 0,
    background: 'transparent',
    color: 'var(--live)',
    cursor: 'pointer',
    fontSize: '0.9rem',
    px: '6px',
};

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
    showDivisions = true,
}) => {
    const [savingRules, setSavingRules] = useState(false);
    const [rulesError, setRulesError] = useState(null);
    const divisionsEnabled = divisions.length > 0;

    const handleSave = async () => {
        if (!onSave) {
            return;
        }
        setSavingRules(true);
        setRulesError(null);
        try {
            await onSave(conference, numConferenceGames, protectedRivalries, divisions);
        } catch (err) {
            setRulesError(err.message || 'Failed to save conference rules');
        } finally {
            setSavingRules(false);
        }
    };

    return (
        <Box>
            {conferenceTeams.length <= numConferenceGames + 1 && (
                <Alert severity="info" sx={{ mb: '14px', py: 0.5 }}>
                    Round robin format: each team plays every other team once.
                </Alert>
            )}
            {rulesError && (
                <Alert severity="error" sx={{ mb: '14px', py: 0.5 }}>
                    {rulesError}
                </Alert>
            )}

            <Box sx={{ mb: '18px', maxWidth: 260 }}>
                <Box
                    sx={{
                        display: 'block',
                        fontSize: '0.68rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 800,
                        color: 'var(--text-dim)',
                        mb: '5px',
                    }}
                >
                    Conference games per team
                </Box>
                <NumberInput
                    value={numConferenceGames}
                    onChange={(next) => onNumConferenceGamesChange(Math.round(next) || DEFAULT_CONFERENCE_GAMES)}
                    min={1}
                    max={TOTAL_WEEKS}
                    ariaLabel="Conference games per team"
                />
                <Box sx={{ mt: '4px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    OOC games: {TOTAL_WEEKS - numConferenceGames}
                </Box>
            </Box>

            {showDivisions && (
                <Box sx={{ borderTop: '1px solid var(--line-soft)', pt: '16px', pb: '16px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6px' }}>
                        <Box sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Divisions</Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={() => onToggleDivisions(!divisionsEnabled)}
                            sx={secondaryButtonSx}
                        >
                            {divisionsEnabled ? 'Disable divisions' : 'Enable divisions'}
                        </Box>
                    </Box>
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', mb: '12px' }}>
                        Optional. A conference has exactly two divisions. When enabled, teams assigned to a division
                        (from the Teams tab) play a full round robin against every other team in their division, plus
                        any protected rivalries, before remaining conference games are filled with the other
                        division&apos;s teams.
                    </Box>

                    {!divisionsEnabled ? (
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            No divisions set. This conference schedules as one flat group.
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <Box
                                component="input"
                                value={divisions[0] || ''}
                                onChange={(e) => onUpdateDivision(0, e.target.value)}
                                placeholder="Division 1 name"
                                sx={{ ...inputSx, flex: '1 1 220px' }}
                            />
                            <Box
                                component="input"
                                value={divisions[1] || ''}
                                onChange={(e) => onUpdateDivision(1, e.target.value)}
                                placeholder="Division 2 name"
                                sx={{ ...inputSx, flex: '1 1 220px' }}
                            />
                        </Box>
                    )}
                </Box>
            )}

            <Box sx={{ borderTop: '1px solid var(--line-soft)', pt: '16px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6px' }}>
                    <Box sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Protected rivalries</Box>
                    <Box component="button" type="button" onClick={onAddRivalry} sx={secondaryButtonSx}>
                        + Add rivalry
                    </Box>
                </Box>
                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', mb: '12px' }}>
                    Protected rivalries are always scheduled when auto-generating. The schedule cannot be finalized if
                    any protected rivalry is missing.
                </Box>

                {protectedRivalries.length === 0 && (
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic', mb: '12px' }}>
                        No protected rivalries set. Click &quot;Add rivalry&quot; to define guaranteed matchups.
                    </Box>
                )}

                {protectedRivalries.map((rivalry, index) => {
                    const isLocked = rivalry.team1 && rivalry.team2;
                    return (
                        <Box
                            key={index}
                            sx={{ display: 'flex', gap: '8px', mb: '8px', alignItems: 'center', flexWrap: 'wrap' }}
                        >
                            <TeamSelect
                                value={rivalry.team1 || ''}
                                onChange={(name) => onUpdateRivalry(index, 'team1', name)}
                                teams={conferenceTeams.map((t) => t.name)}
                                exclude={rivalry.team2 || undefined}
                                ariaLabel={`Rivalry ${index + 1} team 1`}
                                placeholder="Team 1"
                                disabled={isLocked}
                                sx={{ flex: '1 1 180px' }}
                            />
                            <Box sx={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>vs</Box>
                            <TeamSelect
                                value={rivalry.team2 || ''}
                                onChange={(name) => onUpdateRivalry(index, 'team2', name)}
                                teams={conferenceTeams.map((t) => t.name)}
                                exclude={rivalry.team1 || undefined}
                                ariaLabel={`Rivalry ${index + 1} team 2`}
                                placeholder="Team 2"
                                disabled={isLocked}
                                sx={{ flex: '1 1 180px' }}
                            />
                            <Box
                                component="select"
                                value={rivalry.week || ''}
                                onChange={(e) =>
                                    onUpdateRivalry(index, 'week', e.target.value ? Number(e.target.value) : null)
                                }
                                sx={{ ...selectSx, minWidth: 90 }}
                            >
                                <option value="">Any week</option>
                                {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Wk {i + 1}
                                    </option>
                                ))}
                            </Box>
                            <Box
                                component="button"
                                type="button"
                                onClick={() => onRemoveRivalry(index)}
                                sx={removeBtnSx}
                            >
                                &times;
                            </Box>
                        </Box>
                    );
                })}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '14px' }}>
                    <Box
                        component="button"
                        type="button"
                        onClick={handleSave}
                        disabled={savingRules || disabled}
                        sx={primaryButtonSx}
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
    onToggleDivisions: PropTypes.func,
    onUpdateDivision: PropTypes.func,
    onSave: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    showDivisions: PropTypes.bool,
};

export default ConferenceRulesEditor;
