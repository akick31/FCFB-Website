import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import ConferenceTabs from '../../components/team/ConferenceTabs';
import DataTable from '../../components/ui/DataTable';
import TeamMark from '../../components/ui/TeamMark';
import { getAllTeams } from '../../api/teamApi';
import { getLatestCompletedSeason } from '../../api/seasonApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { activeConferenceCodes, conferenceLabel, conferenceLogo } from '../../components/constants/conferences';
import { formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';
import { useOffseasonStatus } from '../../components/game/scoreboard/hooks/useOffseasonStatus';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';

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
    const { isOffseason } = useOffseasonStatus();

    const [teams, setTeams] = useState([]);
    const [finalSeason, setFinalSeason] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        Promise.all([getAllTeams(), getLatestCompletedSeason().catch(() => null)])
            .then(([data, latest]) => {
                setTeams(data);
                setFinalSeason(latest?.season_number ?? latest?.seasonNumber ?? null);
            })
            .catch(() => setError('Failed to load standings data. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    const availableConferences = useMemo(() => {
        const present = new Set(teams.map((team) => team.conference));
        return activeConferenceCodes().filter((conf) => present.has(conf));
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
            >
                {isOffseason && finalSeason != null && (
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid color-mix(in srgb, var(--gold) 45%, var(--line))', color: 'var(--gold)', borderRadius: 'var(--r-sm)', px: '10px', py: '6px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Season {finalSeason} final
                    </Box>
                )}
            </PageHeading>

            <Box sx={{ mb: '16px' }}>
                <ConferenceTabs
                    conferences={availableConferences}
                    value={selectedConference}
                    onChange={(conf) => navigate(`/standings/${conf.toLowerCase()}`)}
                />
            </Box>

            <DataTable minWidth={860} tableLayout="fixed">
                <thead>
                    <tr>
                        <th className="lft stick" style={{ width: 280 }}>Team</th>
                        <th>Overall</th>
                        <th>Conf</th>
                        <th>ELO</th>
                        <th className="lft">Offense</th>
                        <th className="lft">Defense</th>
                        <th className="lft">Coach</th>
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
                                <td className="lft">
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
