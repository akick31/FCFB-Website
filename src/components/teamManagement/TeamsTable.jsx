import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import DataTable from '../ui/DataTable';
import TeamMark from '../ui/TeamMark';
import ConferenceMark from '../ui/ConferenceMark';
import Toggle from '../ui/Toggle';
import { toEntry } from '../../hooks/useTeamsMap';
import { isRealTeam } from '../../utils/teamDataUtils';

const pillSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', px: '8px', py: '3px', borderRadius: 'var(--r-sm)', lineHeight: 1 };
const coachChipSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', border: '1px solid var(--line)', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', px: '7px', py: '3px', fontSize: '0.72rem', mr: '5px', mb: '4px' };
const fireXSx = { border: 0, background: 'transparent', color: 'var(--live)', cursor: 'pointer', font: 'inherit', fontSize: '0.85rem', lineHeight: 1, p: 0, ml: '2px' };
const editBtnSx = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const hireBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--field)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--field)' } };
const fireBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--live)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--live)' } };

const statusInfo = (team, active) => {
    if (!active) return { label: 'Inactive', color: 'var(--live)' };
    if (team.is_taken) return { label: 'Taken', color: 'var(--gold)' };
    return { label: 'Open', color: 'var(--field)' };
};

const TeamsTable = ({ teams, teamsMap, effectiveActive, rosterFor, onToggleActive, onFireCoach, onFireClick, onHireCoach }) => (
    <DataTable minWidth={760}>
        <thead>
            <tr>
                <th className="lft stick">Team</th>
                <th className="lft">Conference</th>
                <th className="lft">Coaches</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Active</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            {teams.map((team) => {
                const status = statusInfo(team, effectiveActive(team));
                const roster = rosterFor(team);
                return (
                    <tr key={team.name}>
                        <td className="lft stick">
                            <Box className="teamcell">
                                <TeamMark team={teamsMap[team.name] || toEntry(team)} size={22} />
                                <span className="nm">{team.name}</span>
                            </Box>
                        </td>
                        <td className="lft"><ConferenceMark conference={team.conference} size={20} /></td>
                        <td className="lft" style={{ whiteSpace: 'normal', maxWidth: 220 }}>
                            {roster.length === 0 ? (
                                <Box component="span" sx={{ color: 'var(--text-dim)' }}>Vacant</Box>
                            ) : (
                                roster.map((coach) => (
                                    <Box key={coach.username} component="span" sx={coachChipSx}>
                                        {coach.name}
                                        <Box component="button" type="button" title={`Fire ${coach.name}`} onClick={() => onFireCoach(team, coach)} sx={fireXSx}>&times;</Box>
                                    </Box>
                                ))
                            )}
                        </td>
                        <td>
                            <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: status.color }}>{status.label}</Box>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Toggle on={effectiveActive(team)} onClick={() => onToggleActive(team)} disabled={!isRealTeam(team)} />
                            </Box>
                        </td>
                        <td style={{ whiteSpace: 'normal' }}>
                            <Box sx={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                {roster.length > 0 && (
                                    <Box component="button" type="button" onClick={() => onFireClick(team)} sx={{ ...fireBtnSx, px: '8px' }}>Fire</Box>
                                )}
                                {roster.length < 2 && (
                                    <Box component="button" type="button" onClick={() => onHireCoach(team)} sx={{ ...hireBtnSx, px: '8px' }}>+ Hire</Box>
                                )}
                                <Box component={Link} to={`/admin/edit-team/${team.id}`} sx={{ ...editBtnSx, px: '8px' }}>Edit</Box>
                            </Box>
                        </td>
                    </tr>
                );
            })}
        </tbody>
    </DataTable>
);

TeamsTable.propTypes = {
    teams: PropTypes.array.isRequired,
    teamsMap: PropTypes.object.isRequired,
    effectiveActive: PropTypes.func.isRequired,
    rosterFor: PropTypes.func.isRequired,
    onToggleActive: PropTypes.func.isRequired,
    onFireCoach: PropTypes.func.isRequired,
    onFireClick: PropTypes.func.isRequired,
    onHireCoach: PropTypes.func.isRequired,
};

export default TeamsTable;
