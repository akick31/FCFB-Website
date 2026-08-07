import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import Panel from '../../ui/Panel';
import SelectPill from '../../ui/SelectPill';
import SegTabs from '../../ui/SegTabs';
import LogoScatterChart from '../../charts/LogoScatterChart';
import { getFilteredSeasonStats } from '../../../api/seasonStatsApi';
import { useConferencesMap, activeConferenceList, conferenceLabel } from '../../constants/conferences';
import { pickTeamColor } from '../../../utils/teamColor';

const PLOTS = [
    { key: 'avgdiff', label: 'Average Difference', title: 'Average Difference', xl: 'Offense (avg diff)', yl: 'Defense (avg diff)', invX: true },
    { key: 'downs', label: '3rd/4th Down', title: '3rd/4th Down Success', xl: 'Offense 3rd/4th down %', yl: 'Defense 3rd/4th down %', invX: false },
    { key: 'success', label: 'Success Rate', title: 'Success Rate', xl: 'Offense success rate %', yl: 'Defense success rate %', invX: false },
];

const num = (stat, key) => stat[key] ?? 0;
const round1 = (v) => Math.round(v * 10) / 10;

const StatPlotsGraphTab = ({ season, teams, teamsMap, mode, scope }) => {
    const conferencesMap = useConferencesMap();
    const [searchParams, setSearchParams] = useSearchParams();
    const plotParam = parseInt(searchParams.get('plot'), 10);
    const [cf, setCf] = useState(searchParams.get('cf') || 'ALL');
    const [plotIndex, setPlotIndex] = useState(Number.isFinite(plotParam) && plotParam >= 0 && plotParam < PLOTS.length ? plotParam : 0);
    const [resetNonce, setResetNonce] = useState(0);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const updateParams = (updates) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') next.delete(key);
            else next.set(key, String(value));
        });
        setSearchParams(next, { replace: true });
    };

    const changeCf = (value) => {
        setCf(value);
        updateParams({ cf: value });
    };

    const changePlot = (value) => {
        const idx = PLOTS.findIndex((p) => p.key === value);
        setPlotIndex(idx);
        updateParams({ plot: idx });
    };

    useEffect(() => {
        let active = true;
        setLoading(true);
        getFilteredSeasonStats(null, null, season, null, 0, 1000, scope)
            .then((res) => { if (active) setRows(res?.content || []); })
            .catch(() => { if (active) setRows([]); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [season, scope]);

    const activeNames = useMemo(() => new Set(teams.map((t) => t.name)), [teams]);
    const confByName = useMemo(() => new Map(teams.map((t) => [t.name, t.conference])), [teams]);
    const top25Names = useMemo(
        () => new Set([...teams].sort((a, b) => (b.current_elo || 0) - (a.current_elo || 0)).slice(0, 25).map((t) => t.name)),
        [teams],
    );
    const confOptions = useMemo(
        () => activeConferenceList().filter((c) => teams.some((t) => t.conference === c.code)).map((c) => ({ value: c.code, label: conferenceLabel(c.code) })),
        [teams, conferencesMap],
    );

    const plot = PLOTS[plotIndex];

    const points = useMemo(() => {
        const logoOf = (name) => {
            const entry = teamsMap[name];
            if (!entry) return null;
            return mode === 'dark' && entry.logoDark ? entry.logoDark : entry.logo;
        };
        return rows
            .filter((stat) => activeNames.has(stat.team))
            .filter((stat) => cf === 'ALL' || (cf === 'TOP25' ? top25Names.has(stat.team) : confByName.get(stat.team) === cf))
            .map((stat) => {
                let x = null;
                let y = null;
                if (plot.key === 'avgdiff') {
                    x = stat.average_offensive_diff;
                    y = stat.average_defensive_diff;
                } else if (plot.key === 'downs') {
                    const oAtt = num(stat, 'third_down_conversion_attempts') + num(stat, 'fourth_down_conversion_attempts');
                    const oSuc = num(stat, 'third_down_conversion_success') + num(stat, 'fourth_down_conversion_success');
                    const dAtt = num(stat, 'opponent_third_down_conversion_attempts') + num(stat, 'opponent_fourth_down_conversion_attempts');
                    const dSuc = num(stat, 'opponent_third_down_conversion_success') + num(stat, 'opponent_fourth_down_conversion_success');
                    x = oAtt > 0 ? (oSuc / oAtt) * 100 : null;
                    y = dAtt > 0 ? (dSuc / dAtt) * 100 : null;
                } else {
                    const oAtt = num(stat, 'pass_attempts') + num(stat, 'rush_attempts');
                    const oSuc = num(stat, 'pass_successes') + num(stat, 'rush_successes');
                    const dAtt = num(stat, 'opponent_pass_attempts') + num(stat, 'opponent_rush_attempts');
                    const dSuc = num(stat, 'opponent_pass_successes') + num(stat, 'opponent_rush_successes');
                    x = oAtt > 0 ? (oSuc / oAtt) * 100 : null;
                    y = dAtt > 0 ? (dSuc / dAtt) * 100 : null;
                }
                if (x == null || y == null) return null;
                return { team: stat.team, x: round1(x), y: round1(y), logo: logoOf(stat.team), color: pickTeamColor(teamsMap[stat.team], mode) };
            })
            .filter(Boolean);
    }, [rows, activeNames, confByName, top25Names, cf, plot, teamsMap, mode]);

    const showOptions = [{ value: 'TOP25', label: 'Top 25' }, { value: 'ALL', label: 'All teams' }, ...confOptions];

    return (
        <Box>
            <Box className="controls" sx={{ display: 'flex', gap: 1, mb: 1.75, flexWrap: 'wrap', alignItems: 'center' }}>
                <SegTabs value={plot.key} onChange={changePlot} options={PLOTS.map((p) => ({ value: p.key, label: p.label }))} ariaLabel="Plot metric" />
                <SelectPill label="Show" value={cf} onChange={changeCf} options={showOptions} sx={{ height: 38 }} />
                <Box
                    component="button"
                    type="button"
                    onClick={() => setResetNonce((n) => n + 1)}
                    sx={{ border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', padding: '7px 11px', font: 'inherit', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } }}
                >
                    Reset zoom
                </Box>
            </Box>
            <Panel header={plot.title} more={`${points.length} teams, scroll to zoom, drag to pan, hover a logo`}>
                <Box sx={{ p: 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                    ) : !points.length ? (
                        <Box sx={{ color: 'var(--text-muted)', py: 5, textAlign: 'center' }}>No teams for this view.</Box>
                    ) : (
                        <LogoScatterChart
                            points={points}
                            xLabel={plot.xl}
                            yLabel={plot.yl}
                            invertX={plot.invX}
                            resetKey={`${plot.key}-${cf}-${season}-${resetNonce}`}
                        />
                    )}
                </Box>
            </Panel>
        </Box>
    );
};

StatPlotsGraphTab.propTypes = {
    season: PropTypes.number.isRequired,
    teams: PropTypes.array.isRequired,
    teamsMap: PropTypes.object.isRequired,
    mode: PropTypes.string,
    scope: PropTypes.string,
};

export default StatPlotsGraphTab;
