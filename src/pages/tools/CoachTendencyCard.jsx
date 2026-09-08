import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import Panel from '../../components/ui/Panel';
import SectionTitle from '../../components/ui/SectionTitle';
import SelectPill from '../../components/ui/SelectPill';
import SearchableSelect from '../../components/ui/SearchableSelect';
import StatTile, { TileGrid } from '../../components/ui/StatTile';
import DataTable from '../../components/ui/DataTable';
import { getAllUsers } from '../../api/userApi';
import { getAllPlaysByDiscordId } from '../../api/playApi';
import { getGamesByIds } from '../../api/gameApi';
import { getCoachStats } from '../../api/coachStatsApi';
import { getAllSeasons, getCurrentSeason } from '../../api/seasonApi';
import { aggregateSeasonStats } from '../../utils/aggregateStats';
import { orderedGameIdsFromPlays } from '../../utils/scoutingReport';
import { playCallSplit, playCallByDown, fourthDownTendency, kickoffTypeSplit, tempoSplit } from '../../utils/tendencies';
import { formatResponseTime } from '../../utils/timeUtils';
import { humanizeEnumValue } from '../../utils/humanize';
import { useSeo } from '../../hooks/useSeo';

const userLabel = (user) => (user.team ? `${user.username} (${user.team})` : user.username);
const num = (value) => (value == null ? '-' : Number(value).toLocaleString());
const dec = (value, digits = 2) => (value == null ? '-' : Number(value).toFixed(digits));
const statPct = (value) => (value == null ? '-' : `${Number(value).toFixed(1)}%`);
const signed = (value) => (value == null ? '-' : (value > 0 ? `+${value}` : `${value}`));
const sharePct = (value) => (value == null ? '-' : `${(value * 100).toFixed(1)}%`);

const CONTROL_HEIGHT = '34px';
const inputSx = { height: CONTROL_HEIGHT, boxSizing: 'border-box', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: 0, font: 'inherit', fontSize: '0.8rem' };
const btnSx = { height: CONTROL_HEIGHT, boxSizing: 'border-box', display: 'flex', alignItems: 'center', border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.5, cursor: 'not-allowed' } };
const labelSx = { fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' };

const CoachTendencyCard = () => {
    useSeo({ title: 'Coach Tendency Card | Fake College Football', description: 'Auto-generated play-calling tendencies for a coach.' });

    const [searchParams, setSearchParams] = useSearchParams();
    const autoRanRef = useRef(false);
    const [users, setUsers] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [seasonView, setSeasonView] = useState('alltime');
    const [loadingLookups, setLoadingLookups] = useState(true);

    const [targetLabel, setTargetLabel] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [card, setCard] = useState(null);

    useEffect(() => {
        Promise.all([getAllUsers().catch(() => []), getCurrentSeason().catch(() => null), getAllSeasons().catch(() => [])])
            .then(([allUsers, current, allSeasons]) => {
                setUsers(allUsers || []);
                const seasonList = (allSeasons || []).map((entry) => entry.season_number ?? entry.seasonNumber).filter((value) => value != null).sort((a, b) => b - a);
                setSeasons(seasonList);
                const currentNumber = current?.season_number;
                setSeasonView(currentNumber != null && seasonList.includes(currentNumber) ? currentNumber : (seasonList[0] ?? 'alltime'));
            })
            .finally(() => setLoadingLookups(false));
    }, []);

    const targetOptions = useMemo(
        () => users.filter((user) => user.discord_id).map((user) => ({ value: user.discord_id, label: userLabel(user) })).sort((a, b) => a.label.localeCompare(b.label)),
        [users],
    );
    const resolvedTarget = useMemo(() => targetOptions.find((option) => option.label === targetLabel)?.value ?? null, [targetOptions, targetLabel]);

    const generate = async (overrideTarget = resolvedTarget, overrideSeason = seasonView) => {
        const overrideUser = users.find((user) => user.discord_id === overrideTarget) || null;
        if (!overrideTarget || !overrideUser) {
            setError('Pick a coach first.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const [seasonRows, plays] = await Promise.all([
                getCoachStats(overrideUser.username).catch(() => []),
                getAllPlaysByDiscordId(overrideTarget).catch(() => []),
            ]);

            let scopedPlays = plays;
            if (overrideSeason !== 'alltime') {
                const gameIds = orderedGameIdsFromPlays(plays);
                const games = await getGamesByIds(gameIds).catch(() => []);
                const gameMap = {};
                (games || []).forEach((game) => { gameMap[game.game_id] = game; });
                scopedPlays = plays.filter((play) => gameMap[play.game_id]?.season === overrideSeason);
            }

            const statsRows = overrideSeason === 'alltime' ? seasonRows : seasonRows.filter((row) => row.season_number === overrideSeason);
            const stats = aggregateSeasonStats(statsRows);
            const record = statsRows.reduce((acc, row) => ({ wins: acc.wins + (row.wins || 0), losses: acc.losses + (row.losses || 0) }), { wins: 0, losses: 0 });

            setCard({
                coach: overrideUser,
                stats,
                record,
                split: playCallSplit(scopedPlays, 'coach', overrideTarget),
                byDown: playCallByDown(scopedPlays, 'coach', overrideTarget),
                fourthDown: fourthDownTendency(scopedPlays, 'coach', overrideTarget),
                kickoff: kickoffTypeSplit(scopedPlays, 'coach', overrideTarget),
                tempo: tempoSplit(scopedPlays, 'coach', overrideTarget),
            });
            setSearchParams({ coach: overrideTarget, season: String(overrideSeason) }, { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (targetOptions.length === 0 || autoRanRef.current) return;
        autoRanRef.current = true;
        const urlTarget = searchParams.get('coach');
        const urlSeason = searchParams.get('season');
        const option = targetOptions.find((entry) => entry.value === urlTarget);
        if (option) setTargetLabel(option.label);
        const resolvedSeason = urlSeason ? (urlSeason === 'alltime' ? 'alltime' : Number(urlSeason)) : seasonView;
        if (urlSeason) setSeasonView(resolvedSeason);
        if (option) generate(option.value, resolvedSeason);
    }, [targetOptions]);

    return (
        <PageWrap>
            <PageHeading eyebrow="Tools" title="Coach Tendency Card" />

            <Panel sx={{ mb: '16px' }}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <Box sx={{ flex: '1 1 260px', minWidth: 220 }}>
                            <Box sx={{ ...labelSx, mb: '6px' }}>Coach</Box>
                            {loadingLookups ? <Box sx={{ ...inputSx, color: 'var(--text-dim)' }}>Loading…</Box> : (
                                <SearchableSelect id="coach-tendency-target" value={targetLabel} onChange={setTargetLabel} options={targetOptions} placeholder="Search coaches…" />
                            )}
                        </Box>
                        <Box sx={{ flex: '0 0 auto' }}>
                            <Box sx={{ ...labelSx, mb: '6px' }}>Scope</Box>
                            <SelectPill
                                value={seasonView}
                                onChange={(next) => setSeasonView(next === 'alltime' ? 'alltime' : Number(next))}
                                options={[...seasons.map((option) => ({ value: option, label: `Season ${option}` })), { value: 'alltime', label: 'Career' }]}
                                ariaLabel="Season scope"
                            />
                        </Box>
                        <Box component="button" type="button" onClick={() => generate()} disabled={loading || !resolvedTarget} sx={btnSx}>
                            {loading ? 'Generating…' : 'Generate card'}
                        </Box>
                    </Box>
                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
            </Panel>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}

            {!loading && card && (
                <>
                    <SectionTitle title={`@${card.coach.username}`} note={card.coach.coach_name} />
                    <TileGrid>
                        <StatTile label="Total games" value={num(card.record.wins + card.record.losses)} caption={`${card.record.wins}-${card.record.losses}`} />
                        <StatTile label="Average response" value={card.coach.average_response_time ? formatResponseTime(card.coach.average_response_time) : 'N/A'} />
                        <StatTile label="Total yards" value={card.stats ? num(card.stats.total_yards) : '-'} />
                        <StatTile label="Yards per play" value={card.stats ? dec(card.stats.average_yards_per_play) : '-'} />
                        <StatTile label="Avg offensive diff" value={card.stats ? dec(card.stats.average_offensive_diff) : '-'} />
                        <StatTile label="Avg defensive diff" value={card.stats ? dec(card.stats.average_defensive_diff) : '-'} />
                        <StatTile label="Turnover diff" value={card.stats ? signed(card.stats.turnover_differential) : '-'} />
                        <StatTile label="3rd down %" value={card.stats ? statPct(card.stats.third_down_conversion_percentage) : '-'} />
                        <StatTile label="Red zone %" value={card.stats ? statPct(card.stats.red_zone_success_percentage) : '-'} />
                    </TileGrid>

                    <SectionTitle title="Tendencies" />
                    <Panel sx={{ mb: '16px' }}>
                        <TileGrid minTile={140}>
                            <StatTile compact label="Run rate" value={sharePct(card.split.runPct)} caption={`${card.split.runs} of ${card.split.total} snaps`} />
                            <StatTile compact label="Pass rate" value={sharePct(card.split.passPct)} caption={`${card.split.passes} of ${card.split.total} snaps`} />
                            <StatTile compact label="4th down go-for-it" value={sharePct(card.fourthDown.goForItRate)} caption={`${card.fourthDown.wentForIt} of ${card.fourthDown.attempts} attempts`} />
                            <StatTile compact label="Onside kick rate" value={sharePct(card.kickoff.shares?.KICKOFF_ONSIDE)} caption={`${card.kickoff.counts.KICKOFF_ONSIDE} of ${card.kickoff.total} kicks`} />
                            <StatTile compact label="Squib kick rate" value={sharePct(card.kickoff.shares?.KICKOFF_SQUIB)} caption={`${card.kickoff.counts.KICKOFF_SQUIB} of ${card.kickoff.total} kicks`} />
                            <StatTile compact label="Chew rate" value={sharePct(card.tempo.chewPct)} caption={`${card.tempo.chew} of ${card.tempo.total} snaps`} />
                            <StatTile compact label="Hurry rate" value={sharePct(card.tempo.hurryPct)} caption={`${card.tempo.hurry} of ${card.tempo.total} snaps`} />
                        </TileGrid>
                    </Panel>

                    <SectionTitle title="Favorite play call by down" />
                    <DataTable minWidth={420}>
                        <thead>
                            <tr>
                                <th className="lft stick">Down</th>
                                <th className="lft">Favorite call</th>
                                <th>Share</th>
                                <th>Snaps</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4].map((down) => {
                                const entry = card.byDown[down];
                                return (
                                    <tr key={down}>
                                        <td className="lft stick">{down === 1 ? '1st' : down === 2 ? '2nd' : down === 3 ? '3rd' : '4th'}</td>
                                        <td className="lft">{entry ? humanizeEnumValue(entry.call) : '-'}</td>
                                        <td>{entry ? sharePct(entry.share) : '-'}</td>
                                        <td>{entry ? entry.total : '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </DataTable>
                </>
            )}
        </PageWrap>
    );
};

export default CoachTendencyCard;
