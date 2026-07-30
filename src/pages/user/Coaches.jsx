import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '../../api/userApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { formatPosition, formatWinPct } from '../../utils/formatText';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import SelectPill from '../../components/ui/SelectPill';
import DataTable from '../../components/ui/DataTable';
import TeamMark from '../../components/ui/TeamMark';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';

const coachStatus = (user) => {
    if (user.position === 'RETIRED') return 'retired';
    return user.team ? 'active' : 'free_agent';
};

const STATUS_META = {
    active: { label: 'Active', color: 'var(--field)' },
    free_agent: { label: 'Free agent', color: 'var(--brand)' },
    retired: { label: 'Retired', color: 'var(--text-dim)' },
};

const SORTS = {
    name: (a, b) => (a.coach_name || a.username).localeCompare(b.coach_name || b.username),
    wins: (a, b) => (b.wins || 0) - (a.wins || 0),
    winpct: (a, b) => (b.win_percentage || 0) - (a.win_percentage || 0),
};

const StatusPill = ({ status }) => {
    const meta = STATUS_META[status];
    return (
        <Box component="span" sx={{ display: 'inline-flex', fontSize: '0.56rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: meta.color, border: `1px solid color-mix(in srgb, ${meta.color} 55%, var(--line))`, borderRadius: 'var(--r-sm)', px: '6px', py: '2px' }}>
            {meta.label}
        </Box>
    );
};

StatusPill.propTypes = { status: PropTypes.oneOf(['active', 'free_agent', 'retired']).isRequired };

const Coaches = () => {
    const navigate = useNavigate();
    const teamsMap = useTeamsMap();
    useSeo(ROUTE_META['/coaches']);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [position, setPosition] = useState('all');
    const [sort, setSort] = useState('name');

    useEffect(() => {
        getAllUsers()
            .then((data) => setUsers(data || []))
            .catch(() => setError('Failed to load coaches. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    const activeCount = useMemo(() => users.filter((user) => coachStatus(user) === 'active').length, [users]);

    const shown = useMemo(() => {
        const query = search.trim().toLowerCase();
        return users
            .filter((user) => status === 'all' || coachStatus(user) === status)
            .filter((user) => position === 'all' || user.position === position)
            .filter((user) => !query
                || (user.coach_name || '').toLowerCase().includes(query)
                || (user.username || '').toLowerCase().includes(query)
                || (user.discord_tag || '').toLowerCase().includes(query)
                || (user.team || '').toLowerCase().includes(query))
            .sort(SORTS[sort]);
    }, [users, status, position, search, sort]);

    if (loading) {
        return <PageWrap><Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box></PageWrap>;
    }
    if (error) {
        return <PageWrap><Alert severity="error">{error}</Alert></PageWrap>;
    }

    return (
        <PageWrap>
            <PageHeading eyebrow={`${users.length} coaches, ${activeCount} active`} title="Coaches">
                <Box
                    component="input"
                    placeholder="Search name, Discord tag, or team…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    sx={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', padding: '6px 10px', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, minWidth: 210, '&::placeholder': { color: 'var(--text-dim)', fontWeight: 400 } }}
                />
                <SelectPill
                    label="Status"
                    value={status}
                    onChange={setStatus}
                    options={[
                        { value: 'all', label: 'All' },
                        { value: 'active', label: 'Active' },
                        { value: 'free_agent', label: 'Free agent' },
                        { value: 'retired', label: 'Retired' },
                    ]}
                />
                <SelectPill
                    label="Position"
                    value={position}
                    onChange={setPosition}
                    options={[
                        { value: 'all', label: 'All positions' },
                        { value: 'HEAD_COACH', label: 'Head Coach' },
                        { value: 'OFFENSIVE_COORDINATOR', label: 'Offensive Coordinator' },
                        { value: 'DEFENSIVE_COORDINATOR', label: 'Defensive Coordinator' },
                    ]}
                />
                <SelectPill
                    label="Sort"
                    value={sort}
                    onChange={setSort}
                    options={[{ value: 'name', label: 'Name' }, { value: 'wins', label: 'Wins' }, { value: 'winpct', label: 'Win Pct' }]}
                />
            </PageHeading>

            <DataTable minWidth={720}>
                <thead>
                    <tr>
                        <th className="lft stick">Coach</th>
                        <th className="lft">Team</th>
                        <th className="lft">Position</th>
                        <th>Record</th>
                        <th>Win Pct</th>
                        <th className="lft">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {shown.map((user) => {
                        const teamId = user.team ? teamsMap[user.team]?.id : null;
                        return (
                            <tr key={user.id ?? user.username} onClick={() => navigate(`/user-details/${user.username}`)}>
                                <td className="lft stick">
                                    <Box sx={{ fontWeight: 700 }}>{user.coach_name || user.username}</Box>
                                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>@{user.username}</Box>
                                </td>
                                <td className="lft">
                                    {user.team ? (
                                        <Box
                                            className="teamcell"
                                            onClick={(event) => { if (teamId) { event.stopPropagation(); navigate(`/team-details/${teamId}`); } }}
                                            sx={{ cursor: teamId ? 'pointer' : 'default' }}
                                        >
                                            <TeamMark team={teamsMap[user.team]} size={22} />
                                            <span className="nm">{user.team}</span>
                                        </Box>
                                    ) : (
                                        <Box sx={{ color: 'var(--text-dim)' }}>—</Box>
                                    )}
                                </td>
                                <td className="lft">{formatPosition(user.position)}</td>
                                <td className="num">{user.wins || 0}-{user.losses || 0}</td>
                                <td className="num">{formatWinPct(user.win_percentage)}</td>
                                <td className="lft"><StatusPill status={coachStatus(user)} /></td>
                            </tr>
                        );
                    })}
                </tbody>
            </DataTable>
        </PageWrap>
    );
};

export default Coaches;
