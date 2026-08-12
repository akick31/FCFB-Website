import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import DataTable from '../ui/DataTable';
import SelectPill from '../ui/SelectPill';
import { isRealTeam } from '../../utils/teamDataUtils';

const MAX_ADD_RESULTS = 20;

const searchSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', minWidth: 200 };
const rowSx = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', px: '16px', py: '10px', borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 0 } };
const addBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--field)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--field)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };
const removeBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--live)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--live)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };

const ConferenceTeamsPanel = ({
    code, conference, conferences, teams, divisions, divisionsEnabled, pendingTeam,
    onMoveTeam, onUpdateTeamDivision, onRemoveFromConference, onAddTeam,
}) => {
    const [search, setSearch] = useState('');
    const [addSearch, setAddSearch] = useState('');

    const teamsInConference = useMemo(
        () => teams
            .filter((team) => team.conference === code)
            .filter((team) => team.name.toLowerCase().includes(search.trim().toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name)),
        [teams, code, search],
    );

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

    return (
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
                                                onChange={(value) => onUpdateTeamDivision(team, value)}
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
                                                onChange={(value) => onMoveTeam(team, value)}
                                                options={moveToOptions}
                                                ariaLabel={`Move ${team.name} to conference`}
                                                sx={{ height: '30px' }}
                                            />
                                            <Box component="button" type="button" disabled={pendingTeam === team.name} onClick={() => onRemoveFromConference(team)} sx={removeBtnSx}>
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
                                <Box component="button" type="button" disabled={pendingTeam === team.name} onClick={() => onAddTeam(team)} sx={addBtnSx}>
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
