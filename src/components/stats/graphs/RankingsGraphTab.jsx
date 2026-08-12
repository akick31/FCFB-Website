import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, FormControlLabel, Checkbox } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import Panel from '../../ui/Panel';
import SelectPill from '../../ui/SelectPill';
import MultiLineChart from '../../charts/MultiLineChart';
import { getEloHistory } from '../../../api/eloHistoryApi.jsx';
import { getRankingsHistory } from '../../../api/rankingsHistoryApi.jsx';
import { getRankingMetricWeeks, getRankingMetrics } from '../../../api/rankingMetricApi';
import { pickTeamColor } from '../../../utils/teamColor';
import { RANKING_METRIC_TYPES, rankingMetricHigherIsBetter, rankingMetricDescription, rankingMetricLabel } from '../../../constants/rankingMetrics';
import { useConferencesMap, useSeasonConferenceCodes, seasonConferenceList, conferenceLabel } from '../../constants/conferences';

const ELO_VALUE = 'ELO';
const POLL_VALUE = 'POLL';
const DEFAULT_RANKING = 'POWER_RATING';
const POSTSEASON_START_WEEK = 14;

const collapsePostseason = (points) => {
    const regular = points.filter((p) => p.x < POSTSEASON_START_WEEK);
    const postseason = points.filter((p) => p.x >= POSTSEASON_START_WEEK);
    if (!postseason.length) return regular;
    return [...regular, { ...postseason[postseason.length - 1], x: POSTSEASON_START_WEEK }];
};

const RankingsGraphTab = ({ season, teams, teamsMap, mode }) => {
    const conferencesMap = useConferencesMap();
    const [searchParams, setSearchParams] = useSearchParams();
    const [ranking, setRanking] = useState(searchParams.get('ranking') || DEFAULT_RANKING);
    const [cf, setCf] = useState(searchParams.get('cf') || 'TOP');
    const [search, setSearch] = useState('');
    const [combinePostseason, setCombinePostseason] = useState(false);
    const [hidden, setHidden] = useState(() => new Set());
    const [rawByTeam, setRawByTeam] = useState({});
    const [loading, setLoading] = useState(true);

    const isElo = ranking === ELO_VALUE;
    const isPoll = ranking === POLL_VALUE;
    const isMetric = !isElo && !isPoll;

    const changeRanking = (value) => {
        setRanking(value);
        const next = new URLSearchParams(searchParams);
        next.set('ranking', value);
        setSearchParams(next, { replace: true });
    };

    const changeCf = (value) => {
        setCf(value);
        const next = new URLSearchParams(searchParams);
        next.set('cf', value);
        setSearchParams(next, { replace: true });
    };

    useEffect(() => { setHidden(new Set()); }, [cf, season, ranking]);

    const toggle = (team) => setHidden((prev) => {
        const next = new Set(prev);
        if (next.has(team)) next.delete(team); else next.add(team);
        return next;
    });

    useEffect(() => {
        let active = true;
        setLoading(true);
        if (isElo) {
            getEloHistory('all', season)
                .then((rows) => {
                    if (!active) return;
                    const map = {};
                    (Array.isArray(rows) ? rows : []).forEach((entry) => {
                        const name = entry.team || entry.team_name;
                        const wk = entry.week ?? entry.week_number;
                        const elo = entry.elo ?? entry.team_elo;
                        if (!name || wk == null || elo == null) return;
                        (map[name] = map[name] || []).push({ x: +wk, val: Math.round(+elo) });
                    });
                    Object.values(map).forEach((pts) => pts.sort((a, b) => a.x - b.x));
                    setRawByTeam(map);
                })
                .catch(() => { if (active) setRawByTeam({}); })
                .finally(() => { if (active) setLoading(false); });
        } else if (isPoll) {
            getRankingsHistory('all', season)
                .then((rows) => {
                    if (!active) return;
                    const map = {};
                    const add = (name, wk, rank) => {
                        if (!name || wk == null || +wk > 14 || !rank || rank < 1 || rank > 25) return;
                        map[name] = map[name] || {};
                        map[name][+wk] = rank;
                    };
                    (Array.isArray(rows) ? rows : []).forEach((game) => {
                        const wk = game.week ?? game.week_number;
                        add(game.home_team, wk, game.home_team_rank);
                        add(game.away_team, wk, game.away_team_rank);
                    });
                    const out = {};
                    Object.entries(map).forEach(([name, weeks]) => {
                        out[name] = Object.entries(weeks).map(([w, r]) => ({ x: +w, val: r })).sort((a, b) => a.x - b.x);
                    });
                    setRawByTeam(out);
                })
                .catch(() => { if (active) setRawByTeam({}); })
                .finally(() => { if (active) setLoading(false); });
        } else {
            getRankingMetricWeeks(season, ranking)
                .then((weeks) => Promise.all((weeks || []).map((week) => getRankingMetrics(season, week, ranking).catch(() => []))))
                .then((byWeek) => {
                    if (!active) return;
                    const map = {};
                    byWeek.flat().forEach((entry) => {
                        if (!entry.teamName || entry.week == null) return;
                        map[entry.teamName] = map[entry.teamName] || [];
                        map[entry.teamName].push({ x: entry.week, val: entry.value });
                    });
                    Object.values(map).forEach((pts) => pts.sort((a, b) => a.x - b.x));
                    setRawByTeam(map);
                })
                .catch(() => { if (active) setRawByTeam({}); })
                .finally(() => { if (active) setLoading(false); });
        }
        return () => { active = false; };
    }, [season, ranking, isElo, isPoll]);

    const byTeam = useMemo(() => {
        if (!combinePostseason) return rawByTeam;
        const out = {};
        Object.entries(rawByTeam).forEach(([name, pts]) => { out[name] = collapsePostseason(pts); });
        return out;
    }, [rawByTeam, combinePostseason]);

    const activeByName = useMemo(() => new Map(teams.map((t) => [t.name, t])), [teams]);
    const seasonConferenceCodes = useSeasonConferenceCodes(season);
    const confOptions = useMemo(
        () => seasonConferenceList(seasonConferenceCodes).map((c) => ({ value: c.code, label: conferenceLabel(c.code) })),
        [seasonConferenceCodes, conferencesMap],
    );

    const higherIsBetter = isMetric ? rankingMetricHigherIsBetter(ranking) : false;

    const lines = useMemo(() => {
        const names = Object.keys(byTeam).filter((n) => activeByName.has(n));
        const query = search.trim().toLowerCase();
        let selected;
        if (query) {
            selected = names.filter((n) => n.toLowerCase().includes(query));
        } else if (cf === 'TOP') {
            if (isMetric) {
                const latestValue = (name) => {
                    const pts = byTeam[name];
                    return pts && pts.length ? pts[pts.length - 1].val : (higherIsBetter ? -Infinity : Infinity);
                };
                selected = [...names].sort((a, b) => (higherIsBetter ? latestValue(b) - latestValue(a) : latestValue(a) - latestValue(b))).slice(0, 25);
            } else {
                selected = [...names].sort((a, b) => (activeByName.get(b).current_elo || 0) - (activeByName.get(a).current_elo || 0)).slice(0, 25);
            }
        } else if (cf === 'ALL') {
            selected = names;
        } else {
            selected = names.filter((n) => activeByName.get(n).conference === cf).slice(0, 16);
        }
        return selected.map((name) => ({
            team: name,
            color: pickTeamColor(teamsMap[name], mode),
            pts: byTeam[name],
        }));
    }, [byTeam, activeByName, cf, search, teamsMap, mode, isMetric, higherIsBetter]);

    const visibleLines = useMemo(() => lines.filter((l) => !hidden.has(l.team)), [lines, hidden]);
    const showOptions = [{ value: 'TOP', label: 'Top 25' }, { value: 'ALL', label: 'All teams' }, ...confOptions];
    const rankingOptions = [
        { value: ELO_VALUE, label: 'ELO' },
        { value: POLL_VALUE, label: 'Coaches Poll' },
        ...RANKING_METRIC_TYPES.map((entry) => ({ value: entry.value, label: entry.label })),
    ];

    const { yMin, yMax, yTicks, invert } = useMemo(() => {
        if (isPoll) {
            return { yMin: 1, yMax: 25, yTicks: [1, 5, 10, 15, 20, 25].map((v) => ({ v, label: v })), invert: true };
        }
        const values = lines.flatMap((l) => l.pts.map((p) => p.val));
        if (!values.length) return { yMin: 0, yMax: 1, yTicks: undefined, invert: false };
        const min = Math.min(...values);
        const max = Math.max(...values);
        if (isElo) {
            return {
                yMin: min - 10,
                yMax: max + 10,
                yTicks: [
                    { v: max, label: max },
                    { v: Math.round((min + max) / 2), label: Math.round((min + max) / 2) },
                    { v: min, label: min },
                ],
                invert: false,
            };
        }
        if (min === max) return { yMin: min - 1, yMax: max + 1, yTicks: undefined, invert: false };
        const pad = (max - min) * 0.08;
        return { yMin: min - pad, yMax: max + pad, yTicks: undefined, invert: false };
    }, [lines, isPoll, isElo]);

    const weekLabel = (x) => (combinePostseason && x === POSTSEASON_START_WEEK ? 'Postseason' : `Week ${x}`);
    const labelFn = isPoll
        ? (p) => `${weekLabel(p.x)}, #${p.val}`
        : isElo
            ? (p) => `${weekLabel(p.x)}, ELO ${p.val}`
            : (p) => `${weekLabel(p.x)}: ${p.val.toFixed(1)}`;
    const panelHeader = isPoll ? 'Coaches Poll' : isElo ? 'ELO' : rankingMetricLabel(ranking);
    const showLegend = !isElo || lines.length <= 16;

    return (
        <Box>
            <Box className="controls" sx={{ display: 'flex', gap: 1, mb: 1.75, flexWrap: 'wrap', alignItems: 'center' }}>
                <SelectPill label="Ranking" value={ranking} onChange={changeRanking} options={rankingOptions} sx={{ height: 38 }} />
                <SelectPill label="Show" value={cf} onChange={changeCf} options={showOptions} sx={{ height: 38 }} />
                <Box
                    component="input"
                    placeholder="Search teams…"
                    aria-label="Search teams"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    sx={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', padding: '6px 10px', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, minWidth: 190, height: '38px', boxSizing: 'border-box', '&::placeholder': { color: 'var(--text-dim)', fontWeight: 400 } }}
                />
                <FormControlLabel
                    control={<Checkbox checked={combinePostseason} onChange={(e) => setCombinePostseason(e.target.checked)} size="small" />}
                    label="Combine postseason into one week"
                    sx={{ m: 0, color: 'var(--text-muted)', '& .MuiFormControlLabel-label': { fontSize: '0.8rem' } }}
                />
            </Box>
            {isMetric && (
                <Box sx={{ color: 'var(--text-muted)', fontSize: '0.82rem', mb: 1.75 }}>
                    {rankingMetricDescription(ranking)}
                </Box>
            )}
            <Panel header={`${panelHeader} history`} more={`${lines.length} teams, hover a line`} sx={{ overflow: 'visible' }}>
                <Box sx={{ p: 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                    ) : !lines.length ? (
                        <Box sx={{ color: 'var(--text-muted)', py: 5, textAlign: 'center' }}>No data for this view yet.</Box>
                    ) : (
                        <>
                            <MultiLineChart
                                lines={visibleLines}
                                height={320}
                                yMin={yMin}
                                yMax={yMax}
                                invert={invert}
                                yTicks={yTicks}
                                padL={isPoll ? 30 : 40}
                                padT={14}
                                label={labelFn}
                            />
                            {showLegend && (
                                <Box sx={{ display: 'flex', gap: 1.75, flexWrap: 'wrap', mt: 1.25, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    {lines.map((l) => (
                                        <Box
                                            key={l.team}
                                            component="span"
                                            onClick={() => toggle(l.team)}
                                            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', opacity: hidden.has(l.team) ? 0.4 : 1, '&:hover': { color: 'var(--brand)' } }}
                                        >
                                            <Box component="i" sx={{ width: '11px', height: '3px', borderRadius: '2px', display: 'inline-block', background: l.color }} />
                                            {l.team}
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Panel>
        </Box>
    );
};

RankingsGraphTab.propTypes = {
    season: PropTypes.number.isRequired,
    teams: PropTypes.array.isRequired,
    teamsMap: PropTypes.object.isRequired,
    mode: PropTypes.string,
};

export default RankingsGraphTab;
