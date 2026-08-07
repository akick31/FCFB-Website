import React, { useEffect, useMemo, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import SelectPill from '../../components/ui/SelectPill';
import SegTabs from '../../components/ui/SegTabs';
import Toggle from '../../components/ui/Toggle';
import ConferenceRulesEditor from '../../components/scheduling/ConferenceRulesEditor';
import LogoUrlField from '../../components/admin/LogoUrlField';
import { getConferences, updateConference, setConferenceActive } from '../../api/conferenceApi';
import { getConferenceRules, saveConferenceRules } from '../../api/scheduleApi';
import { getAllTeams, updateTeam } from '../../api/teamApi';
import { isRealTeam } from '../../utils/teamDataUtils';
import { refreshConferences } from '../../components/constants/conferences';
import { goBackOr } from '../../utils/navigation';

const DEFAULT_CONFERENCE_GAMES = 9;

const searchSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', minWidth: 200 };
const backSx = { color: 'var(--brand)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block', mb: '14px' };
const rowSx = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', px: '16px', py: '10px', borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 0 } };
const addBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--field)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--field)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };
const removeBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--live)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--live)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };
const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem' };
const btnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };

const MAX_ADD_RESULTS = 20;

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
    const [search, setSearch] = useState('');
    const [addSearch, setAddSearch] = useState('');

    const [settingsForm, setSettingsForm] = useState(emptySettings);
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsError, setSettingsError] = useState(null);
    const [settingsSuccess, setSettingsSuccess] = useState(null);
    const [savingDivisions, setSavingDivisions] = useState(false);

    const [numConferenceGames, setNumConferenceGames] = useState(DEFAULT_CONFERENCE_GAMES);
    const [protectedRivalries, setProtectedRivalries] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [rulesLoading, setRulesLoading] = useState(false);

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

    useEffect(() => {
        const loadRules = async () => {
            setRulesLoading(true);
            try {
                const rules = await getConferenceRules(code);
                if (rules) {
                    setNumConferenceGames(rules.numConferenceGames || DEFAULT_CONFERENCE_GAMES);
                    setProtectedRivalries(rules.protectedRivalries || []);
                    setDivisions(rules.divisions || []);
                } else {
                    setNumConferenceGames(DEFAULT_CONFERENCE_GAMES);
                    setProtectedRivalries([]);
                    setDivisions([]);
                }
            } catch (err) {
                console.error('Error loading conference rules:', err);
                setNumConferenceGames(DEFAULT_CONFERENCE_GAMES);
                setProtectedRivalries([]);
                setDivisions([]);
            } finally {
                setRulesLoading(false);
            }
        };
        loadRules();
    }, [code]);

    const teamsInConference = useMemo(
        () => teams
            .filter((team) => team.conference === code)
            .filter((team) => team.name.toLowerCase().includes(search.trim().toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name)),
        [teams, code, search],
    );

    const divisionsEnabled = divisions.filter(Boolean).length > 0;

    const moveToOptions = useMemo(() => [
        { value: '', label: 'Move to...' },
        ...conferences
            .filter((c) => c.code !== code)
            .sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1))
            .map((c) => ({ value: c.code, label: `${c.label}${!c.active ? ' (inactive)' : ''}` })),
    ], [conferences, code]);

    const availableTeams = useMemo(() => {
        const query = addSearch.trim().toLowerCase();
        return teams
            .filter((team) => team.conference !== code && team.active && isRealTeam(team))
            .filter((team) => !query || team.name.toLowerCase().includes(query))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [teams, code, addSearch]);

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

    const addRivalry = () => {
        setProtectedRivalries([...protectedRivalries, { team1: '', team2: '', week: null }]);
    };

    const removeRivalry = async (index) => {
        const rivalry = protectedRivalries[index];
        const updated = protectedRivalries.filter((_, i) => i !== index);

        if (!rivalry.team1 && !rivalry.team2) {
            setProtectedRivalries(updated);
            return;
        }

        try {
            await saveConferenceRules(code, numConferenceGames, updated);
            setProtectedRivalries(updated);
        } catch (err) {
            console.error('Error removing rivalry:', err);
        }
    };

    const updateRivalry = (index, fieldName, value) => {
        const updated = [...protectedRivalries];
        updated[index] = { ...updated[index], [fieldName]: value };
        setProtectedRivalries(updated);
    };

    const toggleDivisions = async (enabled) => {
        const updated = enabled ? ['', ''] : [];

        if (!enabled && divisions.some(Boolean)) {
            setSettingsError(null);
            try {
                await saveConferenceRules(code, numConferenceGames, protectedRivalries, updated);
                setDivisions(updated);
                setSettingsSuccess('Divisions disabled');
            } catch (err) {
                setSettingsError(err.message || 'Failed to disable divisions');
            }
            return;
        }

        setDivisions(updated);
    };

    const updateDivision = (index, value) => {
        const updated = [...divisions];
        updated[index] = value;
        setDivisions(updated);
    };

    const saveDivisions = async () => {
        setSavingDivisions(true);
        setSettingsError(null);
        setSettingsSuccess(null);
        try {
            await saveConferenceRules(code, numConferenceGames, protectedRivalries, divisions);
            setSettingsSuccess('Divisions saved');
        } catch (err) {
            setSettingsError(err.message || 'Failed to save divisions');
        } finally {
            setSavingDivisions(false);
        }
    };

    const handleSaveRules = async (conferenceCode, numGames, rivalries, divisionList) => {
        await saveConferenceRules(conferenceCode, numGames, rivalries, divisionList);
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
                        <>
                            <Panel header="Conference settings" sx={{ mb: '16px' }}>
                                {settingsError && <Alert severity="error" sx={{ m: '16px 16px 0' }}>{settingsError}</Alert>}
                                {settingsSuccess && <Alert severity="success" sx={{ m: '16px 16px 0' }}>{settingsSuccess}</Alert>}
                                <Box component="form" onSubmit={handleSaveSettings} sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                                        <Box>
                                            <Box sx={labelSx}>Code</Box>
                                            <Box component="input" value={code} disabled sx={{ ...inputSx, opacity: 0.6 }} />
                                        </Box>
                                        <Box>
                                            <Box sx={labelSx}>Label</Box>
                                            <Box component="input" value={settingsForm.label} onChange={(e) => setSettingsForm((prev) => ({ ...prev, label: e.target.value }))} required sx={inputSx} />
                                        </Box>
                                        <Box>
                                            <Box sx={labelSx}>Abbreviation</Box>
                                            <Box component="input" value={settingsForm.abbreviation} onChange={(e) => setSettingsForm((prev) => ({ ...prev, abbreviation: e.target.value }))} placeholder="e.g. MWC" sx={inputSx} />
                                        </Box>
                                        <Box>
                                            <Box sx={labelSx}>Active</Box>
                                            <Toggle on={!!conference.active} onClick={handleToggleActive} />
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                                        <LogoUrlField label="Logo URL" value={settingsForm.logoUrl} onChange={(e) => setSettingsForm((prev) => ({ ...prev, logoUrl: e.target.value }))} previewBg="#ffffff" />
                                        <LogoUrlField label="Dark logo URL" value={settingsForm.logoUrlDark} onChange={(e) => setSettingsForm((prev) => ({ ...prev, logoUrlDark: e.target.value }))} previewBg="#0a1620" />
                                    </Box>
                                    <Box component="button" type="submit" disabled={savingSettings} sx={{ ...btnSx, justifySelf: 'start' }}>
                                        {savingSettings ? 'Saving...' : 'Save settings'}
                                    </Box>
                                </Box>
                            </Panel>

                            <Panel header="Divisions">
                                <Box sx={{ p: '16px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6px' }}>
                                        <Box sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{divisionsEnabled ? 'Enabled' : 'Disabled'}</Box>
                                        <Box component="button" type="button" onClick={() => toggleDivisions(!divisionsEnabled)} sx={ctrlSx}>
                                            {divisionsEnabled ? 'Disable divisions' : 'Enable divisions'}
                                        </Box>
                                    </Box>
                                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', mb: '12px' }}>
                                        Optional. A conference has exactly two divisions. When enabled, teams can be assigned to a
                                        division from the Teams tab, and division record is used when generating the schedule.
                                    </Box>

                                    {!divisionsEnabled ? (
                                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                            No divisions set. This conference schedules as one flat group.
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                            <Box component="input" value={divisions[0] || ''} onChange={(e) => updateDivision(0, e.target.value)} placeholder="Division 1 name" sx={{ ...inputSx, flex: '1 1 220px' }} />
                                            <Box component="input" value={divisions[1] || ''} onChange={(e) => updateDivision(1, e.target.value)} placeholder="Division 2 name" sx={{ ...inputSx, flex: '1 1 220px' }} />
                                            <Box component="button" type="button" onClick={saveDivisions} disabled={savingDivisions} sx={btnSx}>
                                                {savingDivisions ? 'Saving...' : 'Save divisions'}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            </Panel>
                        </>
                    )}

                    {tab === 'rules' && (
                        <Panel header={`Scheduling rules: ${conference.label}`}>
                            {rulesLoading ? (
                                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
                            ) : (
                                <Box sx={{ p: '16px' }}>
                                    <ConferenceRulesEditor
                                        conference={code}
                                        conferenceTeams={teamsInConference}
                                        numConferenceGames={numConferenceGames}
                                        protectedRivalries={protectedRivalries}
                                        divisions={divisions}
                                        onNumConferenceGamesChange={setNumConferenceGames}
                                        onAddRivalry={addRivalry}
                                        onRemoveRivalry={removeRivalry}
                                        onUpdateRivalry={updateRivalry}
                                        onSave={handleSaveRules}
                                        showDivisions={false}
                                    />
                                </Box>
                            )}
                        </Panel>
                    )}

                    {tab === 'teams' && (
                        <>
                            <Panel
                                header={`Teams in ${conference.label}`}
                                more={(
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Box component="input" placeholder="Search..." aria-label="Search teams in this conference" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ ...searchSx, minWidth: 160 }} />
                                        <span>{teamsInConference.length} teams</span>
                                    </Box>
                                )}
                                sx={{ mb: '16px' }}
                            >
                                {teamsInConference.length === 0 ? (
                                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No teams found.</Box>
                                ) : (
                                    <DataTable minWidth={680}>
                                        <thead>
                                            <tr>
                                                <th className="lft stick">Team</th>
                                                {divisionsEnabled && <th className="lft">Division</th>}
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teamsInConference.map((team) => (
                                                <tr key={team.name}>
                                                    <td className="lft stick">
                                                        <Box component={Link} to={`/team-details/${team.id}`} sx={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
                                                            <span className="nm">{team.name}</span>
                                                        </Box>
                                                    </td>
                                                    {divisionsEnabled && (
                                                        <td className="lft">
                                                            <SelectPill
                                                                value={team.division || ''}
                                                                onChange={(value) => updateTeamDivision(team, value)}
                                                                options={[{ value: '', label: 'No division' }, ...divisions.filter(Boolean).map((d) => ({ value: d, label: d }))]}
                                                                ariaLabel={`Division for ${team.name}`}
                                                                sx={{ height: '30px' }}
                                                            />
                                                        </td>
                                                    )}
                                                    <td>
                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                            <SelectPill
                                                                value=""
                                                                onChange={(value) => moveTeamToConference(team, value)}
                                                                options={moveToOptions}
                                                                ariaLabel={`Move ${team.name} to conference`}
                                                                sx={{ height: '30px' }}
                                                            />
                                                            <Box component="button" type="button" disabled={pendingTeam === team.name} onClick={() => removeFromConference(team)} sx={removeBtnSx}>
                                                                Remove
                                                            </Box>
                                                        </Box>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </DataTable>
                                )}
                            </Panel>

                            <Panel header="Add a team to this conference">
                                <Box sx={{ p: '16px', pb: 0 }}>
                                    <Box component="input" placeholder="Search teams..." aria-label="Search teams to add" value={addSearch} onChange={(e) => setAddSearch(e.target.value)} sx={{ ...searchSx, width: '100%' }} />
                                </Box>
                                {availableTeams.length === 0 ? (
                                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No matching teams.</Box>
                                ) : (
                                    <Box sx={{ py: '6px' }}>
                                        {availableTeams.slice(0, MAX_ADD_RESULTS).map((team) => (
                                            <Box key={team.name} sx={rowSx}>
                                                <Box>
                                                    <Box sx={{ fontWeight: 700 }}>{team.name}</Box>
                                                    <Box sx={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{team.conference ? conferences.find((c) => c.code === team.conference)?.label || team.conference : 'No conference'}</Box>
                                                </Box>
                                                <Box component="button" type="button" disabled={pendingTeam === team.name} onClick={() => addTeam(team)} sx={addBtnSx}>
                                                    + Add
                                                </Box>
                                            </Box>
                                        ))}
                                        {availableTeams.length > MAX_ADD_RESULTS && (
                                            <Box sx={{ px: '16px', py: '10px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                                                Showing {MAX_ADD_RESULTS} of {availableTeams.length} teams. Refine your search to see more.
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Panel>
                        </>
                    )}
                </>
            )}
        </AdminLayout>
    );
};

export default AdminConferenceDetail;
