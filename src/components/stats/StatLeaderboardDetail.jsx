import React, { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Panel from '../ui/Panel';
import DataTable from '../ui/DataTable';
import TeamMark from '../ui/TeamMark';
import ConferenceMark from '../ui/ConferenceMark';
import Pager from '../ui/Pager';
import { useTeamsMap, ensureTeam } from '../../hooks/useTeamsMap';

const PAGE_SIZE = 25;

const StatLeaderboardDetail = ({ stat, rows, onBack }) => {
    const teamsMap = useTeamsMap();
    const [page, setPage] = useState(0);
    const [teamQuery, setTeamQuery] = useState('');

    const ranked = useMemo(() => rows.map((row, index) => ({ ...row, rank: index + 1 })), [rows]);
    const filtered = useMemo(() => {
        const query = teamQuery.trim().toLowerCase();
        return query ? ranked.filter((row) => row.team.toLowerCase().includes(query)) : ranked;
    }, [ranked, teamQuery]);

    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const current = Math.min(page, pageCount - 1);
    const slice = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

    return (
        <>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box component="button" type="button" onClick={onBack} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, height: 38, px: 1.5, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                    <ArrowBack sx={{ fontSize: 15 }} /> All leaderboards
                </Box>
                <Box component="input" value={teamQuery} onChange={(event) => { setTeamQuery(event.target.value); setPage(0); }} placeholder="Search a team…" aria-label="Search a team"
                    sx={{ flex: 1, minWidth: 200, height: 38, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: 1.5, font: 'inherit', fontSize: '0.82rem', '&::placeholder': { color: 'var(--text-dim)' } }} />
            </Box>
            <Panel header={stat.label} more={`${filtered.length} team${filtered.length === 1 ? '' : 's'}${stat.ascending ? ' · lowest is best' : ''}`}>
                <DataTable minWidth={480}>
                    <thead>
                        <tr>
                            <th className="lft stick">Rk</th>
                            <th className="lft">Team</th>
                            <th style={{ textAlign: 'center' }}>Conference</th>
                            <th>{stat.label}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {slice.map((row) => {
                            ensureTeam(row.team);
                            const teamId = teamsMap[row.team]?.id;
                            return (
                                <Box
                                    component={teamId ? Link : 'tr'}
                                    to={teamId ? `/team-details/${teamId}` : undefined}
                                    key={row.team}
                                    sx={{ display: 'table-row', textDecoration: 'none', color: 'inherit', cursor: teamId ? 'pointer' : 'default' }}
                                >
                                    <td className="lft stick num">{row.rank}</td>
                                    <td className="lft">
                                        <div className="teamcell">
                                            <TeamMark team={teamsMap[row.team] || { name: row.team }} size={22} />
                                            <span className="nm">{row.team}</span>
                                        </div>
                                    </td>
                                    <td><Box sx={{ display: 'flex', justifyContent: 'center' }}><ConferenceMark conference={row.conference} /></Box></td>
                                    <td className="num">{stat.format ? stat.format(row[stat.key]) : row[stat.key]}</td>
                                </Box>
                            );
                        })}
                    </tbody>
                </DataTable>
            </Panel>
            <Pager page={current} pageCount={pageCount} onChange={setPage} />
        </>
    );
};

StatLeaderboardDetail.propTypes = {
    stat: PropTypes.object.isRequired,
    rows: PropTypes.array.isRequired,
    onBack: PropTypes.func.isRequired,
};

export default StatLeaderboardDetail;
