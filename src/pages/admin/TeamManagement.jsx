import React, { useState, useEffect, useMemo } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import SelectPill from '../../components/ui/SelectPill';
import CreateTeamForm from '../../components/forms/CreateTeamForm';
import TeamsTable from '../../components/teamManagement/TeamsTable';
import HireCoachDialog from '../../components/teamManagement/HireCoachDialog';
import FirePickerDialog from '../../components/teamManagement/FirePickerDialog';
import FireConfirmDialog from '../../components/teamManagement/FireConfirmDialog';
import { getAllTeamsIncludingInactive } from '../../api/teamApi';
import { getAllUsers } from '../../api/userApi';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { useConferencesMap, allConferenceList } from '../../components/constants/conferences';
import { isRealTeam, getTeamCoaches } from '../../utils/teamDataUtils';
import { currentRosterByTeam } from '../../utils/coachHistory';
import useTeamActiveOverrides from '../../hooks/useTeamActiveOverrides';
import useCoachRosterActions from '../../hooks/useCoachRosterActions';

const searchSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', minWidth: 200 };
const pillHeightSx = { height: '38px', boxSizing: 'border-box' };
const createBtnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '14px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' };
const toggleChipSx = (on) => ({ display: 'inline-flex', alignItems: 'center', gap: '7px', border: '1px solid var(--line)', background: 'var(--surface)', borderRadius: 'var(--r-sm)', px: '11px', height: '38px', boxSizing: 'border-box', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: on ? 'var(--text)' : 'var(--text-muted)' });

const TAKEN_OPTIONS = [{ value: 'ALL', label: 'All teams' }, { value: 'OPEN', label: 'Open teams' }, { value: 'TAKEN', label: 'Taken teams' }];
const ACTIVE_OPTIONS = [{ value: 'ALL', label: 'Active + inactive' }, { value: 'ACTIVE', label: 'Active teams' }, { value: 'INACTIVE', label: 'Inactive teams' }];

const TeamManagement = ({ user }) => {
    useConferencesMap();
    const teamsMap = useTeamsMap();
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [roster, setRoster] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideFakeTeams, setHideFakeTeams] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [conferenceFilter, setConferenceFilter] = useState('ALL');
    const [takenFilter, setTakenFilter] = useState('ALL');
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [createTeamOpen, setCreateTeamOpen] = useState(false);

    const conferenceOptions = useMemo(
        () => [{ value: 'ALL', label: 'All conferences' }, ...allConferenceList().map((c) => ({ value: c.code, label: c.label }))],
        [],
    );

    const loadData = async () => {
        try {
            const [teamsResponse, usersResponse, transactions] = await Promise.all([
                getAllTeamsIncludingInactive(),
                getAllUsers(),
                getEntireCoachTransactionLog(),
            ]);
            setTeams(teamsResponse);
            setUsers(usersResponse);
            setRoster(currentRosterByTeam(transactions));
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const rosterFor = (team) => getTeamCoaches(team).map((coach) => ({
        ...coach,
        position: roster[team.name]?.[coach.username]?.position || 'HEAD_COACH',
    }));

    const { effectiveActive, activeOverrides, handleToggleActive, pendingActiveCount, savingActive, handleSaveActive } =
        useTeamActiveOverrides(teams, loadData, setError);

    const {
        hireDialogOpen, setHireDialogOpen,
        fireTarget, setFireTarget,
        firePickerTeam, setFirePickerTeam,
        selectedTeam,
        selectedUser, setSelectedUser,
        selectedPosition, setSelectedPosition,
        processing, dialogError,
        handleFireClick, handleHireCoach, handleHireSubmit, handleHireInterimSubmit, handleFireSubmit,
        selectFireFromPicker,
    } = useCoachRosterActions({ user, getRosterForTeam: rosterFor, onChanged: loadData });

    const filteredTeams = useMemo(() => {
        let filtered = teams;
        if (hideFakeTeams) filtered = filtered.filter(isRealTeam);
        if (conferenceFilter !== 'ALL') filtered = filtered.filter((team) => team.conference === conferenceFilter);
        if (takenFilter !== 'ALL') filtered = filtered.filter((team) => (takenFilter === 'TAKEN' ? team.is_taken : !team.is_taken));
        if (activeFilter !== 'ALL') {
            filtered = filtered.filter(isRealTeam);
            filtered = filtered.filter((team) => (activeFilter === 'ACTIVE' ? effectiveActive(team) : !effectiveActive(team)));
        }
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter((team) =>
                team.name?.toLowerCase().includes(searchLower) ||
                team.short_name?.toLowerCase().includes(searchLower) ||
                team.abbreviation?.toLowerCase().includes(searchLower) ||
                (team.coach_usernames || []).some((coach) => coach.toLowerCase().includes(searchLower)) ||
                (team.coach_discord_tags || []).some((tag) => tag.toLowerCase().includes(searchLower)));
        }
        return filtered;
    }, [teams, hideFakeTeams, conferenceFilter, takenFilter, activeFilter, activeOverrides, searchTerm]);

    const handleTeamCreated = () => loadData();

    if (loading) {
        return (
            <AdminLayout title="Team Management">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Team Management"
            controls={(
                <>
                    <Box component="input" placeholder="Search team, coach, or discord..." aria-label="Search teams" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} sx={searchSx} />
                    <SelectPill label="Conference" value={conferenceFilter} onChange={setConferenceFilter} options={conferenceOptions} sx={pillHeightSx} />
                    <SelectPill label="Status" value={takenFilter} onChange={setTakenFilter} options={TAKEN_OPTIONS} sx={pillHeightSx} />
                    <SelectPill label="Active" value={activeFilter} onChange={setActiveFilter} options={ACTIVE_OPTIONS} sx={pillHeightSx} />
                    <Box component="button" type="button" onClick={() => setHideFakeTeams((v) => !v)} sx={toggleChipSx(hideFakeTeams)}>
                        <Box component="span" sx={{ width: 14, height: 14, borderRadius: '3px', border: '1.5px solid', borderColor: hideFakeTeams ? 'var(--brand)' : 'var(--text-dim)', background: hideFakeTeams ? 'var(--brand)' : 'transparent' }} />
                        Hide fake teams
                    </Box>
                    <Box component="button" type="button" onClick={() => setCreateTeamOpen(true)} sx={createBtnSx}>+ Create team</Box>
                    <Box component="button" type="button" onClick={handleSaveActive} disabled={pendingActiveCount === 0 || savingActive} sx={{ ...createBtnSx, background: 'var(--field)', '&:disabled': { opacity: 0.5, cursor: 'default' } }}>
                        {savingActive ? 'Saving...' : pendingActiveCount > 0 ? `Save status changes (${pendingActiveCount})` : 'Save status changes'}
                    </Box>
                </>
            )}
        >
            {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}

            <Panel header="Teams" more={`${filteredTeams.length} teams`}>
                <TeamsTable
                    teams={filteredTeams}
                    teamsMap={teamsMap}
                    effectiveActive={effectiveActive}
                    rosterFor={rosterFor}
                    onToggleActive={handleToggleActive}
                    onFireCoach={(team, coach) => setFireTarget({ team, coach })}
                    onFireClick={handleFireClick}
                    onHireCoach={handleHireCoach}
                />
            </Panel>

            <CreateTeamForm open={createTeamOpen} onClose={() => setCreateTeamOpen(false)} onTeamCreated={handleTeamCreated} />

            <HireCoachDialog
                open={hireDialogOpen}
                teamName={selectedTeam?.name}
                users={users}
                selectedUser={selectedUser}
                onSelectedUserChange={setSelectedUser}
                selectedPosition={selectedPosition}
                onSelectedPositionChange={setSelectedPosition}
                processing={processing}
                dialogError={dialogError}
                onCancel={() => setHireDialogOpen(false)}
                onHireInterim={handleHireInterimSubmit}
                onHire={handleHireSubmit}
            />

            <FirePickerDialog
                team={firePickerTeam}
                roster={firePickerTeam ? rosterFor(firePickerTeam) : []}
                onCancel={() => setFirePickerTeam(null)}
                onSelectCoach={selectFireFromPicker}
            />

            <FireConfirmDialog
                target={fireTarget}
                processing={processing}
                dialogError={dialogError}
                onCancel={() => setFireTarget(null)}
                onConfirm={handleFireSubmit}
            />
        </AdminLayout>
    );
};

TeamManagement.propTypes = { user: PropTypes.object };

export default TeamManagement;
