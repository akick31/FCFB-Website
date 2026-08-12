import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import ConferenceRulesEditor from './ConferenceRulesEditor';
import ConferenceScheduleGrid from './ConferenceScheduleGrid';
import { formatConference } from '../../utils/formatText';

const selectSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', cursor: 'pointer', '& option': { background: 'var(--surface)', color: 'var(--text)' } };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '14px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };
const TOTAL_WEEKS = 12;

const ConferenceScheduleAdminTab = ({
    selectedConference,
    onConferenceChange,
    adminConferences,
    conferenceSchedule,
    conferenceTeams,
    confLoading,
    scheduleLocked,
    teamMap,
    allSeasonSchedule = [],
    teamWeekOccupiedAll,
    onAddGameManually,
    onGenerateSchedule,
    onEmptyCellClick,
    onFilledCellClick,
    onGameDrop,
    numConferenceGames,
    onNumConferenceGamesChange,
    protectedRivalries,
    onAddRivalry,
    onRemoveRivalry,
    onUpdateRivalry,
    divisions,
    onToggleDivisions,
    onUpdateDivision,
    hasGamesPlayed = false,
    onSaveConferenceRules,
}) => {
    const [rulesExpanded, setRulesExpanded] = useState(false);

    return (
        <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', mb: '16px', alignItems: 'center' }}>
                <Box component="select" value={selectedConference} onChange={(e) => onConferenceChange(e.target.value)} sx={selectSx}>
                    {adminConferences.map(conf => <option key={conf.code} value={conf.code}>{conf.label}</option>)}
                </Box>
                <Box
                    component="button" type="button" onClick={onGenerateSchedule}
                    disabled={scheduleLocked || hasGamesPlayed}
                    title={hasGamesPlayed ? 'Cannot auto-generate: games have already been played this season' : scheduleLocked ? 'Schedule is locked' : ''}
                    sx={btnPrimarySx}
                >
                    Auto-generate schedule
                </Box>
                <Box component="button" type="button" onClick={onAddGameManually} disabled={scheduleLocked} sx={ctrlSx}>+ Add game manually</Box>
            </Box>

            <Panel sx={{ mb: '16px' }}>
                <Box
                    onClick={() => setRulesExpanded(!rulesExpanded)}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '14px 16px', cursor: 'pointer', flexWrap: 'wrap', gap: '8px' }}
                >
                    <Box sx={{ fontWeight: 700, fontSize: '0.88rem' }}>Conference rules: {formatConference(selectedConference)}</Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>
                            {numConferenceGames} conf games &middot; {TOTAL_WEEKS - numConferenceGames} OOC &middot; {conferenceTeams.length} teams &middot; {protectedRivalries.filter(r => r.team1 && r.team2).length} rivalries
                        </Box>
                        <Box component="span" sx={{ color: 'var(--text-dim)' }}>{rulesExpanded ? '▲' : '▼'}</Box>
                    </Box>
                </Box>

                {rulesExpanded && (
                    <Box sx={{ p: '0 16px 16px', borderTop: '1px solid var(--line-soft)', pt: '16px' }}>
                        <ConferenceRulesEditor
                            conference={selectedConference}
                            conferenceTeams={conferenceTeams}
                            numConferenceGames={numConferenceGames}
                            protectedRivalries={protectedRivalries}
                            divisions={divisions}
                            onNumConferenceGamesChange={onNumConferenceGamesChange}
                            onAddRivalry={onAddRivalry}
                            onRemoveRivalry={onRemoveRivalry}
                            onUpdateRivalry={onUpdateRivalry}
                            onToggleDivisions={onToggleDivisions}
                            onUpdateDivision={onUpdateDivision}
                            onSave={onSaveConferenceRules}
                            disabled={scheduleLocked}
                        />
                    </Box>
                )}
            </Panel>

            <ConferenceScheduleGrid
                selectedConference={selectedConference}
                conferenceSchedule={conferenceSchedule}
                conferenceTeams={conferenceTeams}
                allSeasonSchedule={allSeasonSchedule}
                confLoading={confLoading}
                scheduleLocked={scheduleLocked}
                teamMap={teamMap}
                teamWeekOccupiedAll={teamWeekOccupiedAll}
                numConferenceGames={numConferenceGames}
                onEmptyCellClick={onEmptyCellClick}
                onFilledCellClick={onFilledCellClick}
                onGameDrop={onGameDrop}
            />
        </Box>
    );
};

ConferenceScheduleAdminTab.propTypes = {
    selectedConference: PropTypes.string.isRequired,
    onConferenceChange: PropTypes.func.isRequired,
    adminConferences: PropTypes.array.isRequired,
    conferenceSchedule: PropTypes.array.isRequired,
    conferenceTeams: PropTypes.array.isRequired,
    confLoading: PropTypes.bool,
    scheduleLocked: PropTypes.bool,
    teamMap: PropTypes.object.isRequired,
    allSeasonSchedule: PropTypes.array,
    teamWeekOccupiedAll: PropTypes.instanceOf(Set),
    onAddGameManually: PropTypes.func.isRequired,
    onGenerateSchedule: PropTypes.func.isRequired,
    onEmptyCellClick: PropTypes.func.isRequired,
    onFilledCellClick: PropTypes.func.isRequired,
    onGameDrop: PropTypes.func.isRequired,
    numConferenceGames: PropTypes.number.isRequired,
    onNumConferenceGamesChange: PropTypes.func.isRequired,
    protectedRivalries: PropTypes.array.isRequired,
    onAddRivalry: PropTypes.func.isRequired,
    onRemoveRivalry: PropTypes.func.isRequired,
    onUpdateRivalry: PropTypes.func.isRequired,
    divisions: PropTypes.array.isRequired,
    onToggleDivisions: PropTypes.func.isRequired,
    onUpdateDivision: PropTypes.func.isRequired,
    hasGamesPlayed: PropTypes.bool,
    onSaveConferenceRules: PropTypes.func,
};

export default ConferenceScheduleAdminTab;
