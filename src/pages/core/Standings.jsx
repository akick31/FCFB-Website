import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import ConferenceTabs from '../../components/team/ConferenceTabs';
import SelectPill from '../../components/ui/SelectPill';
import DataTable from '../../components/ui/DataTable';
import TeamMark from '../../components/ui/TeamMark';
import { getAllTeams } from '../../api/teamApi';
import { getLatestCompletedSeason, getCurrentSeasonOrLatest, getAllSeasons } from '../../api/seasonApi';
import { getScheduleBySeason } from '../../api/scheduleApi';
import { getEloHistory } from '../../api/eloHistoryApi.jsx';
import { getFilteredSeasonStats } from '../../api/seasonStatsApi';
import { getFilteredGames } from '../../api/gameApi';
import { getTeamSeasonConference } from '../../api/teamSeasonConferenceApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { useConferencesMap, activeConferenceCodes, allConferenceList, conferenceLabel, conferenceLogo } from '../../components/constants/conferences';
import { formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';
import { useOffseasonStatus } from '../../components/game/scoreboard/hooks/useOffseasonStatus';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';

const confPct = (row) => (row.confWins + row.confLosses > 0 ? row.confWins / (row.confWins + row.confLosses) : 0);

const buildHistoricalData = (conferenceMap, scheduleRows, eloRows, seasonStatsRows, gameRows) => {
    const recordByTeam = {};
    (scheduleRows || []).forEach((game) => {
        if (!game.finished || game.home_score == null || game.away_score == null) return;
        const homeWon = game.home_score > game.away_score;
        const isConferenceGame = game.game_type === 'CONFERENCE_GAME';
        [[game.home_team, homeWon], [game.away_team, !homeWon]].forEach(([team, won]) => {
            if (!team) return;
            const rec = recordByTeam[team] || { wins: 0, losses: 0, confWins: 0, confLosses: 0 };
            if (won) rec.wins += 1; else rec.losses += 1;
            if (isConferenceGame) { if (won) rec.confWins += 1; else rec.confLosses += 1; }
            recordByTeam[team] = rec;
        });
    });

    const eloByTeam = {};
    (eloRows || []).forEach((entry) => {
        const name = entry.team || entry.team_name;
        const week = entry.week ?? entry.week_number;
        const elo = entry.elo ?? entry.team_elo;
        if (!name || week == null || elo == null) return;
        const current = eloByTeam[name];
        if (!current || week > current.week) eloByTeam[name] = { week, elo };
    });

    const statsByTeam = {};
    (seasonStatsRows || []).forEach((row) => {
        if (row.team) statsByTeam[row.team] = row;
    });

    const lastGameByTeam = {};
    (gameRows || []).forEach((game) => {
        [game.home_team, game.away_team].forEach((team) => {
            if (!team) return;
            const current = lastGameByTeam[team];
            if (!current || (game.week || 0) > (current.week || 0)) lastGameByTeam[team] = game;
        });
    });
    const coachByTeam = {};
    Object.entries(lastGameByTeam).forEach(([team, game]) => {
        const coaches = game.home_team === team ? game.home_coaches : game.away_coaches;
        coachByTeam[team] = coaches?.[0] || null;
    });

    return { conferenceMap: conferenceMap || {}, recordByTeam, eloByTeam, statsByTeam, coachByTeam };
};

const Standings = () => {
    useSeo(ROUTE_META['/standings']);

    const { conference: confParam } = useParams();
    const navigate = useNavigate();
    const teamsMap = useTeamsMap();
    const conferencesMap = useConferencesMap();
    const { isOffseason } = useOffseasonStatus();

    const [teams, setTeams] = useState([]);
    const [finalSeason, setFinalSeason] = useState(null);
    const [season, setSeason] = useState(null);
    const [liveSeason, setLiveSeason] = useState(null);
    const [allSeasons, setAllSeasons] = useState([]);
    const [historical, setHistorical] = useState(null);
    const [historicalLoading, setHistoricalLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getAllTeams(),
            getLatestCompletedSeason().catch(() => null),
            getCurrentSeasonOrLatest().catch(() => null),
            getAllSeasons().catch(() => []),
        ])
            .then(([data, latest, currentSeason, seasonsData]) => {
                setTeams(data);
                setFinalSeason(latest?.season_number ?? latest?.seasonNumber ?? null);
                setLiveSeason(currentSeason);
                setSeason(currentSeason);
                setAllSeasons(seasonsData.map((entry) => entry.season_number ?? entry.seasonNumber).filter((value) => value != null));
            })
            .catch(() => setError('Failed to load standings data. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    const isLiveSeason = season != null && season === liveSeason;

    useEffect(() => {
        if (!season || isLiveSeason) { setHistorical(null); return; }
        let active = true;
        setHistoricalLoading(true);
        Promise.all([
            getTeamSeasonConference(season),
            getScheduleBySeason(season).catch(() => []),
            getEloHistory('all', season).catch(() => []),
            getFilteredSeasonStats(null, null, season, null, 0, 1000).catch(() => ({ content: [] })),
            getFilteredGames({ season, category: 'PAST', page: 0, size: 1000 }).catch(() => ({ content: [] })),
        ])
            .then(([conferenceMap, scheduleRows, eloRows, seasonStatsRes, gamesRes]) => {
                if (!active) return;
                setHistorical(buildHistoricalData(conferenceMap, scheduleRows, eloRows, seasonStatsRes?.content, gamesRes?.content));
            })
            .finally(() => { if (active) setHistoricalLoading(false); });
        return () => { active = false; };
    }, [season, isLiveSeason]);

    const availableConferences = useMemo(() => {
        if (isLiveSeason) {
            const present = new Set(teams.map((team) => team.conference));
            return activeConferenceCodes().filter((conf) => present.has(conf));
        }
        if (!historical) return [];
        const present = new Set(Object.values(historical.conferenceMap));
        return allConferenceList().map((c) => c.code).filter((conf) => present.has(conf));
    }, [teams, conferencesMap, isLiveSeason, historical]);

    const selectedConference = confParam?.toUpperCase() || availableConferences[0];

    useEffect(() => {
        if (loading || availableConferences.length === 0) return;
        if (!confParam || !availableConferences.includes(confParam.toUpperCase())) {
            navigate(`/standings/${availableConferences[0].toLowerCase()}`, { replace: true });
        }
    }, [confParam, availableConferences, loading, navigate]);

    const displayRows = useMemo(() => {
        if (isLiveSeason) {
            return teams
                .filter((team) => team.conference === selectedConference)
                .map((team) => ({
                    name: team.name,
                    id: team.id,
                    wins: team.current_wins || 0,
                    losses: team.current_losses || 0,
                    confWins: team.current_conference_wins || 0,
                    confLosses: team.current_conference_losses || 0,
                    elo: team.current_elo,
                    offense: team.offensive_playbook,
                    defense: team.defensive_playbook,
                    coach: team.coach_usernames?.[0] || null,
                }))
                .sort((a, b) => confPct(b) - confPct(a) || a.name.localeCompare(b.name));
        }
        if (!historical) return [];
        const teamNames = Object.entries(historical.conferenceMap)
            .filter(([, conf]) => conf === selectedConference)
            .map(([name]) => name);
        return teamNames
            .map((name) => {
                const rec = historical.recordByTeam[name] || { wins: 0, losses: 0, confWins: 0, confLosses: 0 };
                const stats = historical.statsByTeam[name];
                return {
                    name,
                    id: teamsMap[name]?.id,
                    wins: rec.wins,
                    losses: rec.losses,
                    confWins: rec.confWins,
                    confLosses: rec.confLosses,
                    elo: historical.eloByTeam[name]?.elo,
                    offense: stats?.offensive_playbook,
                    defense: stats?.defensive_playbook,
                    coach: historical.coachByTeam[name] || null,
                };
            })
            .sort((a, b) => confPct(b) - confPct(a) || a.name.localeCompare(b.name));
    }, [teams, isLiveSeason, historical, selectedConference, teamsMap]);

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
                {allSeasons.length > 0 && (
                    <SelectPill
                        label="Season"
                        value={season ?? ''}
                        onChange={(next) => setSeason(Number(next))}
                        options={allSeasons.map((option) => ({ value: option, label: `Season ${option}` }))}
                    />
                )}
                {isLiveSeason && isOffseason && finalSeason != null && (
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

            {!isLiveSeason && historicalLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : (
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
                        {displayRows.map((row, index) => {
                            const mark = teamsMap[row.name] || { name: row.name };
                            return (
                                <tr key={row.name} onClick={() => row.id != null && navigate(`/team-details/${row.id}`)}>
                                    <td className="lft stick">
                                        <div className="teamcell">
                                            <span className="rk">{index + 1}</span>
                                            <TeamMark team={mark} size={22} />
                                            <span className="nm">{row.name}</span>
                                        </div>
                                    </td>
                                    <td className="num">{row.wins}-{row.losses}</td>
                                    <td className="num">{row.confWins}-{row.confLosses}</td>
                                    <td className="num">{row.elo != null ? Math.round(row.elo) : '-'}</td>
                                    <td className="lft" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{formatOffensivePlaybook(row.offense)}</td>
                                    <td className="lft" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{formatDefensivePlaybook(row.defense)}</td>
                                    <td className="lft">
                                        {row.coach ? (
                                            <Box
                                                component="span"
                                                onClick={(event) => { event.stopPropagation(); navigate(`/user-details/${row.coach}`); }}
                                                sx={{ color: 'var(--brand)', fontWeight: 700, cursor: 'pointer' }}
                                            >
                                                @{row.coach}
                                            </Box>
                                        ) : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </DataTable>
            )}
        </PageWrap>
    );
};

export default Standings;
