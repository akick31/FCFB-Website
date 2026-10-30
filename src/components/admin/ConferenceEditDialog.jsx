import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import EditDialog from '../ui/EditDialog';
import Panel from '../ui/Panel';
import SegTabs from '../ui/SegTabs';
import ConferenceRulesEditor from '../scheduling/ConferenceRulesEditor';
import ConferenceSettingsPanel from './ConferenceSettingsPanel';
import ConferenceTeamsPanel from './ConferenceTeamsPanel';
import { getConferences, updateConference, setConferenceActive } from '../../api/conferenceApi';
import { getAllTeams, updateTeam } from '../../api/teamApi';
import { refreshConferences } from '../../hooks/useConferencesMap';
import useConferenceRules from '../../hooks/useConferenceRules';

const emptySettings = { label: '', abbreviation: '', logoUrl: '', logoUrlDark: '' };

const ConferenceEditDialog = ({ code, open, onClose }) => {
    const [tab, setTab] = useState('settings');
    const [conferences, setConferences] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingTeam, setPendingTeam] = useState(null);

    const [settingsForm, setSettingsForm] = useState(emptySettings);
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsError, setSettingsError] = useState(null);
    const [settingsSuccess, setSettingsSuccess] = useState(null);

    const rules = useConferenceRules({ code, onError: setSettingsError, onSuccess: setSettingsSuccess });

    const scopeRef = useRef(null);

    const load = useCallback(async (scope) => {
        if (!scope.active) {
            return;
        }
        const request = {};
        scope.request = request;
        setError(null);
        setLoading(true);
        try {
            const [confList, allTeams] = await Promise.all([getConferences(), getAllTeams()]);
            if (!scope.active || scope.request !== request) {
                return;
            }
            setConferences(confList);
            setTeams(allTeams);
        } catch {
            if (scope.active && scope.request === request) {
                setError('Failed to load conference data');
            }
        } finally {
            if (scope.active && scope.request === request) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        setPendingTeam(null);
        setSavingSettings(false);
        setSettingsError(null);
        setSettingsSuccess(null);
        load(scope);
        return () => {
            scope.active = false;
        };
    }, [code, load]);

    const conference = conferences.find((c) => c.code === code);

    useEffect(() => {
        if (!conference) {
            return;
        }
        setSettingsForm({
            label: conference.label || '',
            abbreviation: conference.abbreviation || '',
            logoUrl: conference.logo_url || '',
            logoUrlDark: conference.logo_url_dark || '',
        });
    }, [conference]);

    const saveTeamChange = async (team, changes, failureMessage) => {
        const scope = scopeRef.current;
        setError(null);
        setPendingTeam(team.name);
        try {
            await updateTeam({ ...team, ...changes });
            await load(scope);
        } catch (err) {
            if (scope.active) {
                setError(err.message || failureMessage);
            }
        } finally {
            if (scope.active) {
                setPendingTeam((pending) => (pending === team.name ? null : pending));
            }
        }
    };

    const moveTeamToConference = (team, newConference) => {
        if (!newConference) {
            return;
        }
        return saveTeamChange(team, { conference: newConference }, `Failed to update ${team.name}`);
    };

    const updateTeamDivision = (team, newDivision) =>
        saveTeamChange(team, { division: newDivision || null }, `Failed to update ${team.name}`);

    const removeFromConference = (team) => saveTeamChange(team, { conference: null }, `Failed to remove ${team.name}`);

    const addTeam = (team) => saveTeamChange(team, { conference: code }, `Failed to add ${team.name}`);

    const handleSaveSettings = async (event) => {
        event.preventDefault();
        const scope = scopeRef.current;
        setSavingSettings(true);
        setSettingsError(null);
        setSettingsSuccess(null);
        try {
            await updateConference(code, {
                code,
                label: settingsForm.label.trim(),
                logoUrl: settingsForm.logoUrl.trim() || null,
                logoUrlDark: settingsForm.logoUrlDark.trim() || null,
                abbreviation: settingsForm.abbreviation.trim() || null,
            });
            refreshConferences();
            if (!scope.active) {
                return;
            }
            setSettingsSuccess('Conference settings saved');
            await load(scope);
        } catch (err) {
            if (scope.active) {
                setSettingsError(err.message || 'Failed to save conference settings');
            }
        } finally {
            if (scope.active) {
                setSavingSettings(false);
            }
        }
    };

    const handleToggleActive = async () => {
        if (!conference) {
            return;
        }
        const scope = scopeRef.current;
        setSettingsError(null);
        try {
            await setConferenceActive(conference.code, !conference.active);
            refreshConferences();
            await load(scope);
        } catch (err) {
            if (scope.active) {
                setSettingsError(err.message || 'Failed to update conference');
            }
        }
    };

    const editor = conference && (
        <>
            <SegTabs
                value={tab}
                onChange={setTab}
                options={[
                    { value: 'settings', label: 'Settings' },
                    { value: 'teams', label: 'Teams' },
                    { value: 'rules', label: 'Scheduling Rules' },
                ]}
            />

            {tab === 'settings' && (
                <ConferenceSettingsPanel
                    code={code}
                    conference={conference}
                    settingsForm={settingsForm}
                    onFieldChange={(field, value) => setSettingsForm((prev) => ({ ...prev, [field]: value }))}
                    savingSettings={savingSettings}
                    settingsError={settingsError}
                    settingsSuccess={settingsSuccess}
                    onToggleActive={handleToggleActive}
                    onSubmit={handleSaveSettings}
                    divisionsEnabled={rules.divisionsEnabled}
                    divisions={rules.divisions}
                    savingDivisions={rules.savingDivisions}
                    onToggleDivisions={rules.toggleDivisions}
                    onUpdateDivision={rules.updateDivision}
                    onSaveDivisions={rules.saveDivisions}
                />
            )}

            {tab === 'rules' && (
                <Panel header="Scheduling rules">
                    {rules.rulesLoading ? (
                        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{ p: '16px' }}>
                            <ConferenceRulesEditor
                                key={code}
                                conference={code}
                                conferenceTeams={teams.filter((team) => team.conference === code)}
                                numConferenceGames={rules.numConferenceGames}
                                protectedRivalries={rules.protectedRivalries}
                                divisions={rules.divisions}
                                onNumConferenceGamesChange={rules.setNumConferenceGames}
                                onAddRivalry={rules.addRivalry}
                                onRemoveRivalry={rules.removeRivalry}
                                onUpdateRivalry={rules.updateRivalry}
                                onSave={rules.handleSaveRules}
                                showDivisions={false}
                            />
                        </Box>
                    )}
                </Panel>
            )}

            {tab === 'teams' && (
                <ConferenceTeamsPanel
                    code={code}
                    conference={conference}
                    conferences={conferences}
                    teams={teams}
                    divisions={rules.divisions}
                    divisionsEnabled={rules.divisionsEnabled}
                    pendingTeam={pendingTeam}
                    onMoveTeam={moveTeamToConference}
                    onUpdateTeamDivision={updateTeamDivision}
                    onRemoveFromConference={removeFromConference}
                    onAddTeam={addTeam}
                />
            )}
        </>
    );

    return (
        <EditDialog open={open} onClose={onClose} title={conference ? conference.label : code} maxWidth="lg">
            {error && <Alert severity="error">{error}</Alert>}
            {loading ? (
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                editor || <Alert severity="warning">No conference found for code &quot;{code}&quot;.</Alert>
            )}
        </EditDialog>
    );
};

ConferenceEditDialog.propTypes = {
    code: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ConferenceEditDialog;
