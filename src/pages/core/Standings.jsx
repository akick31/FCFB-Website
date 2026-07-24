import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import ConferenceTabs from '../../components/team/ConferenceTabs';
import DataTable from '../../components/ui/DataTable';
import TeamMark from '../../components/ui/TeamMark';
import { getAllTeams } from '../../api/teamApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { CONFERENCE_ORDER, conferenceLabel, conferenceLogo } from '../../components/constants/conferences';
import { formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';
import { useOffseasonStatus } from '../../components/game/scoreboard/hooks/useOffseasonStatus';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';

const ZEROED_RECORD_FIELDS = ['current_wins', 'current_losses', 'current_conference_wins', 'current_conference_losses'];

const confWinPct = (team) => {
    const wins = team.current_conference_wins || 0;
    const losses = team.current_conference_losses || 0;
    return wins + losses > 0 ? wins / (wins + losses) : 0;
};

const Standings = () => {
    useSeo(ROUTE_META['/standings']);

    const { conference: confParam } = useParams();
    const navigate = useNavigate();
    const teamsMap = useTeamsMap();
    const { isOffseason, loading: offseasonLoading } = useOffseasonStatus();

    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (offseasonLoading) return;
        setLoading(true);
        getAllTeams()
            .then((data) => {
                const normalized = isOffseason
                    ? data.map((team) => ({ ...team, ...Object.fromEntries(ZEROED_RECORD_FIELDS.map((field) => [field, 0])) }))
                    : data;
                setTeams(normalized);
            })
            .catch(() => setError('Failed to load standings data. Please try again.'))
            .finally(() => setLoading(false));
    }, [offseasonLoading, isOffseason]);

    const availableConferences = useMemo(() => {
        const present = new Set(teams.map((team) => team.conference));
        return CONFERENCE_ORDER.filter((conf) => present.has(conf));
    }, [teams]);

    const selectedConference = confParam?.toUpperCase() || availableConferences[0];

    useEffect(() => {
        if (loading || availableConferences.length === 0) return;
        if (!confParam || !availableConferences.includes(confParam.toUpperCase())) {
            navigate(`/standings/${availableConferences[0].toLowerCase()}`, { replace: true });
        }
    }, [confParam, availableConferences, loading, navigate]);

    const rows = useMemo(() => teams
        .filter((team) => team.conference === selectedConference)
        .sort((a, b) => confWinPct(b) - confWinPct(a) || a.name.localeCompare(b.name)),
    [teams, selectedConference]);

    if (loading) {
        return (
            <PageWrap>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
            </PageWrap>
        );
    }

    if (error) {
        return <PageWrap><Alert severity="error">{error}</Alert></PageWrap>;
    }

    const confLogo = conferenceLogo(selectedConference);

    return (
        <PageWrap>
            <PageHeading
                eyebrow={conferenceLabel(selectedConference)}
                title="Standings"
                leading={confLogo ? <TeamMark team={{ logo: confLogo, name: selectedConference }} size={42} /> : null}
            />

            <Box sx={{ mb: '16px' }}>
                <ConferenceTabs
                    conferences={availableConferences}
                    value={selectedConference}
                    onChange={(conf) => navigate(`/standings/${conf.toLowerCase()}`)}
                />
            </Box>

            <DataTable minWidth={640}>
                <thead>
                    <tr>
                        <th className="lft stick">Team</th>
                        <th>Overall</th>
                        <th>Conf</th>
                        <th>ELO</th>
                        <th className="lft">Offense</th>
                        <th className="lft">Defense</th>
                        <th>Coach</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((team, index) => {
                        const mark = teamsMap[team.name] || { name: team.name, abbreviation: team.abbreviation, logo: team.logo };
                        const coach = team.coach_usernames?.[0];
                        return (
                            <tr key={team.id} onClick={() => navigate(`/team-details/${team.id}`)}>
                                <td className="lft stick">
                                    <div className="teamcell">
                                        <span className="rk">{index + 1}</span>
                                        <TeamMark team={mark} size={22} />
                                        <span className="nm">{team.name}</span>
                                    </div>
                                </td>
                                <td className="num">{team.current_wins || 0}-{team.current_losses || 0}</td>
                                <td className="num">{team.current_conference_wins || 0}-{team.current_conference_losses || 0}</td>
                                <td className="num">{team.current_elo != null ? Math.round(team.current_elo) : '-'}</td>
                                <td className="lft" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{formatOffensivePlaybook(team.offensive_playbook)}</td>
                                <td className="lft" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{formatDefensivePlaybook(team.defensive_playbook)}</td>
                                <td>
                                    {coach ? (
                                        <Box
                                            component="span"
                                            onClick={(event) => { event.stopPropagation(); navigate(`/user-details/${coach}`); }}
                                            sx={{ color: 'var(--brand)', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            @{coach}
                                        </Box>
                                    ) : '-'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </DataTable>
        </PageWrap>
    );
};

export default Standings;
