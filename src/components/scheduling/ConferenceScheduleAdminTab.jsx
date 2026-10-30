import { formatConference } from '../../hooks/useConferencesMap';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import EditDialog from '../ui/EditDialog';
import ConferenceRulesEditor from './ConferenceRulesEditor';
import ConferenceScheduleGrid from './ConferenceScheduleGrid';
import ConferencePill from '../ui/ConferencePill';
import { primaryButtonSx, secondaryButtonSx } from '../../styles/controls';

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
    const [rulesOpen, setRulesOpen] = useState(false);

    return (
        <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', mb: '8px', alignItems: 'center' }}>
                <ConferencePill
                    label="Conference"
                    value={selectedConference}
                    onChange={onConferenceChange}
                    options={adminConferences.map((conf) => ({ value: conf.code, label: conf.label }))}
                    sx={{ height: '38px' }}
                />
                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>
                    {numConferenceGames} conference games, {TOTAL_WEEKS - numConferenceGames} OOC,{' '}
                    {protectedRivalries.filter((r) => r.team1 && r.team2).length} rivalries
                </Box>
                <Box component="button" type="button" onClick={() => setRulesOpen(true)} sx={secondaryButtonSx}>
                    Conference rules
                </Box>
                <Box sx={{ flex: 1 }} />
                <Box
                    component="button"
                    type="button"
                    onClick={onGenerateSchedule}
                    disabled={scheduleLocked || hasGamesPlayed}
                    title={
                        hasGamesPlayed
                            ? 'Cannot auto-generate: games have already been played this season'
                            : scheduleLocked
                              ? 'Schedule is locked'
                              : ''
                    }
                    sx={primaryButtonSx}
                >
                    Auto-generate schedule
                </Box>
                <Box
                    component="button"
                    type="button"
                    onClick={onAddGameManually}
                    disabled={scheduleLocked}
                    sx={secondaryButtonSx}
                >
                    + Add game
                </Box>
            </Box>

            <EditDialog
                open={rulesOpen}
                title={`Conference rules: ${formatConference(selectedConference)}`}
                onClose={() => setRulesOpen(false)}
                maxWidth="md"
            >
                <ConferenceRulesEditor
                    key={selectedConference}
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
            </EditDialog>

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
