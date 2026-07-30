import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';
import Panel from '../../ui/Panel';
import SelectPill from '../../ui/SelectPill';
import MultiLineChart from '../../charts/MultiLineChart';
import { getRankingsHistory } from '../../../api/rankingsHistoryApi.jsx';
import { pickTeamColor } from '../../../utils/teamColor';
import { CONFERENCE_ORDER, conferenceLabel } from '../../constants/conferences';

const RankingsGraphTab = ({ season, teams, teamsMap, mode }) => {
    const [cf, setCf] = useState('TOP');
    const [hidden, setHidden] = useState(() => new Set());
    const [games, setGames] = useState([]);
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
        getRankingsHistory('all', season)
            .then((rows) => { if (active) setGames(Array.isArray(rows) ? rows : []); })
            .catch(() => { if (active) setGames([]); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [season]);

    const byTeam = useMemo(() => {
        const map = {};
        const add = (name, wk, rank) => {
            if (!name || wk == null || +wk > 14 || !rank || rank < 1 || rank > 25) return;
            map[name] = map[name] || {};
            map[name][+wk] = rank;
        };
        games.forEach((game) => {
            const wk = game.week ?? game.week_number;
            add(game.home_team, wk, game.home_team_rank);
            add(game.away_team, wk, game.away_team_rank);
        });
        const out = {};
        Object.entries(map).forEach(([name, weeks]) => {
            out[name] = Object.entries(weeks).map(([w, r]) => ({ x: +w, val: r })).sort((a, b) => a.x - b.x);
        });
        return out;
    }, [games]);

    const activeByName = useMemo(() => new Map(teams.map((t) => [t.name, t])), [teams]);
    const confOptions = useMemo(
        () => CONFERENCE_ORDER.filter((c) => teams.some((t) => t.conference === c)).map((c) => ({ value: c, label: conferenceLabel(c) })),
        [teams],
    );

    const lines = useMemo(() => {
        const names = Object.keys(byTeam).filter((n) => activeByName.has(n));
        let selected;
        if (cf === 'TOP') selected = [...names].sort((a, b) => (activeByName.get(b).current_elo || 0) - (activeByName.get(a).current_elo || 0)).slice(0, 25);
        else if (cf === 'ALL') selected = names;
        else selected = names.filter((n) => activeByName.get(n).conference === cf).slice(0, 16);
        return selected.map((name) => ({
            team: name,
            color: pickTeamColor(teamsMap[name], mode),
            pts: byTeam[name],
        }));
    }, [byTeam, activeByName, cf, teamsMap, mode]);

    const visibleLines = useMemo(() => lines.filter((l) => !hidden.has(l.team)), [lines, hidden]);
    const showOptions = [{ value: 'TOP', label: 'Top 25' }, { value: 'ALL', label: 'All teams' }, ...confOptions];

    return (
        <Box>
            <Box className="controls" sx={{ display: 'flex', gap: 1, mb: 1.75, flexWrap: 'wrap' }}>
                <SelectPill label="Show" value={cf} onChange={setCf} options={showOptions} sx={{ height: 38 }} />
            </Box>
            <Panel header="Rankings history" more={`${lines.length} teams, hover a line`}>
                <Box sx={{ p: 2 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                    ) : !lines.length ? (
                        <Box sx={{ color: 'var(--text-muted)', py: 5, textAlign: 'center' }}>No ranked teams in this view.</Box>
                    ) : (
                        <>
                            <MultiLineChart
                                lines={visibleLines}
                                height={320}
                                yMin={1}
                                yMax={25}
                                invert
                                padL={30}
                                padT={14}
                                yTicks={[1, 5, 10, 15, 20, 25].map((v) => ({ v, label: v }))}
                                label={(p) => `Week ${p.x}, #${p.val}`}
                            />
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
