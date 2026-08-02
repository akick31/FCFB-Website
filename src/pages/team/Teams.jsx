import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllTeams } from '../../api/teamApi';
import { isRealTeam, isTeamAvailable } from '../../utils/teamDataUtils';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { useColorMode } from '../../theme/ColorModeContext';
import { pickTeamColor } from '../../utils/teamColor';
import { useConferencesMap, activeConferenceCodes, conferenceLabel } from '../../components/constants/conferences';
import { formatConference } from '../../utils/formatText';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import SelectPill from '../../components/ui/SelectPill';
import TeamMark from '../../components/ui/TeamMark';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';

const SORTS = { elo: (a, b) => (b.current_elo || 0) - (a.current_elo || 0), wins: (a, b) => (b.current_wins || 0) - (a.current_wins || 0), name: (a, b) => a.name.localeCompare(b.name) };

const Teams = () => {
    const navigate = useNavigate();
    const { conference: confParam, availability: availParam } = useParams();
    useSeo(ROUTE_META['/teams']);
    const teamsMap = useTeamsMap();
    const conferencesMap = useConferencesMap();
    const { mode } = useColorMode();

    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [conference, setConference] = useState(confParam?.toUpperCase() || 'ALL');
    const [availability, setAvailability] = useState(availParam?.toLowerCase() || 'all');
    const [sort, setSort] = useState('name');

    useEffect(() => {
        getAllTeams()
            .then((data) => setTeams(data.filter((team) => team.active && isRealTeam(team))))
            .catch(() => setError('Failed to load teams. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    const availableConferences = useMemo(() => {
        const present = new Set(teams.map((team) => team.conference));
        return activeConferenceCodes().filter((conf) => present.has(conf));
    }, [teams, conferencesMap]);

    const shown = useMemo(() => {
        const query = search.trim().toLowerCase();
        return teams
            .filter((team) => conference === 'ALL' || team.conference === conference)
            .filter((team) => availability === 'all' || (availability === 'open' ? isTeamAvailable(team) : !isTeamAvailable(team)))
            .filter((team) => !query
                || team.name.toLowerCase().includes(query)
                || (team.coach_usernames || []).some((coach) => coach.toLowerCase().includes(query))
                || (team.coach_discord_tags || []).some((tag) => tag.toLowerCase().includes(query)))
            .sort(SORTS[sort]);
    }, [teams, conference, availability, search, sort]);

    const openCount = useMemo(() => teams.filter((team) => !(team.coach_usernames && team.coach_usernames.length)).length, [teams]);

    if (loading) {
        return <PageWrap><Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box></PageWrap>;
    }
    if (error) {
        return <PageWrap><Alert severity="error">{error}</Alert></PageWrap>;
    }

    return (
        <PageWrap>
            <PageHeading eyebrow={`${teams.length} programs, ${openCount} open`} title="Teams">
                <Box
                    component="input"
                    placeholder="Search teams, coaches, or Discord tags…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    sx={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', padding: '6px 10px', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, minWidth: 210, '&::placeholder': { color: 'var(--text-dim)', fontWeight: 400 } }}
                />
                <SelectPill
                    label="Conference"
                    value={conference}
                    onChange={setConference}
                    options={[{ value: 'ALL', label: 'All conferences' }, ...availableConferences.map((conf) => ({ value: conf, label: conferenceLabel(conf) }))]}
                />
                <SelectPill
                    label="Availability"
                    value={availability}
                    onChange={setAvailability}
                    options={[{ value: 'all', label: 'All teams' }, { value: 'open', label: 'Open' }, { value: 'taken', label: 'Taken' }]}
                />
                <SelectPill
                    label="Sort"
                    value={sort}
                    onChange={setSort}
                    options={[{ value: 'elo', label: 'ELO' }, { value: 'wins', label: 'Wins' }, { value: 'name', label: 'Name' }]}
                />
            </PageHeading>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
                {shown.map((team) => {
                    const teamMark = teamsMap[team.name] || { name: team.name, abbreviation: team.abbreviation, logo: team.logo };
                    return (
                        <Box
                            key={team.id}
                            onClick={() => navigate(`/team-details/${team.id}`)}
                            sx={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', p: '13px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', position: 'relative', overflow: 'hidden', transition: 'transform .14s, border-color .14s', '&:hover': { transform: 'translateY(-2px)', borderColor: 'color-mix(in srgb, var(--brand) 50%, var(--line))' } }}
                        >
                            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: pickTeamColor(teamMark, mode) }} />
                            <TeamMark team={teamMark} size={38} />
                            <Box sx={{ minWidth: 0 }}>
                                <Box sx={{ fontWeight: 800, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</Box>
                                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 600 }}>{formatConference(team.conference)}</Box>
                                <Box sx={{ color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 700, mt: '2px' }}>
                                    {team.current_wins || 0}-{team.current_losses || 0}, ELO {team.current_elo != null ? Math.round(team.current_elo) : '-'}
                                </Box>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </PageWrap>
    );
};

export default Teams;
