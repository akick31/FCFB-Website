import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllUsers } from '../../api/userApi';
import { getAllTeams } from '../../api/teamApi';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';
import { getEloHistory } from '../../api/eloHistoryApi.jsx';
import { getRankingsHistory } from '../../api/rankingsHistoryApi.jsx';
import { getCoachStats } from '../../api/coachStatsApi';
import { getCurrentSeason, getLatestCompletedSeason } from '../../api/seasonApi';
import { aggregateSeasonStats } from '../../utils/aggregateStats';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { useColorMode } from '../../theme/ColorModeContext';
import { pickTeamColor } from '../../utils/teamColor';
import { formatPosition, formatWinPct } from '../../utils/formatText';
import { formatResponseTime } from '../../utils/timeUtils';
import { checkIfUserIsAdmin } from '../../utils/utils';
import { buildCoachStints, coachTransactionsFor, formatStintDate } from '../../utils/coachHistory';
import { teamCoachPoints, trendSeasons, buildTrendLines, trendBounds } from '../../utils/coachTrends';
import { useSeo } from '../../hooks/useSeo';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import SectionTitle from '../../components/ui/SectionTitle';
import Panel from '../../components/ui/Panel';
import SelectPill from '../../components/ui/SelectPill';
import DataTable from '../../components/ui/DataTable';
import StatTile, { TileGrid } from '../../components/ui/StatTile';
import TeamMark from '../../components/ui/TeamMark';
import SeasonStatTable from '../../components/team/SeasonStatTable';
import MultiLineChart from '../../components/charts/MultiLineChart';
import CoachHeader from '../../components/user/CoachHeader';
import CurrentTeamsPanel from '../../components/user/CurrentTeamsPanel';
import { clickableRowProps, clickableProps } from '../../utils/a11y';

const POLL_TICKS = [1, 5, 10, 15, 20, 25].map((v) => ({ v, label: String(v) }));

const num = (value) => (value == null ? '-' : Number(value).toLocaleString());
const dec = (value, digits = 1) => (value == null ? '-' : Number(value).toFixed(digits));
const pct = (value) => (value == null ? '-' : `${Number(value).toFixed(1)}%`);
const signed = (value) => (value == null ? '-' : (value > 0 ? `+${value}` : `${value}`));

const resolveDefaultSeason = async () => {
    try {
        return await getCurrentSeason();
    } catch {
        const latest = await getLatestCompletedSeason().catch(() => null);
        return latest?.season_number ?? latest?.seasonNumber ?? null;
    }
};

const TrendLegend = ({ lines, onTeam }) => (
    <Box sx={{ display: 'flex', gap: '14px', flexWrap: 'wrap', mt: '10px', px: 2, pb: 2 }}>
        {lines.map((line) => (
            <Box key={line.team} {...clickableProps(() => onTeam(line.team))} sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer', '&:focus-visible': { outline: '2px solid var(--brand)', outlineOffset: '2px' } }}>
                <Box sx={{ width: 11, height: 3, borderRadius: '2px', background: line.color }} />
                {line.team}
            </Box>
        ))}
    </Box>
);

TrendLegend.propTypes = {
    lines: PropTypes.arrayOf(PropTypes.shape({ team: PropTypes.string, color: PropTypes.string })).isRequired,
    onTeam: PropTypes.func.isRequired,
};

const UserDetails = () => {
    const { coachName } = useParams();
    const navigate = useNavigate();
    const teamsMap = useTeamsMap();
    const { mode } = useColorMode();
    const decodedName = decodeURIComponent(coachName || '');

    const [user, setUser] = useState(null);
    const [allTeams, setAllTeams] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [seriesByTeam, setSeriesByTeam] = useState({});
    const [coachStats, setCoachStats] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [seasonView, setSeasonView] = useState(null);
    const [championSeason, setChampionSeason] = useState(null);
    const [loading, setLoading] = useState(true);

    useSeo({
        title: `${decodedName || 'Coach'} | Fake College Football`,
        description: `Coach profile, record, and coaching history for ${decodedName || 'this coach'} in Fake College Football.`,
    });

    useEffect(() => {
        let active = true;
        (async () => {
            setLoading(true);
            try {
                const [allUsers, allTeams, allTransactions, defSeason, latest] = await Promise.all([
                    getAllUsers(),
                    getAllTeams().catch(() => []),
                    getEntireCoachTransactionLog().catch(() => []),
                    resolveDefaultSeason(),
                    getLatestCompletedSeason().catch(() => null),
                ]);
                if (!active) return;

                const foundUser = allUsers.find((entry) => entry.coach_name === decodedName || entry.username === decodedName) || null;
                setUser(foundUser);
                if (!foundUser) return;

                const names = [foundUser.coach_name, foundUser.username].filter(Boolean);
                const txns = coachTransactionsFor(allTransactions, names);
                setTransactions(txns);
                setAllTeams(allTeams);

                const champTeam = latest?.national_championship_winning_team ?? latest?.nationalChampionshipWinningTeam;
                if (champTeam && champTeam === foundUser.team) {
                    setChampionSeason(latest?.season_number ?? latest?.seasonNumber ?? null);
                }

                const coachedTeamNames = [...new Set([
                    ...txns.map((entry) => entry.team),
                    foundUser.team,
                ].filter(Boolean))];

                const [perTeam, statsData] = await Promise.all([
                    Promise.all(coachedTeamNames.map(async (teamName) => {
                        const [rankGames, eloRows] = await Promise.all([
                            getRankingsHistory(teamName, null).catch(() => []),
                            getEloHistory(teamName, null).catch(() => []),
                        ]);
                        return [teamName, teamCoachPoints(teamName, rankGames, eloRows, names)];
                    })),
                    getCoachStats(foundUser.username),
                ]);
                if (!active) return;
                setCoachStats(statsData);

                const series = {};
                perTeam.forEach(([teamName, points]) => {
                    if (points.rankPts.length || points.eloPts.length) series[teamName] = points;
                });
                setSeriesByTeam(series);

                const seasonList = trendSeasons(series);
                setSeasons(seasonList);
                setSeasonView(defSeason != null && seasonList.includes(defSeason) ? defSeason : (seasonList[0] ?? 'alltime'));
            } catch {
                if (active) setUser(null);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [decodedName]);

    const stints = useMemo(() => buildCoachStints(transactions), [transactions]);

    const teamEntries = useMemo(() => stints
        .filter((stint) => !stint.endDate)
        .map((stint) => ({ team: allTeams.find((team) => team.name === stint.team), position: stint.position }))
        .filter((entry) => entry.team), [stints, allTeams]);

    const primaryTeam = useMemo(() => {
        const fromUserTeam = allTeams.find((team) => team.name === user?.team);
        if (fromUserTeam && teamEntries.some((entry) => entry.team.name === fromUserTeam.name)) return fromUserTeam;
        return teamEntries[0]?.team || fromUserTeam || null;
    }, [teamEntries, allTeams, user]);

    const careerStats = useMemo(() => aggregateSeasonStats(coachStats), [coachStats]);

    const recordByTeam = useMemo(() => {
        const record = {};
        coachStats.forEach((row) => {
            if (!row.team) return;
            if (!record[row.team]) record[row.team] = { wins: 0, losses: 0 };
            record[row.team].wins += row.wins || 0;
            record[row.team].losses += row.losses || 0;
        });
        return record;
    }, [coachStats]);

    const isAdmin = checkIfUserIsAdmin();

    const colorFor = (teamName) => pickTeamColor(teamsMap[teamName], mode);
    const eloLines = useMemo(() => buildTrendLines({ seriesByTeam, metric: 'elo', seasonView, colorFor }), [seriesByTeam, seasonView, teamsMap, mode]);
    const rankLines = useMemo(() => buildTrendLines({ seriesByTeam, metric: 'rank', seasonView, colorFor }), [seriesByTeam, seasonView, teamsMap, mode]);

    if (loading) {
        return <PageWrap><Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box></PageWrap>;
    }

    if (!user) {
        return (
            <PageWrap>
                <PageHeading eyebrow="Coach profile" title="Coach not found" />
                <Box sx={{ color: 'var(--text-muted)' }}>No coach found for &quot;{decodedName}&quot;.</Box>
            </PageWrap>
        );
    }

    const goTeam = (name) => {
        const id = teamsMap[name]?.id;
        if (id) navigate(`/team-details/${id}`);
    };

    const eloBounds = trendBounds(eloLines, 25);
    const seasonLabel = seasonView === 'alltime' ? 'All seasons' : `Season ${seasonView}`;

    return (
        <PageWrap>
            <PageHeading eyebrow="Coach profile" title={`@${user.coach_name || user.username}`}>
                {isAdmin && (
                    <Box
                        component="button"
                        onClick={() => navigate(`/admin/edit-coach/${encodeURIComponent(user.username)}`)}
                        sx={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '14px', py: '8px', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)' } }}
                    >
                        Edit coach
                    </Box>
                )}
            </PageHeading>

            <CoachHeader user={user} team={primaryTeam} mark={primaryTeam ? teamsMap[primaryTeam.name] : null} championSeason={championSeason} />

            <SectionTitle title="Coaching record" />
            <TileGrid>
                <StatTile label="All-time record" value={`${user.wins || 0}-${user.losses || 0}`} caption={`${user.conference_wins || 0}-${user.conference_losses || 0} conference`} />
                <StatTile label="Win percentage" value={formatWinPct(user.win_percentage)} />
                <StatTile label="National titles" value={user.national_championship_wins || 0} />
                <StatTile label="Conference titles" value={user.conference_championship_wins || 0} />
                <StatTile label="Playoff record" value={`${user.playoff_wins || 0}-${user.playoff_losses || 0}`} />
                <StatTile label="Bowl record" value={`${user.bowl_wins || 0}-${user.bowl_losses || 0}`} />
            </TileGrid>

            <SectionTitle title="Coach stats" note="career" />
            <TileGrid>
                <StatTile label="Total games" value={(user.wins || 0) + (user.losses || 0)} />
                <StatTile label="Average response" value={user.average_response_time ? formatResponseTime(user.average_response_time) : 'N/A'} />
                <StatTile label="Delay of game" value={user.delay_of_game_instances || 0} />
                {careerStats && <StatTile label="Total yards" value={num(careerStats.total_yards)} />}
                {careerStats && <StatTile label="Yards per play" value={dec(careerStats.average_yards_per_play, 2)} />}
                {careerStats && <StatTile label="Touchdowns" value={num(careerStats.touchdowns)} />}
                {careerStats && <StatTile label="Avg offensive diff" value={dec(careerStats.average_offensive_diff)} />}
                {careerStats && <StatTile label="Avg defensive diff" value={dec(careerStats.average_defensive_diff)} />}
                {careerStats && <StatTile label="Turnover diff" value={signed(careerStats.turnover_differential)} />}
                {careerStats && <StatTile label="3rd down %" value={pct(careerStats.third_down_conversion_percentage)} />}
                {careerStats && <StatTile label="Red zone %" value={pct(careerStats.red_zone_success_percentage)} />}
            </TileGrid>
            {careerStats && (
                <Panel sx={{ mt: '16px' }}>
                    <SeasonStatTable stats={careerStats} />
                </Panel>
            )}

            {teamEntries.length > 0 && (
                <>
                    <SectionTitle title={teamEntries.length > 1 ? 'Current programs' : 'Current program'} />
                    <CurrentTeamsPanel entries={teamEntries} teamsMap={teamsMap} />
                </>
            )}

            {(eloLines.length > 0 || rankLines.length > 0) && (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mt: '22px', mb: '12px' }}>
                        <Box component="h2" sx={{ m: 0, fontFamily: 'var(--cond)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em', fontSize: '1.2rem', color: 'var(--text)' }}>
                            Trends
                        </Box>
                        <SelectPill
                            label="Viewing"
                            value={seasonView ?? ''}
                            onChange={(next) => setSeasonView(next === 'alltime' ? 'alltime' : Number(next))}
                            options={[...seasons.map((option) => ({ value: option, label: `Season ${option}` })), { value: 'alltime', label: 'All-time' }]}
                        />
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: eloLines.length > 0 && rankLines.length > 0 ? '1fr 1fr' : '1fr' }, gap: '16px' }}>
                        {eloLines.length > 0 && (
                            <Panel header="ELO trend" more={seasonLabel}>
                                <Box sx={{ p: 2, pb: 0 }}>
                                    <MultiLineChart lines={eloLines} yMin={eloBounds.yMin} yMax={eloBounds.yMax} height={260} label={(p) => `Season ${p.season}, Week ${p.week}, ELO ${p.val}`} />
                                </Box>
                                <TrendLegend lines={eloLines} onTeam={goTeam} />
                            </Panel>
                        )}
                        {rankLines.length > 0 && (
                            <Panel header="Coaches poll" more={seasonLabel}>
                                <Box sx={{ p: 2, pb: 0 }}>
                                    <MultiLineChart lines={rankLines} yMin={1} yMax={25} invert yTicks={POLL_TICKS} height={260} label={(p) => `Season ${p.season}, Week ${p.week}, #${p.val}`} />
                                </Box>
                                <TrendLegend lines={rankLines} onTeam={goTeam} />
                            </Panel>
                        )}
                    </Box>
                </>
            )}

            <SectionTitle title="Coaching history" />
            {stints.length > 0 ? (
                <DataTable minWidth={480}>
                    <thead>
                        <tr>
                            <th className="lft stick">Team</th>
                            <th className="lft">Position</th>
                            <th>Record at team</th>
                            <th className="lft">From</th>
                            <th className="lft">To</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stints.map((stint, index) => {
                            const active = !stint.endDate;
                            return (
                                <tr key={`${stint.team}-${index}`} {...clickableRowProps(() => goTeam(stint.team))}>
                                    <td className="lft stick">
                                        <Box className="teamcell">
                                            <TeamMark team={teamsMap[stint.team]} size={22} />
                                            <span className="nm">{stint.team}</span>
                                            {active && (
                                                <Box component="span" sx={{ fontSize: '0.56rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--field)', border: '1px solid color-mix(in srgb, var(--field) 55%, var(--line))', borderRadius: 'var(--r-sm)', px: '5px', py: '2px' }}>
                                                    Current
                                                </Box>
                                            )}
                                        </Box>
                                    </td>
                                    <td className="lft">{formatPosition(stint.position)}</td>
                                    <td className="num">{recordByTeam[stint.team] ? `${recordByTeam[stint.team].wins}-${recordByTeam[stint.team].losses}` : '-'}</td>
                                    <td className="lft">{formatStintDate(stint.startDate)}</td>
                                    <td className="lft" style={{ color: active ? 'var(--field)' : undefined }}>{active ? 'Present' : formatStintDate(stint.endDate)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </DataTable>
            ) : (
                <Panel><Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No permanent coaching stints on record.</Box></Panel>
            )}
        </PageWrap>
    );
};

export default UserDetails;
