import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import DataTable from '../ui/DataTable';
import SelectPill from '../ui/SelectPill';
import TeamName from '../ui/TeamName';
import TeamSelect from '../ui/TeamSelect';
import { isRealTeam } from '../../utils/teamDataUtils';

const searchSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    px: '12px',
    height: '38px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.82rem',
    minWidth: 200,
};
const addBtnSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--field)',
    borderRadius: 'var(--r-sm)',
    px: '10px',
    height: '30px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.72rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:hover': { borderColor: 'var(--field)' },
    '&:disabled': { opacity: 0.6, cursor: 'default' },
};
const removeBtnSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--live)',
    borderRadius: 'var(--r-sm)',
    px: '10px',
    height: '30px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.72rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:hover': { borderColor: 'var(--live)' },
    '&:disabled': { opacity: 0.6, cursor: 'default' },
};

const ConferenceTeamsPanel = ({
    code,
    conference,
    conferences,
    teams,
    divisions,
    divisionsEnabled,
    pendingTeam,
    onMoveTeam,
    onUpdateTeamDivision,
    onRemoveFromConference,
    onAddTeam,
}) => {
    const [search, setSearch] = useState('');
    const [toAdd, setToAdd] = useState('');

    const teamsInConference = useMemo(
        () =>
            teams
                .filter((team) => team.conference === code)
                .filter((team) => team.name.toLowerCase().includes(search.trim().toLowerCase()))
                .sort((a, b) => a.name.localeCompare(b.name)),
        [teams, code, search]
    );

    const moveToOptions = useMemo(
        () => [
            { value: '', label: 'Move to...' },
            ...conferences
                .filter((c) => c.code !== code)
                .sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1))
                .map((c) => ({ value: c.code, label: `${c.label}${!c.active ? ' (inactive)' : ''}` })),
        ],
        [conferences, code]
    );

    const availableTeams = useMemo(
        () =>
            teams
                .filter((team) => team.conference !== code && team.active && isRealTeam(team))
                .sort((a, b) => a.name.localeCompare(b.name)),
        [teams, code]
    );

    const conferenceOf = (name) => {
        const current = teams.find((team) => team.name === name)?.conference;
        return current ? conferences.find((c) => c.code === current)?.label || current : 'No conference';
    };

    return (
        <>
            <Panel
                header={`Teams in ${conference.label}`}
                more={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Box
                            component="input"
                            placeholder="Search..."
                            aria-label="Search teams in this conference"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ ...searchSx, minWidth: 160 }}
                        />
                        <span>{teamsInConference.length} teams</span>
                    </Box>
                }
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
                                        <Box
                                            component={Link}
                                            to={`/team-details/${team.id}`}
                                            sx={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                                        >
                                            <TeamName name={team.name} size={20} sx={{ fontWeight: 700 }} />
                                        </Box>
                                    </td>
                                    {divisionsEnabled && (
                                        <td className="lft">
                                            <SelectPill
                                                value={team.division || ''}
                                                onChange={(value) => onUpdateTeamDivision(team, value)}
                                                options={[
                                                    { value: '', label: 'No division' },
                                                    ...divisions.filter(Boolean).map((d) => ({ value: d, label: d })),
                                                ]}
                                                ariaLabel={`Division for ${team.name}`}
                                                sx={{ height: '30px' }}
                                            />
                                        </td>
                                    )}
                                    <td>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <SelectPill
                                                value=""
                                                onChange={(value) => onMoveTeam(team, value)}
                                                options={moveToOptions}
                                                ariaLabel={`Move ${team.name} to conference`}
                                                sx={{ height: '30px' }}
                                            />
                                            <Box
                                                component="button"
                                                type="button"
                                                disabled={pendingTeam === team.name}
                                                onClick={() => onRemoveFromConference(team)}
                                                sx={removeBtnSx}
                                            >
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
                <Box sx={{ p: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 260px', minWidth: 0 }}>
                        <TeamSelect
                            value={toAdd}
                            onChange={setToAdd}
                            teams={availableTeams.map((team) => team.name)}
                            ariaLabel="Team to add"
                            placeholder="Search teams to add"
                            detailOf={conferenceOf}
                        />
                    </Box>
                    <Box
                        component="button"
                        type="button"
                        disabled={!toAdd || pendingTeam === toAdd}
                        onClick={() => {
                            onAddTeam(teams.find((team) => team.name === toAdd));
                            setToAdd('');
                        }}
                        sx={addBtnSx}
                    >
                        + Add
                    </Box>
                </Box>
            </Panel>
        </>
    );
};

ConferenceTeamsPanel.propTypes = {
    code: PropTypes.string.isRequired,
    conference: PropTypes.object.isRequired,
    conferences: PropTypes.array.isRequired,
    teams: PropTypes.array.isRequired,
    divisions: PropTypes.array.isRequired,
    divisionsEnabled: PropTypes.bool.isRequired,
    pendingTeam: PropTypes.string,
    onMoveTeam: PropTypes.func.isRequired,
    onUpdateTeamDivision: PropTypes.func.isRequired,
    onRemoveFromConference: PropTypes.func.isRequired,
    onAddTeam: PropTypes.func.isRequired,
};

export default ConferenceTeamsPanel;
