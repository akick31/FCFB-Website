import React, { useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import SegTabs from '../../components/ui/SegTabs';
import ConferenceRulesEditor from '../../components/scheduling/ConferenceRulesEditor';
import ConferenceSettingsPanel from '../../components/admin/ConferenceSettingsPanel';
import ConferenceTeamsPanel from '../../components/admin/ConferenceTeamsPanel';
import { getConferences, updateConference, setConferenceActive } from '../../api/conferenceApi';
import { getAllTeams, updateTeam } from '../../api/teamApi';
import { refreshConferences } from '../../components/constants/conferences';
import { goBackOr } from '../../utils/navigation';
import useConferenceRules from '../../hooks/useConferenceRules';

const backSx = { color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block', mb: '14px' };

const emptySettings = { label: '', abbreviation: '', logoUrl: '', logoUrlDark: '' };

const AdminConferenceDetail = () => {
    const { code } = useParams();
    const navigate = useNavigate();
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

    const load = async () => {
        setLoading(true);
        try {
            const [confList, allTeams] = await Promise.all([getConferences(), getAllTeams()]);
            setConferences(confList);
            setTeams(allTeams);
        } catch (err) {
            setError('Failed to load conference data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [code]);

    const conference = conferences.find((c) => c.code === code);

    useEffect(() => {
        if (!conference) return;
        setSettingsForm({
            label: conference.label || '',
            abbreviation: conference.abbreviation || '',
            logoUrl: conference.logo_url || '',
            logoUrlDark: conference.logo_url_dark || '',
        });
    }, [conference]);

    const moveTeamToConference = async (team, newConference) => {
        if (!newConference) return;
        setError(null);
        setPendingTeam(team.name);
        try {
            await updateTeam({ ...team, conference: newConference });
            await load();
        } catch (err) {
            setError(err.message || `Failed to update ${team.name}`);
        } finally {
            setPendingTeam(null);
        }
    };

    const updateTeamDivision = async (team, newDivision) => {
        setError(null);
        setPendingTeam(team.name);
        try {
            await updateTeam({ ...team, division: newDivision || null });
            await load();
        } catch (err) {
            setError(err.message || `Failed to update ${team.name}`);
        } finally {
            setPendingTeam(null);
        }
    };

    const removeFromConference = async (team) => {
        setError(null);
        setPendingTeam(team.name);
        try {
            await updateTeam({ ...team, conference: null });
            await load();
        } catch (err) {
            setError(err.message || `Failed to remove ${team.name}`);
        } finally {
            setPendingTeam(null);
        }
    };

    const addTeam = async (team) => {
        setError(null);
        setPendingTeam(team.name);
        try {
            await updateTeam({ ...team, conference: code });
            await load();
        } catch (err) {
            setError(err.message || `Failed to add ${team.name}`);
        } finally {
            setPendingTeam(null);
        }
    };

    const handleSaveSettings = async (event) => {
        event.preventDefault();
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
            setSettingsSuccess('Conference settings saved');
            await load();
        } catch (err) {
            setSettingsError(err.message || 'Failed to save conference settings');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleToggleActive = async () => {
        if (!conference) return;
        setSettingsError(null);
        try {
            await setConferenceActive(conference.code, !conference.active);
            refreshConferences();
            await load();
        } catch (err) {
            setSettingsError(err.message || 'Failed to update conference');
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Conference">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={conference ? conference.label : code}>
            <Box component="button" type="button" onClick={() => goBackOr(navigate, '/admin/conferences')} sx={{ ...backSx, border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit', p: 0 }}>&larr; All conferences</Box>

            {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}

            {!conference && (
                <Alert severity="warning" sx={{ mb: '16px' }}>No conference found for code &quot;{code}&quot;.</Alert>
            )}

            {conference && (
                <>
                    <Box sx={{ mb: '16px' }}>
                        <SegTabs
                            value={tab}
                            onChange={setTab}
                            options={[
                                { value: 'settings', label: 'Settings' },
                                { value: 'teams', label: 'Teams' },
                                { value: 'rules', label: 'Scheduling Rules' },
                            ]}
                        />
                    </Box>

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
                        <Panel header={`Scheduling rules: ${conference.label}`}>
                            {rules.rulesLoading ? (
                                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
                            ) : (
                                <Box sx={{ p: '16px' }}>
                                    <ConferenceRulesEditor
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
            )}
        </AdminLayout>
    );
};

export default AdminConferenceDetail;
