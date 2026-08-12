import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import ConferenceTabs from '../../components/team/ConferenceTabs';
import SelectPill from '../../components/ui/SelectPill';
import DataTable from '../../components/ui/DataTable';
import TeamMark from '../../components/ui/TeamMark';
import ConferenceMark from '../../components/ui/ConferenceMark';
import { getAllTeams } from '../../api/teamApi';
import { getLatestCompletedSeason, getCurrentSeasonOrLatest, getAllSeasons } from '../../api/seasonApi';
import { getScheduleBySeason, getConferenceRules } from '../../api/scheduleApi';
import { getEloHistory } from '../../api/eloHistoryApi.jsx';
import { getFilteredSeasonStats } from '../../api/seasonStatsApi';
import { getFilteredGames } from '../../api/gameApi';
import { getTeamSeasonConference } from '../../api/teamSeasonConferenceApi';
import { useTeamsMap, ensureTeam } from '../../hooks/useTeamsMap';
import { useConferencesMap, activeConferenceCodes, allConferenceList, conferenceLabel } from '../../components/constants/conferences';
import { formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';
import { useOffseasonStatus } from '../../components/game/scoreboard/hooks/useOffseasonStatus';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';
import { sortStandingsRows } from '../../utils/standingsTiebreakers';

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

    const coachCountsByTeam = {};
    (gameRows || []).forEach((game) => {
        [[game.home_team, game.home_coaches?.[0]], [game.away_team, game.away_coaches?.[0]]].forEach(([team, coach]) => {
            if (!team || !coach) return;
            const counts = coachCountsByTeam[team] || {};
            counts[coach] = (counts[coach] || 0) + 1;
            coachCountsByTeam[team] = counts;
        });
    });
    const coachByTeam = {};
    Object.entries(coachCountsByTeam).forEach(([team, counts]) => {
        let best = null;
        let bestCount = 0;
        Object.entries(counts).forEach(([coach, count]) => {
            if (count > bestCount) { best = coach; bestCount = count; }
        });
        coachByTeam[team] = best;
    });

    return { conferenceMap: conferenceMap || {}, recordByTeam, eloByTeam, statsByTeam, coachByTeam, scheduleRows: scheduleRows || [] };
};

const Standings = () => {
    useSeo(ROUTE_META['/standings']);

    const { conference: confParam, seasonParam } = useParams();
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
    const [divisions, setDivisions] = useState([]);
    const [liveGames, setLiveGames] = useState([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getAllTeams(),
            getLatestCompletedSeason().catch(() => null),
            getCurrentSeasonOrLatest().catch(() => null),
            getAllSeasons().catch(() => []),
        ])
            .then(([data, latest, currentSeason, seasonsData]) => {
                const seasonNumbers = seasonsData.map((entry) => entry.season_number ?? entry.seasonNumber).filter((value) => value != null);
                const urlSeason = seasonParam ? parseInt(seasonParam, 10) : null;
                setTeams(data);
                setFinalSeason(latest?.season_number ?? latest?.seasonNumber ?? null);
                setLiveSeason(currentSeason);
                setSeason(urlSeason && seasonNumbers.includes(urlSeason) ? urlSeason : currentSeason);
                setAllSeasons(seasonNumbers);
            })
            .catch(() => setError('Failed to load standings data. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    const isLiveSeason = season != null && season === liveSeason;

    useEffect(() => {
        if (!season || !isLiveSeason) { setLiveGames([]); return undefined; }
        let active = true;
        getScheduleBySeason(season)
            .then((rows) => { if (active) setLiveGames(rows || []); })
            .catch(() => { if (active) setLiveGames([]); });
        return () => { active = false; };
    }, [season, isLiveSeason]);

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
        if (!selectedConference) { setDivisions([]); return undefined; }
        let active = true;
        getConferenceRules(selectedConference)
            .then((rules) => { if (active) setDivisions(rules?.divisions || []); })
            .catch(() => { if (active) setDivisions([]); });
        return () => { active = false; };
    }, [selectedConference]);

    useEffect(() => {
        if (loading || availableConferences.length === 0 || season == null) return;
        if (!confParam || !availableConferences.includes(confParam.toUpperCase())) {
            navigate(`/standings/${availableConferences[0].toLowerCase()}/${season}`, { replace: true });
        }
    }, [confParam, availableConferences, loading, season, navigate]);

    const changeSeason = (nextSeason) => {
        setSeason(nextSeason);
        navigate(`/standings/${selectedConference.toLowerCase()}/${nextSeason}`, { replace: true });
    };

    const changeConference = (conf) => navigate(`/standings/${conf.toLowerCase()}/${season}`);

    const displayRows = useMemo(() => {
        if (isLiveSeason) {
            const rows = teams
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
                    division: team.division || null,
                }));
            return sortStandingsRows(rows, liveGames);
        }
        if (!historical) return [];
        const teamNames = Object.entries(historical.conferenceMap)
            .filter(([, conf]) => conf === selectedConference)
            .map(([name]) => name);
        const rows = teamNames
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
            });
        return sortStandingsRows(rows, historical.scheduleRows);
    }, [teams, isLiveSeason, historical, selectedConference, teamsMap, liveGames]);

    const sections = useMemo(() => {
        if (!isLiveSeason || divisions.filter(Boolean).length === 0) {
            return [{ label: null, rows: displayRows }];
        }
        const byDivision = {};
        const unassigned = [];
        displayRows.forEach((row) => {
            if (row.division && divisions.includes(row.division)) {
                if (!byDivision[row.division]) byDivision[row.division] = [];
                byDivision[row.division].push(row);
            } else {
                unassigned.push(row);
            }
        });
        const result = divisions
            .filter(Boolean)
            .map((name) => ({ label: name, rows: byDivision[name] || [] }))
            .filter((section) => section.rows.length > 0);
        if (unassigned.length > 0) result.push({ label: 'Unassigned', rows: unassigned });
        return result;
    }, [isLiveSeason, divisions, displayRows]);

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

    return (
        <PageWrap>
            <PageHeading
                eyebrow={conferenceLabel(selectedConference)}
                title="Standings"
                leading={selectedConference ? <ConferenceMark conference={selectedConference} size={42} /> : null}
            >
                {allSeasons.length > 0 && (
                    <SelectPill
                        label="Season"
                        value={season ?? ''}
                        onChange={(next) => changeSeason(Number(next))}
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
                    onChange={changeConference}
                />
            </Box>

            {!isLiveSeason && historicalLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : (
                <DataTable minWidth={860} tableLayout="fixed">
                    <thead>
                        <tr>
                            <th className="lft stick" style={{ width: '32%' }}>Team</th>
                            <th style={{ width: '11%' }}>Overall</th>
                            <th style={{ width: '11%' }}>Conference</th>
                            <th style={{ width: '11%' }}>ELO</th>
                            <th className="lft" style={{ width: '11%' }}>Offense</th>
                            <th className="lft" style={{ width: '11%' }}>Defense</th>
                            <th className="lft" style={{ width: '13%' }}>Coach</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sections.map((section) => (
                            <React.Fragment key={section.label || 'all'}>
                                {section.label && (
                                    <tr>
                                        <td colSpan={7} style={{ background: 'var(--surface-2)', color: 'var(--text-dim)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, padding: '6px 10px' }}>
                                            {section.label}
                                        </td>
                                    </tr>
                                )}
                                {section.rows.map((row, index) => {
                                    if (!teamsMap[row.name]) ensureTeam(row.name);
                                    const mark = teamsMap[row.name] || { name: row.name };
                                    return (
                                        <Box component="tr" key={row.name} sx={{ position: 'relative' }}>
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
                                                        component={Link}
                                                        to={`/user-details/${row.coach}`}
                                                        sx={{ position: 'relative', zIndex: 3, color: 'var(--brand)', fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}
                                                    >
                                                        @{row.coach}
                                                    </Box>
                                                ) : '-'}
                                            </td>
                                            {row.id != null && (
                                                <Box
                                                    component={Link}
                                                    to={`/team-details/${row.id}`}
                                                    sx={{ position: 'absolute', inset: 0, zIndex: 2 }}
                                                />
                                            )}
                                        </Box>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </DataTable>
            )}
        </PageWrap>
    );
};

export default Standings;
