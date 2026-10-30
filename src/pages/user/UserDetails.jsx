import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { getUserByUsernameOrCoachName, getUsernameHistory } from '../../api/userApi';
import { getAllTeams } from '../../api/teamApi';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';
import { getEloHistoryForTeams } from '../../api/eloHistoryApi.jsx';
import { getRankedGames } from '../../api/rankingApi';
import { getCoachStats } from '../../api/coachStatsApi';
import { getCurrentSeason, getLatestCompletedSeason } from '../../api/seasonApi';
import { aggregateSeasonStats } from '../../utils/aggregateStats';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { useColorMode } from '../../context/ColorModeContext';
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
import PageTabs from '../../components/ui/PageTabs';
import CoachEditDialog from '../../components/admin/CoachEditDialog';
import { compact, secondaryButtonSx } from '../../styles/controls';
import CurrentTeamsPanel from '../../components/user/CurrentTeamsPanel';

const POLL_TICKS = [1, 5, 10, 15, 20, 25].map((v) => ({ v, label: String(v) }));

const num = (value) => (value == null ? '-' : Number(value).toLocaleString());
const dec = (value, digits = 2) => (value == null ? '-' : Number(value).toFixed(digits));
const pct = (value) => (value == null ? '-' : `${Number(value).toFixed(1)}%`);
const signed = (value) => (value == null ? '-' : value > 0 ? `+${value}` : `${value}`);

const resolveDefaultSeason = async () => {
    try {
        return await getCurrentSeason();
    } catch {
        const latest = await getLatestCompletedSeason().catch(() => null);
        return latest?.season_number ?? latest?.seasonNumber ?? null;
    }
};

const TrendLegend = ({ lines, teamsMap }) => (
    <Box sx={{ display: 'flex', gap: '14px', flexWrap: 'wrap', mt: '10px', px: 2, pb: 2 }}>
        {lines.map((line) => {
            const teamId = teamsMap[line.team]?.id;
            return (
                <Box
                    key={line.team}
                    component={teamId ? Link : 'div'}
                    to={teamId ? `/team-details/${teamId}` : undefined}
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        cursor: teamId ? 'pointer' : 'default',
                        '&:focus-visible': { outline: '2px solid var(--brand)', outlineOffset: '2px' },
                    }}
                >
                    <Box sx={{ width: 11, height: 3, borderRadius: '2px', background: line.color }} />
                    {line.team}
                </Box>
            );
        })}
    </Box>
);

TrendLegend.propTypes = {
    lines: PropTypes.arrayOf(PropTypes.shape({ team: PropTypes.string, color: PropTypes.string })).isRequired,
    teamsMap: PropTypes.object.isRequired,
};

const UserDetails = ({ user: signedInUser }) => {
    const { coachName } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
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
    const [editing, setEditing] = useState(false);
    const [version, setVersion] = useState(0);
    const [statsSeasonView, setStatsSeasonView] = useState('career');

    useSeo({
        title: `${decodedName || 'Coach'} | Fake College Football`,
        description: `Coach profile, record, and coaching history for ${decodedName || 'this coach'} in Fake College Football.`,
    });

    useEffect(() => {
        let active = true;
        setUser(null);
        setChampionSeason(null);
        setSeasonView(null);
        (async () => {
            setLoading(true);
            try {
                const [foundUser, allTeams, allTransactions, defSeason, latest] = await Promise.all([
                    getUserByUsernameOrCoachName(decodedName).catch(() => null),
                    getAllTeams().catch(() => []),
                    getEntireCoachTransactionLog().catch(() => []),
                    resolveDefaultSeason(),
                    getLatestCompletedSeason().catch(() => null),
                ]);
                if (!active) {
                    return;
                }

                setUser(foundUser);
                if (!foundUser) {
                    return;
                }

                const historicalUsernames = await getUsernameHistory(foundUser.id).catch(() => []);
                if (!active) {
                    return;
                }
                const names = [foundUser.coach_name, foundUser.username, ...historicalUsernames].filter(Boolean);
                const txns = coachTransactionsFor(allTransactions, names, foundUser.discord_id);
                setTransactions(txns);
                setAllTeams(allTeams);

                const champTeam = latest?.national_championship_winning_team ?? latest?.nationalChampionshipWinningTeam;
                if (champTeam && champTeam === foundUser.team) {
                    setChampionSeason(latest?.season_number ?? latest?.seasonNumber ?? null);
                }

                const coachedTeamNames = [
                    ...new Set([...txns.map((entry) => entry.team), foundUser.team].filter(Boolean)),
                ];

                const [rankGames, eloRows, statsData] = await Promise.all([
                    coachedTeamNames.length ? getRankedGames('all', null).catch(() => []) : Promise.resolve([]),
                    coachedTeamNames.length
                        ? getEloHistoryForTeams(coachedTeamNames).catch(() => [])
                        : Promise.resolve([]),
                    getCoachStats(foundUser.username),
                ]);
                if (!active) {
                    return;
                }
                setCoachStats(statsData);

                const perTeam = coachedTeamNames.map((teamName) => {
                    const teamEloRows = eloRows.filter((row) => row.team === teamName);
                    return [teamName, teamCoachPoints(teamName, rankGames, teamEloRows, names)];
                });

                const series = {};
                perTeam.forEach(([teamName, points]) => {
                    if (points.rankPts.length || points.eloPts.length) {
                        series[teamName] = points;
                    }
                });
                setSeriesByTeam(series);

                const seasonList = trendSeasons(series);
                setSeasons(seasonList);
                const urlSeason = searchParams.get('season');
                if (urlSeason === 'alltime' || (urlSeason && seasonList.includes(Number(urlSeason)))) {
                    setSeasonView(urlSeason === 'alltime' ? 'alltime' : Number(urlSeason));
                } else {
                    setSeasonView(
                        defSeason != null && seasonList.includes(defSeason) ? defSeason : (seasonList[0] ?? 'alltime')
                    );
                }
            } catch {
                if (active) {
                    setUser(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        })();
        return () => {
            active = false;
        };
    }, [decodedName, version]);

    const stints = useMemo(
        () => buildCoachStints(transactions, user ? { team: user.team, position: user.position } : null),
        [transactions, user]
    );

    const teamEntries = useMemo(
        () =>
            stints
                .filter((stint) => !stint.endDate)
                .map((stint) => ({ team: allTeams.find((team) => team.name === stint.team), position: stint.position }))
                .filter((entry) => entry.team),
        [stints, allTeams]
    );

    const primaryTeam = useMemo(() => {
        const fromUserTeam = allTeams.find((team) => team.name === user?.team);
        if (fromUserTeam && teamEntries.some((entry) => entry.team.name === fromUserTeam.name)) {
            return fromUserTeam;
        }
        return teamEntries[0]?.team || fromUserTeam || null;
    }, [teamEntries, allTeams, user]);

    const careerStats = useMemo(() => aggregateSeasonStats(coachStats), [coachStats]);

    const statSeasons = useMemo(
        () =>
            [...new Set(coachStats.map((row) => row.season_number))]
                .filter((value) => value != null)
                .sort((a, b) => b - a),
        [coachStats]
    );

    const statsSeasonRows = useMemo(
        () =>
            statsSeasonView === 'career'
                ? coachStats
                : coachStats.filter((row) => row.season_number === statsSeasonView),
        [coachStats, statsSeasonView]
    );

    const displayedStats = useMemo(
        () => (statsSeasonView === 'career' ? careerStats : aggregateSeasonStats(statsSeasonRows)),
        [statsSeasonView, careerStats, statsSeasonRows]
    );

    const displayedRecord = useMemo(() => {
        if (statsSeasonView === 'career') {
            return { wins: user?.wins || 0, losses: user?.losses || 0 };
        }
        return statsSeasonRows.reduce(
            (acc, row) => ({ wins: acc.wins + (row.wins || 0), losses: acc.losses + (row.losses || 0) }),
            { wins: 0, losses: 0 }
        );
    }, [statsSeasonView, statsSeasonRows, user]);

    const recordByTeam = useMemo(() => {
        const record = {};
        coachStats.forEach((row) => {
            if (!row.team) {
                return;
            }
            if (!record[row.team]) {
                record[row.team] = { wins: 0, losses: 0 };
            }
            record[row.team].wins += row.wins || 0;
            record[row.team].losses += row.losses || 0;
        });
        return record;
    }, [coachStats]);

    const isAdmin = checkIfUserIsAdmin();

    useEffect(() => {
        if (seasonView == null) {
            return;
        }
        if (searchParams.get('season') === String(seasonView)) {
            return;
        }
        const next = new URLSearchParams(searchParams);
        next.set('season', String(seasonView));
        setSearchParams(next, { replace: true });
    }, [seasonView]);

    const colorFor = (teamName) => pickTeamColor(teamsMap[teamName], mode);
    const eloLines = useMemo(
        () => buildTrendLines({ seriesByTeam, metric: 'elo', seasonView, colorFor }),
        [seriesByTeam, seasonView, teamsMap, mode]
    );
    const rankLines = useMemo(
        () => buildTrendLines({ seriesByTeam, metric: 'rank', seasonView, colorFor }),
        [seriesByTeam, seasonView, teamsMap, mode]
    );

    if (loading) {
        return (
            <PageWrap>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            </PageWrap>
        );
    }

    if (!user) {
        return (
            <PageWrap>
                <PageHeading eyebrow="Coach profile" title="Coach not found" />
                <Box sx={{ color: 'var(--text-muted)' }}>No coach found for &quot;{decodedName}&quot;.</Box>
            </PageWrap>
        );
    }

    const eloBounds = trendBounds(eloLines, 25);
    const seasonLabel = seasonView === 'alltime' ? 'All seasons' : `Season ${seasonView}`;

    const tabOptions = [
        { value: 'overview', label: 'Overview' },
        { value: 'stats', label: 'Stats' },
        ...(eloLines.length > 0 || rankLines.length > 0 ? [{ value: 'trends', label: 'Trends' }] : []),
        { value: 'history', label: 'History' },
    ];
    const shownTab = tabOptions.some((option) => option.value === searchParams.get('tab'))
        ? searchParams.get('tab')
        : 'overview';
    const setTab = (next) => {
        const params = new URLSearchParams(searchParams);
        if (next === 'overview') {
            params.delete('tab');
        } else {
            params.set('tab', next);
        }
        setSearchParams(params, { replace: true });
    };

    return (
        <PageWrap>
            <CoachHeader
                user={user}
                team={primaryTeam}
                mark={primaryTeam ? teamsMap[primaryTeam.name] : null}
                championSeason={championSeason}
            />

            <Box sx={{ mt: '12px' }}>
                <PageTabs
                    value={shownTab}
                    onChange={setTab}
                    options={tabOptions}
                    ariaLabel="Coach sections"
                    trailing={
                        isAdmin && (
                            <Box
                                component="button"
                                type="button"
                                onClick={() => setEditing(true)}
                                sx={compact(secondaryButtonSx)}
                            >
                                Edit coach
                            </Box>
                        )
                    }
                />
            </Box>

            {shownTab === 'overview' && (
                <>
                    <SectionTitle title="Coaching record" />
                    <TileGrid minTile={130}>
                        <StatTile
                            compact
                            label="All-time record"
                            value={`${user.wins || 0}-${user.losses || 0}`}
                            caption={`${user.conference_wins || 0}-${user.conference_losses || 0} conference`}
                        />
                        <StatTile compact label="Win percentage" value={formatWinPct(user.win_percentage)} />
                        <StatTile compact label="National titles" value={user.national_championship_wins || 0} />
                        <StatTile compact label="Conference titles" value={user.conference_championship_wins || 0} />
                        <StatTile
                            compact
                            label="Playoff record"
                            value={`${user.playoff_wins || 0}-${user.playoff_losses || 0}`}
                        />
                        <StatTile
                            compact
                            label="Bowl record"
                            value={`${user.bowl_wins || 0}-${user.bowl_losses || 0}`}
                        />
                    </TileGrid>
                    {teamEntries.length > 0 && (
                        <>
                            <SectionTitle title={teamEntries.length > 1 ? 'Current programs' : 'Current program'} />
                            <CurrentTeamsPanel entries={teamEntries} teamsMap={teamsMap} />
                        </>
                    )}
                </>
            )}

            {shownTab === 'stats' && (
                <>
                    {statSeasons.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '12px' }}>
                            <SelectPill
                                label="Viewing"
                                value={statsSeasonView}
                                onChange={(next) => setStatsSeasonView(next === 'career' ? 'career' : Number(next))}
                                options={[
                                    { value: 'career', label: 'Career' },
                                    ...statSeasons.map((option) => ({ value: option, label: `Season ${option}` })),
                                ]}
                            />
                        </Box>
                    )}
                    <TileGrid>
                        <StatTile
                            label="Total games"
                            value={displayedRecord.wins + displayedRecord.losses}
                            caption={`${displayedRecord.wins}-${displayedRecord.losses}`}
                        />
                        {statsSeasonView === 'career' && (
                            <StatTile
                                label="Average response"
                                value={
                                    user.average_response_time ? formatResponseTime(user.average_response_time) : 'N/A'
                                }
                            />
                        )}
                        {statsSeasonView === 'career' && (
                            <StatTile label="Delay of game" value={user.delay_of_game_instances || 0} />
                        )}
                        {displayedStats && <StatTile label="Total yards" value={num(displayedStats.total_yards)} />}
                        {displayedStats && (
                            <StatTile label="Yards per play" value={dec(displayedStats.average_yards_per_play, 2)} />
                        )}
                        {displayedStats && <StatTile label="Touchdowns" value={num(displayedStats.touchdowns)} />}
                        {displayedStats && (
                            <StatTile label="Avg offensive diff" value={dec(displayedStats.average_offensive_diff)} />
                        )}
                        {displayedStats && (
                            <StatTile label="Avg defensive diff" value={dec(displayedStats.average_defensive_diff)} />
                        )}
                        {displayedStats && (
                            <StatTile label="Turnover diff" value={signed(displayedStats.turnover_differential)} />
                        )}
                        {displayedStats && (
                            <StatTile label="3rd down %" value={pct(displayedStats.third_down_conversion_percentage)} />
                        )}
                        {displayedStats && (
                            <StatTile label="Red zone %" value={pct(displayedStats.red_zone_success_percentage)} />
                        )}
                    </TileGrid>
                    {displayedStats && (
                        <Panel sx={{ mt: '16px' }}>
                            <SeasonStatTable stats={displayedStats} />
                        </Panel>
                    )}
                    {coachStats.length === 0 && (
                        <Panel sx={{ mt: '16px' }}>
                            <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                                Detailed stats for this coach haven&apos;t been generated yet. They fill in after the
                                coach&apos;s next finished game, or when stats are regenerated in Stats Management.
                            </Box>
                        </Panel>
                    )}
                </>
            )}

            {shownTab === 'trends' && (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '12px' }}>
                        <SelectPill
                            label="Viewing"
                            value={seasonView ?? ''}
                            onChange={(next) => setSeasonView(next === 'alltime' ? 'alltime' : Number(next))}
                            options={[
                                ...seasons.map((option) => ({ value: option, label: `Season ${option}` })),
                                { value: 'alltime', label: 'All-time' },
                            ]}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: eloLines.length > 0 && rankLines.length > 0 ? '1fr 1fr' : '1fr',
                            },
                            gap: '16px',
                        }}
                    >
                        {eloLines.length > 0 && (
                            <Panel header="ELO trend" more={seasonLabel} sx={{ overflow: 'visible' }}>
                                <Box sx={{ p: 2, pb: 0 }}>
                                    <MultiLineChart
                                        lines={eloLines}
                                        yMin={eloBounds.yMin}
                                        yMax={eloBounds.yMax}
                                        height={260}
                                        label={(p) => `Season ${p.season}, Week ${p.week}, ELO ${p.val}`}
                                    />
                                </Box>
                                <TrendLegend lines={eloLines} teamsMap={teamsMap} />
                            </Panel>
                        )}
                        {rankLines.length > 0 && (
                            <Panel header="Coaches poll" more={seasonLabel} sx={{ overflow: 'visible' }}>
                                <Box sx={{ p: 2, pb: 0 }}>
                                    <MultiLineChart
                                        lines={rankLines}
                                        yMin={1}
                                        yMax={25}
                                        invert
                                        yTicks={POLL_TICKS}
                                        height={260}
                                        label={(p) => `Season ${p.season}, Week ${p.week}, #${p.val}`}
                                    />
                                </Box>
                                <TrendLegend lines={rankLines} teamsMap={teamsMap} />
                            </Panel>
                        )}
                    </Box>
                </>
            )}

            {shownTab === 'history' &&
                (stints.length > 0 ? (
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
                                const teamId = teamsMap[stint.team]?.id;
                                return (
                                    <Box
                                        component={teamId ? Link : 'tr'}
                                        to={teamId ? `/team-details/${teamId}` : undefined}
                                        key={`${stint.team}-${index}`}
                                        sx={{
                                            display: 'table-row',
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            cursor: teamId ? 'pointer' : 'default',
                                        }}
                                    >
                                        <td className="lft stick">
                                            <Box className="teamcell">
                                                <TeamMark team={teamsMap[stint.team]} size={22} />
                                                <span className="nm">{stint.team}</span>
                                                {active && (
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            fontSize: '0.56rem',
                                                            fontWeight: 800,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.04em',
                                                            color: 'var(--field)',
                                                            border: '1px solid color-mix(in srgb, var(--field) 55%, var(--line))',
                                                            borderRadius: 'var(--r-sm)',
                                                            px: '5px',
                                                            py: '2px',
                                                        }}
                                                    >
                                                        Current
                                                    </Box>
                                                )}
                                            </Box>
                                        </td>
                                        <td className="lft">{formatPosition(stint.position)}</td>
                                        <td className="num">
                                            {recordByTeam[stint.team]
                                                ? `${recordByTeam[stint.team].wins}-${recordByTeam[stint.team].losses}`
                                                : '-'}
                                        </td>
                                        <td className="lft">
                                            {stint.startDate ? formatStintDate(stint.startDate) : 'Unknown'}
                                        </td>
                                        <td className="lft" style={{ color: active ? 'var(--field)' : undefined }}>
                                            {active ? 'Present' : formatStintDate(stint.endDate)}
                                        </td>
                                    </Box>
                                );
                            })}
                        </tbody>
                    </DataTable>
                ) : (
                    <Panel>
                        <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                            No permanent coaching stints on record.
                        </Box>
                    </Panel>
                ))}
            {editing && (
                <CoachEditDialog
                    username={user.username}
                    user={signedInUser}
                    onClose={() => setEditing(false)}
                    onSaved={() => {
                        setEditing(false);
                        setVersion((current) => current + 1);
                    }}
                />
            )}
        </PageWrap>
    );
};

UserDetails.propTypes = { user: PropTypes.object };

export default UserDetails;
