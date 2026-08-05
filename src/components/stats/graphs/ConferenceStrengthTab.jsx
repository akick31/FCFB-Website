import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import Panel from '../../ui/Panel';
import SegTabs from '../../ui/SegTabs';
import { getFilteredConferenceStats } from '../../../api/conferenceStatsApi';
import { conferenceLabel, conferenceLogo } from '../../constants/conferences';

const confValue = (conference) => (typeof conference === 'string' ? conference : conference?.name);

const StatPlotsMetrics = [
    { key: 'elo', label: 'Avg ELO', dec: 0 },
    { key: 'off', label: 'Avg Offensive Diff', dec: 0 },
    { key: 'def', label: 'Avg Defensive Diff', dec: 0 },
    { key: 'ypp', label: 'Yards / Play', dec: 2 },
    { key: 'yds', label: 'Total Yards', dec: 0 },
];

const ConferenceStrengthTab = ({ season, teams }) => {
    const [metric, setMetric] = useState('elo');
    const [confs, setConfs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getFilteredConferenceStats(null, season, null, 0, 1000)
            .then((res) => { if (active) setConfs(res?.content || []); })
            .catch(() => { if (active) setConfs([]); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [season]);

    const eloByConf = useMemo(() => {
        const sums = {};
        teams.forEach((t) => {
            if (!t.conference) return;
            const bucket = sums[t.conference] || { total: 0, count: 0 };
            bucket.total += t.current_elo || 0;
            bucket.count += 1;
            sums[t.conference] = bucket;
        });
        const out = {};
        Object.entries(sums).forEach(([c, { total, count }]) => { out[c] = count ? Math.round(total / count) : 0; });
        return out;
    }, [teams]);

    const valueOf = (row) => {
        const conf = confValue(row.conference);
        if (metric === 'elo') return eloByConf[conf] || 0;
        if (metric === 'off') return row.average_offensive_diff || 0;
        if (metric === 'def') return row.average_defensive_diff || 0;
        if (metric === 'ypp') return row.average_yards_per_play || 0;
        return row.total_yards || 0;
    };

    const ascending = metric === 'off';

    const rows = useMemo(() => {
        const list = confs.map((row) => ({ conf: confValue(row.conference), v: valueOf(row) })).filter((r) => r.conf);
        return list.sort((a, b) => (ascending ? a.v - b.v : b.v - a.v));
    }, [confs, metric, eloByConf, ascending]);

    const max = useMemo(() => Math.max(1, ...rows.map((r) => r.v)), [rows]);
    const barPct = (v) => Math.max(2, (v / max) * 100);
    const dec = StatPlotsMetrics.find((m) => m.key === metric)?.dec ?? 0;
    const fmt = (v) => (dec === 2 ? v.toFixed(2) : Math.round(v).toLocaleString());

    return (
        <Box>
            <Box className="controls" sx={{ display: 'flex', gap: 1, mb: 1.75, flexWrap: 'wrap' }}>
                <SegTabs value={metric} onChange={setMetric} options={StatPlotsMetrics.map((m) => ({ value: m.key, label: m.label }))} ariaLabel="Conference metric" />
            </Box>
            <Panel header={`${StatPlotsMetrics.find((m) => m.key === metric)?.label} by conference`}>
                <Box sx={{ p: 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                    ) : !rows.length ? (
                        <Box sx={{ color: 'var(--text-muted)', py: 5, textAlign: 'center' }}>No conference data for this season.</Box>
                    ) : (
                        rows.map((r) => (
                            <Box key={r.conf} sx={{ display: 'grid', gridTemplateColumns: { xs: '110px 1fr 50px', sm: '170px 1fr 70px' }, alignItems: 'center', gap: 1.25, py: 0.75, fontSize: '0.8rem' }}>
                                <Box
                                    component={Link}
                                    to="/standings"
                                    sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', minWidth: 0, textDecoration: 'none', color: 'inherit', '&:hover': { color: 'var(--brand)' }, '&:focus-visible': { outline: '2px solid var(--brand)', outlineOffset: '-2px' } }}
                                >
                                    {conferenceLogo(r.conf) && <Box component="img" src={conferenceLogo(r.conf)} alt="" sx={{ width: 18, height: 18, objectFit: 'contain', flex: '0 0 auto' }} />}
                                    <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conferenceLabel(r.conf)}</Box>
                                </Box>
                                <Box sx={{ height: 16, background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <Box sx={{ height: '100%', borderRadius: '3px', background: 'var(--brand)', width: `${barPct(r.v)}%` }} />
                                </Box>
                                <Box className="num" sx={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmt(r.v)}</Box>
                            </Box>
                        ))
                    )}
                </Box>
            </Panel>
        </Box>
    );
};

ConferenceStrengthTab.propTypes = {
    season: PropTypes.number.isRequired,
    teams: PropTypes.array.isRequired,
};

export default ConferenceStrengthTab;
