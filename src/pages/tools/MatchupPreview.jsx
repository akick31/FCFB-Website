import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import Panel from '../../components/ui/Panel';
import SectionTitle from '../../components/ui/SectionTitle';
import SelectPill from '../../components/ui/SelectPill';
import SearchableSelect from '../../components/ui/SearchableSelect';
import ComparisonTable from '../../components/ui/ComparisonTable';
import TeamMark from '../../components/ui/TeamMark';
import { useTeamsMap, toEntry } from '../../hooks/useTeamsMap';
import { getAllTeams } from '../../api/teamApi';
import { getAllUsers } from '../../api/userApi';
import { getAllPlaysByTeam, getAllPlaysByDiscordId } from '../../api/playApi';
import { getGamesByIds } from '../../api/gameApi';
import { getScheduleBySeasonAndTeam } from '../../api/scheduleApi';
import { getAllSeasons, getCurrentSeason } from '../../api/seasonApi';
import { getFilteredSeasonStats } from '../../api/seasonStatsApi';
import { getVegasOdds } from '../../api/vegasOddsApi';
import { aggregateSeasonStats } from '../../utils/aggregateStats';
import { STAT_GROUPS, statCell } from '../../utils/teamStatFields';
import { orderedGameIdsFromPlays } from '../../utils/scoutingReport';
import { playCallSplit, playCallByDown, fourthDownTendency, kickoffTypeSplit } from '../../utils/tendencies';
import { teamHeadToHead, coachHeadToHead, resolveHeadCoach } from '../../utils/headToHead';
import { humanizeEnumValue } from '../../utils/humanize';
import { useSeo } from '../../hooks/useSeo';

const statsRows = (result) => {
    if (Array.isArray(result)) return result;
    if (result?.content) return result.content;
    return result ? [result] : [];
};
const firstStats = (result) => statsRows(result)[0] || null;

const computeSeasonRecord = (scheduleRows, teamName) => {
    let wins = 0;
    let losses = 0;
    (scheduleRows || []).forEach((row) => {
        if (!row.finished || row.home_score == null || row.away_score == null) return;
        const isHome = row.home_team === teamName;
        const teamScore = isHome ? row.home_score : row.away_score;
        const oppScore = isHome ? row.away_score : row.home_score;
        if (teamScore > oppScore) wins += 1; else losses += 1;
    });
    return { wins, losses };
};

const CONTROL_HEIGHT = '34px';
const inputSx = { height: CONTROL_HEIGHT, boxSizing: 'border-box', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: 0, font: 'inherit', fontSize: '0.8rem' };
const btnSx = { height: CONTROL_HEIGHT, boxSizing: 'border-box', display: 'flex', alignItems: 'center', border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.5, cursor: 'not-allowed' } };
const labelSx = { fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' };

const pct = (value) => (value == null ? '-' : `${(value * 100).toFixed(1)}%`);

const loadTeamBundle = async (teamName, seasonView, teamRecord) => {
    const [statsData, plays] = await Promise.all([
        getFilteredSeasonStats(teamName, null, seasonView === 'alltime' ? null : seasonView, null, 0, 50).catch(() => null),
        getAllPlaysByTeam(teamName).catch(() => []),
    ]);
    const statsRow = seasonView === 'alltime' ? aggregateSeasonStats(statsRows(statsData)) : firstStats(statsData);

    const allGameIds = orderedGameIdsFromPlays(plays);
    const games = allGameIds.length > 0 ? await getGamesByIds(allGameIds) : [];
    const gameMap = {};
    (games || []).forEach((game) => { gameMap[game.game_id] = game; });

    const scopedPlays = seasonView === 'alltime' ? plays : plays.filter((play) => gameMap[play.game_id]?.season === seasonView);

    let record = teamRecord;
    if (seasonView !== 'alltime') {
        const schedule = await getScheduleBySeasonAndTeam(seasonView, teamName).catch(() => []);
        record = computeSeasonRecord(schedule, teamName);
    }

    return {
        team: teamName,
        plays,
        gameMap,
        statsRow,
        record,
        split: playCallSplit(scopedPlays, 'team', teamName),
        byDown: playCallByDown(scopedPlays, 'team', teamName),
        fourthDown: fourthDownTendency(scopedPlays, 'team', teamName),
        kickoff: kickoffTypeSplit(scopedPlays, 'team', teamName),
    };
};

const MatchupPreview = () => {
    useSeo({ title: 'Matchup Previewer | Fake College Football', description: "Compare two teams' season tendencies side by side." });

    const teamsMap = useTeamsMap();
    const [searchParams, setSearchParams] = useSearchParams();
    const autoRanRef = useRef(false);
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [seasonView, setSeasonView] = useState('alltime');
    const [loadingLookups, setLoadingLookups] = useState(true);

    const [labelA, setLabelA] = useState('');
    const [labelB, setLabelB] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resultA, setResultA] = useState(null);
    const [resultB, setResultB] = useState(null);
    const [teamH2H, setTeamH2H] = useState(null);
    const [coachH2H, setCoachH2H] = useState(null);
    const [spread, setSpread] = useState(null);

    useEffect(() => {
        Promise.all([getAllTeams().catch(() => []), getAllUsers().catch(() => []), getCurrentSeason().catch(() => null), getAllSeasons().catch(() => [])])
            .then(([allTeams, allUsers, current, allSeasons]) => {
                setTeams(allTeams || []);
                setUsers(allUsers || []);
                const seasonList = (allSeasons || []).map((entry) => entry.season_number ?? entry.seasonNumber).filter((value) => value != null).sort((a, b) => b - a);
                setSeasons(seasonList);
                const currentNumber = current?.season_number;
                setSeasonView(currentNumber != null && seasonList.includes(currentNumber) ? currentNumber : (seasonList[0] ?? 'alltime'));
            })
            .finally(() => setLoadingLookups(false));
    }, []);

    const teamOptions = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)).map((team) => ({ value: team.name, label: team.name })), [teams]);
    const resolvedA = useMemo(() => teamOptions.find((option) => option.label === labelA)?.value ?? null, [teamOptions, labelA]);
    const resolvedB = useMemo(() => teamOptions.find((option) => option.label === labelB)?.value ?? null, [teamOptions, labelB]);

    const compare = async (overrideA = resolvedA, overrideB = resolvedB, overrideSeason = seasonView) => {
        if (!overrideA || !overrideB) {
            setError('Pick two teams first.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const teamA = teams.find((team) => team.name === overrideA);
            const teamB = teams.find((team) => team.name === overrideB);
            const [bundleA, bundleB] = await Promise.all([
                loadTeamBundle(overrideA, overrideSeason, { wins: teamA?.overall_wins || 0, losses: teamA?.overall_losses || 0 }),
                loadTeamBundle(overrideB, overrideSeason, { wins: teamB?.overall_wins || 0, losses: teamB?.overall_losses || 0 }),
            ]);
            setResultA(bundleA);
            setResultB(bundleB);

            setTeamH2H(teamHeadToHead(Object.values(bundleA.gameMap), overrideA, overrideB));
            setSpread(await getVegasOdds(overrideA, overrideB).catch(() => null));

            const headCoachA = resolveHeadCoach(users, overrideA);
            const headCoachB = resolveHeadCoach(users, overrideB);
            if (headCoachA && headCoachB) {
                const [coachPlaysA, coachPlaysB] = await Promise.all([
                    getAllPlaysByDiscordId(headCoachA.discord_id).catch(() => []),
                    getAllPlaysByDiscordId(headCoachB.discord_id).catch(() => []),
                ]);
                const combinedGameIds = orderedGameIdsFromPlays([...coachPlaysA, ...coachPlaysB]);
                const combinedGames = combinedGameIds.length > 0 ? await getGamesByIds(combinedGameIds) : [];
                const coachGameMap = {};
                (combinedGames || []).forEach((game) => { coachGameMap[game.game_id] = game; });
                setCoachH2H({
                    ...coachHeadToHead(coachPlaysA, coachPlaysB, headCoachA.discord_id, headCoachB.discord_id, coachGameMap),
                    coachA: headCoachA,
                    coachB: headCoachB,
                });
            } else {
                setCoachH2H(null);
            }
            setSearchParams({ teamA: overrideA, teamB: overrideB, season: String(overrideSeason) }, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (teamOptions.length === 0 || autoRanRef.current) return;
        autoRanRef.current = true;
        const urlTeamA = searchParams.get('teamA');
        const urlTeamB = searchParams.get('teamB');
        const urlSeason = searchParams.get('season');
        const optionA = teamOptions.find((option) => option.value === urlTeamA);
        const optionB = teamOptions.find((option) => option.value === urlTeamB);
        if (optionA) setLabelA(optionA.label);
        if (optionB) setLabelB(optionB.label);
        const resolvedSeason = urlSeason ? (urlSeason === 'alltime' ? 'alltime' : Number(urlSeason)) : seasonView;
        if (urlSeason) setSeasonView(resolvedSeason);
        if (optionA && optionB) compare(optionA.value, optionB.value, resolvedSeason);
    }, [teamOptions]);

    const teamHeader = (name) => {
        const mark = teamsMap[name] || toEntry({ name });
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                <TeamMark team={mark} size={22} />
                <Box component="span">{name}</Box>
            </Box>
        );
    };

    const recordRows = resultA && resultB ? [
        { label: 'Record', away: `${resultA.record.wins}-${resultA.record.losses}`, home: `${resultB.record.wins}-${resultB.record.losses}` },
        { label: 'Run / pass split', away: `${pct(resultA.split.runPct)} / ${pct(resultA.split.passPct)}`, home: `${pct(resultB.split.runPct)} / ${pct(resultB.split.passPct)}` },
        { label: '4th down go-for-it rate', away: `${pct(resultA.fourthDown.goForItRate)} (${resultA.fourthDown.attempts})`, home: `${pct(resultB.fourthDown.goForItRate)} (${resultB.fourthDown.attempts})` },
        { label: 'Onside kick rate', away: pct(resultA.kickoff.shares?.KICKOFF_ONSIDE), home: pct(resultB.kickoff.shares?.KICKOFF_ONSIDE) },
        { label: 'Squib kick rate', away: pct(resultA.kickoff.shares?.KICKOFF_SQUIB), home: pct(resultB.kickoff.shares?.KICKOFF_SQUIB) },
    ] : [];

    const seriesRecord = (h2h, first) => (first ? `${h2h.winsA}-${h2h.winsB}` : `${h2h.winsB}-${h2h.winsA}`) + (h2h.ties ? `-${h2h.ties}` : '');

    const headToHeadRows = resultA && resultB && teamH2H ? [
        {
            label: 'All-time series',
            away: teamH2H.games > 0 ? `${seriesRecord(teamH2H, true)} (${teamH2H.games} meetings)` : 'No meetings on record',
            home: teamH2H.games > 0 ? `${seriesRecord(teamH2H, false)} (${teamH2H.games} meetings)` : 'No meetings on record',
        },
        {
            label: 'Head coach record',
            away: coachH2H ? `@${coachH2H.coachA.username}: ${seriesRecord(coachH2H, true)}${coachH2H.games ? ` (${coachH2H.games})` : ' (no meetings)'}` : 'No head coach on record',
            home: coachH2H ? `@${coachH2H.coachB.username}: ${seriesRecord(coachH2H, false)}${coachH2H.games ? ` (${coachH2H.games})` : ' (no meetings)'}` : 'No head coach on record',
        },
    ] : [];

    const byDownRows = resultA && resultB ? [1, 2, 3, 4].map((down) => ({
        label: `${down === 1 ? '1st' : down === 2 ? '2nd' : down === 3 ? '3rd' : '4th'} down favorite`,
        away: resultA.byDown[down] ? `${humanizeEnumValue(resultA.byDown[down].call)} (${pct(resultA.byDown[down].share)})` : '-',
        home: resultB.byDown[down] ? `${humanizeEnumValue(resultB.byDown[down].call)} (${pct(resultB.byDown[down].share)})` : '-',
    })) : [];

    return (
        <PageWrap>
            <PageHeading eyebrow="Tools" title="Matchup Previewer" />

            <Panel sx={{ mb: '16px' }}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <Box sx={{ flex: '1 1 220px', minWidth: 200 }}>
                            <Box sx={{ ...labelSx, mb: '6px' }}>Team A</Box>
                            {loadingLookups ? <Box sx={{ ...inputSx, color: 'var(--text-dim)' }}>Loading…</Box> : (
                                <SearchableSelect id="matchup-team-a" value={labelA} onChange={setLabelA} options={teamOptions} placeholder="Search teams…" />
                            )}
                        </Box>
                        <Box sx={{ flex: '1 1 220px', minWidth: 200 }}>
                            <Box sx={{ ...labelSx, mb: '6px' }}>Team B</Box>
                            {loadingLookups ? <Box sx={{ ...inputSx, color: 'var(--text-dim)' }}>Loading…</Box> : (
                                <SearchableSelect id="matchup-team-b" value={labelB} onChange={setLabelB} options={teamOptions} placeholder="Search teams…" />
                            )}
                        </Box>
                        <Box sx={{ flex: '0 0 auto' }}>
                            <Box sx={{ ...labelSx, mb: '6px' }}>Scope</Box>
                            <SelectPill
                                value={seasonView}
                                onChange={(next) => setSeasonView(next === 'alltime' ? 'alltime' : Number(next))}
                                options={[...seasons.map((option) => ({ value: option, label: `Season ${option}` })), { value: 'alltime', label: 'All-time' }]}
                                ariaLabel="Season scope"
                            />
                        </Box>
                        <Box component="button" type="button" onClick={() => compare()} disabled={loading || !resolvedA || !resolvedB} sx={btnSx}>
                            {loading ? 'Comparing…' : 'Compare'}
                        </Box>
                    </Box>
                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
            </Panel>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}

            {!loading && resultA && resultB && (
                <>
                    {spread && (
                        <Box sx={{ textAlign: 'center', mb: '16px' }}>
                            <Box sx={{ ...labelSx, mb: '4px' }}>Projected spread</Box>
                            <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--text)' }}>
                                {spread.home_spread === 0 ? 'Even matchup' : `${spread.home_spread < 0 ? resultA.team : resultB.team} favored by ${Math.abs(spread.home_spread)}`}
                            </Box>
                        </Box>
                    )}

                    <SectionTitle title="Overview" />
                    <Panel sx={{ mb: '16px' }}>
                        <ComparisonTable awayHeader={teamHeader(resultA.team)} homeHeader={teamHeader(resultB.team)} sections={[{ rows: recordRows }]} />
                    </Panel>

                    <SectionTitle title="Head-to-head" note="All-time" />
                    <Panel sx={{ mb: '16px' }}>
                        <ComparisonTable awayHeader={teamHeader(resultA.team)} homeHeader={teamHeader(resultB.team)} sections={[{ rows: headToHeadRows }]} />
                    </Panel>

                    <SectionTitle title="Play calling by down" />
                    <Panel sx={{ mb: '16px' }}>
                        <ComparisonTable awayHeader={teamHeader(resultA.team)} homeHeader={teamHeader(resultB.team)} sections={[{ rows: byDownRows }]} />
                    </Panel>

                    {resultA.statsRow && resultB.statsRow && (
                        <>
                            <SectionTitle title="Season statistics" />
                            <Box sx={{ columnCount: { xs: 1, sm: 2, lg: 3 }, columnGap: '16px' }}>
                                {STAT_GROUPS.map(([group, rows]) => (
                                    <Box key={group} sx={{ breakInside: 'avoid', mb: '16px' }}>
                                        <Panel header={group}>
                                            <ComparisonTable
                                                awayHeader={teamHeader(resultA.team)}
                                                homeHeader={teamHeader(resultB.team)}
                                                sections={[{ rows: rows.map((row) => ({ label: row.label, away: statCell(row, resultA.statsRow), home: statCell(row, resultB.statsRow) })) }]}
                                            />
                                        </Panel>
                                    </Box>
                                ))}
                            </Box>
                        </>
                    )}
                </>
            )}
        </PageWrap>
    );
};

export default MatchupPreview;
