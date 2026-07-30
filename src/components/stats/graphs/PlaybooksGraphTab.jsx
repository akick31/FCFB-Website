import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';
import Panel from '../../ui/Panel';
import { getFilteredPlaybookStats } from '../../../api/playbookStatsApi';
import { formatOffensivePlaybook } from '../../../utils/formatText';

const PlaybooksGraphTab = ({ season }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getFilteredPlaybookStats(null, null, season, 0, 1000)
            .then((res) => { if (active) setRows(res?.content || []); })
            .catch(() => { if (active) setRows([]); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [season]);

    const playbooks = useMemo(() => {
        const byPlaybook = new Map();
        rows.forEach((row) => {
            const key = row.offensive_playbook;
            if (!key) return;
            const current = byPlaybook.get(key) || { offensive_playbook: key, total_games: 0, total_yards: 0 };
            current.total_games += row.total_games || 0;
            current.total_yards += row.total_yards || 0;
            byPlaybook.set(key, current);
        });
        return [...byPlaybook.values()]
            .map((row) => ({ ...row, ypp: row.total_games ? row.total_yards / (row.total_games * 130) : 0 }))
            .sort((a, b) => b.ypp - a.ypp);
    }, [rows]);

    const max = useMemo(() => Math.max(1, ...playbooks.map((p) => p.ypp)), [playbooks]);

    return (
        <Panel header="Yards per play by playbook">
            <Box sx={{ p: 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                ) : !playbooks.length ? (
                    <Box sx={{ color: 'var(--text-muted)', py: 5, textAlign: 'center' }}>No playbook data for this season.</Box>
                ) : (
                    playbooks.map((p) => (
                        <Box key={p.offensive_playbook} sx={{ display: 'grid', gridTemplateColumns: '170px 1fr 66px', alignItems: 'center', gap: 1.25, py: 0.75, fontSize: '0.8rem' }}>
                            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formatOffensivePlaybook(p.offensive_playbook)}</Box>
                            <Box sx={{ height: 16, background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
                                <Box sx={{ height: '100%', borderRadius: '3px', background: 'var(--field)', width: `${Math.max(2, (p.ypp / max) * 100)}%` }} />
                            </Box>
                            <Box className="num" sx={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{p.ypp.toFixed(2)}</Box>
                        </Box>
                    ))
                )}
            </Box>
        </Panel>
    );
};

PlaybooksGraphTab.propTypes = {
    season: PropTypes.number.isRequired,
};

export default PlaybooksGraphTab;
