import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import SegTabs from '../../components/ui/SegTabs';
import SelectPill from '../../components/ui/SelectPill';
import DataTable from '../../components/ui/DataTable';
import TeamMark from '../../components/ui/TeamMark';
import ConferenceMark from '../../components/ui/ConferenceMark';
import { getAllTeams } from '../../api/teamApi';
import { getRankings, getRankingWeeks } from '../../api/rankingApi';
import { getEloHistory } from '../../api/eloHistoryApi.jsx';
import { getAllSeasons } from '../../api/seasonApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { eloWeekBuckets, eloByTeamForWeek, eloRankingForWeek } from '../../utils/eloRankings';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';

const POLL_TYPE = { coaches: 'COACHES_POLL', committee: 'PLAYOFF_COMMITTEE' };
const TAB_LABEL = { coaches: 'Coaches Poll', committee: 'Playoff Committee', elo: 'ELO' };
const weekLabel = (week) => (week >= 14 ? 'Postseason' : `Week ${week}`);

const RankDelta = ({ prev, rank }) => {
    if (prev == null) return <span className="flat">-</span>;
    const move = prev - rank;
    if (move > 0) return <span className="up">▲ {move}</span>;
    if (move < 0) return <span className="down">▼ {Math.abs(move)}</span>;
    return <span className="flat">-</span>;
};

RankDelta.propTypes = { prev: PropTypes.number, rank: PropTypes.number.isRequired };

const Rankings = () => {
    useSeo(ROUTE_META['/rankings']);

    const { type } = useParams();
    const navigate = useNavigate();
    const teamsMap = useTeamsMap();

    const [season, setSeason] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [teams, setTeams] = useState([]);
    const [eloHistory, setEloHistory] = useState([]);
    const [weeksByPoll, setWeeksByPoll] = useState({ COACHES_POLL: [], PLAYOFF_COMMITTEE: [] });
    const [week, setWeek] = useState(null);
    const [pollData, setPollData] = useState({ current: [], prevRankByTeamId: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [seasonsData, teamsData, elo] = await Promise.all([
                    getAllSeasons(),
                    getAllTeams(),
                    getEloHistory('all').catch(() => []),
                ]);
                if (!active) return;
                const seasonNumbers = [...new Set(seasonsData
                    .map((entry) => entry.season_number ?? entry.seasonNumber)
                    .filter((value) => value != null))].sort((a, b) => b - a);
                setSeasons(seasonNumbers);
                setTeams(teamsData);
                setEloHistory(elo);

                const eloSeasons = new Set(elo.map((row) => row.season));
                let defaultSeason = null;
                for (const candidate of seasonNumbers) {
                    if (eloSeasons.has(candidate)) { defaultSeason = candidate; break; }
                    const weeks = await getRankingWeeks(candidate, 'COACHES_POLL').catch(() => []);
                    if (weeks.length) { defaultSeason = candidate; break; }
                }
                if (active) setSeason(defaultSeason ?? seasonNumbers[0] ?? null);
            } catch {
                if (active) setError('Failed to load rankings data. Please try again.');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (season == null) return undefined;
        let active = true;
        Promise.all([
            getRankingWeeks(season, 'COACHES_POLL').catch(() => []),
            getRankingWeeks(season, 'PLAYOFF_COMMITTEE').catch(() => []),
        ]).then(([coaches, committee]) => {
            if (active) setWeeksByPoll({ COACHES_POLL: coaches || [], PLAYOFF_COMMITTEE: committee || [] });
        });
        return () => { active = false; };
    }, [season]);

    const eloWeeks = useMemo(() => eloWeekBuckets(eloHistory, season), [eloHistory, season]);

    const tabs = useMemo(() => {
        const list = [];
        if (weeksByPoll.COACHES_POLL.length) list.push('coaches');
        if (weeksByPoll.PLAYOFF_COMMITTEE.length) list.push('committee');
        if (eloWeeks.length) list.push('elo');
        return list.length ? list : ['coaches'];
    }, [weeksByPoll, eloWeeks]);

    const mode = tabs.includes(type) ? type : tabs[0];

    useEffect(() => {
        if (loading || tabs.length === 0) return;
        if (!tabs.includes(type)) navigate(`/rankings/${tabs[0]}`, { replace: true });
    }, [type, tabs, loading, navigate]);

    const weeksForMode = useMemo(
        () => (mode === 'elo' ? eloWeeks : (weeksByPoll[POLL_TYPE[mode]] || [])),
        [mode, eloWeeks, weeksByPoll],
    );

    useEffect(() => {
        setWeek((current) => {
            if (!weeksForMode.length) return null;
            if (current == null || !weeksForMode.includes(current)) return weeksForMode[weeksForMode.length - 1];
            return current;
        });
    }, [weeksForMode]);

    useEffect(() => {
        if (mode === 'elo' || season == null || week == null) return undefined;
        const pollType = POLL_TYPE[mode];
        const index = weeksForMode.indexOf(week);
        const prevWeek = index > 0 ? weeksForMode[index - 1] : null;
        let active = true;
        Promise.all([
            getRankings(season, week, pollType),
            prevWeek != null ? getRankings(season, prevWeek, pollType) : Promise.resolve([]),
        ]).then(([current, prev]) => {
            if (!active) return;
            const prevRankByTeamId = {};
            prev.forEach((entry) => { prevRankByTeamId[entry.teamId] = entry.rank; });
            setPollData({ current, prevRankByTeamId });
        }).catch(() => { if (active) setPollData({ current: [], prevRankByTeamId: {} }); });
        return () => { active = false; };
    }, [mode, season, week, weeksForMode]);

    const teamById = useMemo(() => Object.fromEntries(teams.map((team) => [team.id, team])), [teams]);
    const teamByName = useMemo(() => Object.fromEntries(teams.map((team) => [team.name, team])), [teams]);
    const eloByTeam = useMemo(
        () => (season != null && week != null ? eloByTeamForWeek(eloHistory, season, week) : {}),
        [eloHistory, season, week],
    );

    const rows = useMemo(() => {
        if (mode === 'elo') {
            if (season == null || week == null) return [];
            const { ordered } = eloRankingForWeek(eloHistory, season, week);
            const prevWeek = eloWeeks[eloWeeks.indexOf(week) - 1];
            const prevRankByTeam = prevWeek != null ? eloRankingForWeek(eloHistory, season, prevWeek).rankByTeam : {};
            return ordered.map((entry) => ({
                rank: entry.rank,
                team: teamByName[entry.team] || { name: entry.team },
                prev: prevRankByTeam[entry.team],
                elo: Math.round(entry.elo),
                wins: entry.wins,
                losses: entry.losses,
            }));
        }
        return (pollData.current || []).map((entry) => {
            const team = teamById[entry.teamId] || { name: entry.teamName };
            const elo = eloByTeam[team.name] ?? team.current_elo;
            return {
                rank: entry.rank,
                team,
                prev: pollData.prevRankByTeamId[entry.teamId],
                elo: elo != null ? Math.round(elo) : null,
                wins: entry.wins,
                losses: entry.losses,
            };
        });
    }, [mode, pollData, teamById, teamByName, eloByTeam, eloHistory, season, week, eloWeeks]);

    if (loading) {
        return <PageWrap><Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box></PageWrap>;
    }

    if (error) {
        return <PageWrap><Alert severity="error">{error}</Alert></PageWrap>;
    }

    return (
        <PageWrap>
            <PageHeading eyebrow="Top 25" title="Rankings">
                <SegTabs
                    ariaLabel="Ranking type"
                    value={mode}
                    onChange={(next) => navigate(`/rankings/${next}`)}
                    options={tabs.map((tab) => ({ value: tab, label: TAB_LABEL[tab] }))}
                />
                {season != null && seasons.length > 0 && (
                    <SelectPill
                        label="Season"
                        value={season}
                        onChange={(next) => setSeason(Number(next))}
                        options={seasons.map((option) => ({ value: option, label: `Season ${option}` }))}
                    />
                )}
                {week != null && weeksForMode.length > 0 && (
                    <SelectPill
                        label="Week"
                        value={week}
                        onChange={(next) => setWeek(Number(next))}
                        options={weeksForMode.map((option) => ({ value: option, label: weekLabel(option) }))}
                    />
                )}
            </PageHeading>

            <DataTable minWidth={640}>
                <thead>
                    <tr>
                        <th className="lft stick">Rk</th>
                        <th className="lft">Team</th>
                        <th>Record</th>
                        <th>Conf</th>
                        <th>Prev</th>
                        <th>Δ</th>
                        <th>ELO</th>
                        <th>Coach</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(({ rank, team, prev, elo, wins, losses }) => {
                        const mark = teamsMap[team.name] || { name: team.name, abbreviation: team.abbreviation, logo: team.logo };
                        const coach = team.coach_usernames?.[0];
                        return (
                            <tr key={team.id ?? team.name} onClick={() => team.id && navigate(`/team-details/${team.id}`)}>
                                <td className="lft stick">
                                    <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '1rem' }}>{rank}</span>
                                </td>
                                <td className="lft">
                                    <div className="teamcell">
                                        <TeamMark team={mark} size={22} />
                                        <span className="nm">{team.name}</span>
                                    </div>
                                </td>
                                <td className="num">{wins != null ? `${wins}-${losses ?? 0}` : '-'}</td>
                                <td style={{ textAlign: 'center' }}><ConferenceMark conference={team.conference} /></td>
                                <td className="num">{prev != null ? prev : '-'}</td>
                                <td className="num"><RankDelta prev={prev} rank={rank} /></td>
                                <td className="num">{elo != null ? elo : '-'}</td>
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

export default Rankings;
