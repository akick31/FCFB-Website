import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';
import Panel from '../../ui/Panel';
import SelectPill from '../../ui/SelectPill';
import MultiLineChart from '../../charts/MultiLineChart';
import { getEloHistory } from '../../../api/eloHistoryApi.jsx';
import { pickTeamColor } from '../../../utils/teamColor';
import { activeConferenceList, conferenceLabel } from '../../constants/conferences';

const EloGraphTab = ({ season, teams, teamsMap, mode }) => {
    const [cf, setCf] = useState('TOP');
    const [hidden, setHidden] = useState(() => new Set());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { setHidden(new Set()); }, [cf, season]);

    const toggle = (team) => setHidden((prev) => {
        const next = new Set(prev);
        if (next.has(team)) next.delete(team); else next.add(team);
        return next;
    });

    useEffect(() => {
        let active = true;
        setLoading(true);
        getEloHistory('all', season)
            .then((rows) => { if (active) setData(Array.isArray(rows) ? rows : []); })
            .catch(() => { if (active) setData([]); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [season]);

    const byTeam = useMemo(() => {
        const map = {};
        data.forEach((entry) => {
            const name = entry.team || entry.team_name;
            const wk = entry.week ?? entry.week_number;
            const elo = entry.elo ?? entry.team_elo;
            if (!name || wk == null || elo == null) return;
            (map[name] = map[name] || []).push({ x: +wk, val: Math.round(+elo) });
        });
        Object.values(map).forEach((pts) => pts.sort((a, b) => a.x - b.x));
        return map;
    }, [data]);

    const activeByName = useMemo(() => new Map(teams.map((t) => [t.name, t])), [teams]);
    const confOptions = useMemo(
        () => activeConferenceList().filter((c) => teams.some((t) => t.conference === c.code)).map((c) => ({ value: c.code, label: conferenceLabel(c.code) })),
        [teams],
    );

    const lines = useMemo(() => {
        const names = Object.keys(byTeam).filter((n) => activeByName.has(n));
        const byElo = (a, b) => (activeByName.get(b).current_elo || 0) - (activeByName.get(a).current_elo || 0);
        let selected;
        if (cf === 'TOP') selected = [...names].sort(byElo).slice(0, 25);
        else if (cf === 'ALL') selected = names;
        else selected = names.filter((n) => activeByName.get(n).conference === cf).slice(0, 16);
        return selected.map((name) => ({
            team: name,
            color: pickTeamColor(teamsMap[name], mode),
            pts: byTeam[name],
        }));
    }, [byTeam, activeByName, cf, teamsMap, mode]);

    const bounds = useMemo(() => {
        const vals = lines.flatMap((l) => l.pts.map((p) => p.val));
        if (!vals.length) return null;
        return { mn: Math.min(...vals), mx: Math.max(...vals) };
    }, [lines]);

    const visibleLines = useMemo(() => lines.filter((l) => !hidden.has(l.team)), [lines, hidden]);
    const showOptions = [{ value: 'TOP', label: 'Top 25' }, { value: 'ALL', label: 'All teams' }, ...confOptions];

    return (
        <Box>
            <Box className="controls" sx={{ display: 'flex', gap: 1, mb: 1.75, flexWrap: 'wrap' }}>
                <SelectPill label="Show" value={cf} onChange={setCf} options={showOptions} sx={{ height: 38 }} />
            </Box>
            <Panel header="ELO history" more={`${lines.length} teams, hover a line`}>
                <Box sx={{ p: 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                    ) : !bounds ? (
                        <Box sx={{ color: 'var(--text-muted)', py: 5, textAlign: 'center' }}>No ELO history for this view.</Box>
                    ) : (
                        <>
                            <MultiLineChart
                                lines={visibleLines}
                                height={320}
                                yMin={bounds.mn - 10}
                                yMax={bounds.mx + 10}
                                yTicks={[
                                    { v: bounds.mx, label: bounds.mx },
                                    { v: Math.round((bounds.mn + bounds.mx) / 2), label: Math.round((bounds.mn + bounds.mx) / 2) },
                                    { v: bounds.mn, label: bounds.mn },
                                ]}
                                label={(p) => `Week ${p.x}, ELO ${p.val}`}
                            />
                            {lines.length <= 16 && (
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

EloGraphTab.propTypes = {
    season: PropTypes.number.isRequired,
    teams: PropTypes.array.isRequired,
    teamsMap: PropTypes.object.isRequired,
    mode: PropTypes.string,
};

export default EloGraphTab;
