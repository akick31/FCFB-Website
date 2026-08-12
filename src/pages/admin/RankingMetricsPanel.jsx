import React, { useEffect, useMemo, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import { computeRankingMetrics, backfillRankingMetrics, getRankingMetrics, getValidRankingMetricWeeks } from '../../api/rankingMetricApi';
import { getAllSeasons } from '../../api/seasonApi';
import { RANKING_METRIC_TYPES, rankingMetricShortLabel, rankingMetricHigherIsBetter, rankingMetricDescription } from '../../constants/rankingMetrics';
import { weekLabel } from '../../utils/formatText';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', py: '10px', font: 'inherit', fontSize: '0.85rem' };
const selectSx = { ...inputSx, cursor: 'pointer', '& option': { background: 'var(--surface-2)', color: 'var(--text)' } };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '18px', py: '10px', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const btnGhostSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '16px', py: '10px', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };

const RankingMetricsPanel = () => {
    const [seasons, setSeasons] = useState([]);
    const [season, setSeason] = useState('');
    const [validWeeks, setValidWeeks] = useState([]);
    const [week, setWeek] = useState('');
    const [computing, setComputing] = useState(false);
    const [computeError, setComputeError] = useState('');
    const [computeResult, setComputeResult] = useState(null);

    const [backfilling, setBackfilling] = useState(false);
    const [backfillError, setBackfillError] = useState('');
    const [backfillResult, setBackfillResult] = useState(null);

    const [previewMetric, setPreviewMetric] = useState(RANKING_METRIC_TYPES[0].value);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewRows, setPreviewRows] = useState(null);

    useEffect(() => {
        let active = true;
        getAllSeasons().then((data) => {
            if (!active) return;
            const seasonNumbers = [...new Set((data || [])
                .map((entry) => entry.season_number ?? entry.seasonNumber)
                .filter((value) => value != null))].sort((a, b) => b - a);
            setSeasons(seasonNumbers);
            setSeason((current) => current || seasonNumbers[0] || '');
        }).catch(() => { if (active) setSeasons([]); });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!season) { setValidWeeks([]); return undefined; }
        let active = true;
        getValidRankingMetricWeeks(Number(season)).then((weeks) => {
            if (!active) return;
            setValidWeeks(weeks || []);
            setWeek((current) => (weeks?.includes(Number(current)) ? current : weeks?.[weeks.length - 1] || ''));
        }).catch(() => { if (active) { setValidWeeks([]); setWeek(''); } });
        return () => { active = false; };
    }, [season]);

    const loadPreview = async (seasonValue, weekValue, metricValue) => {
        if (!seasonValue || !weekValue) return;
        setPreviewLoading(true);
        try {
            const rows = await getRankingMetrics(Number(seasonValue), Number(weekValue), metricValue);
            const higherIsBetter = rankingMetricHigherIsBetter(metricValue);
            const sorted = [...(rows || [])].sort((a, b) => (higherIsBetter ? b.value - a.value : a.value - b.value));
            setPreviewRows(sorted);
        } catch {
            setPreviewRows([]);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleCompute = async () => {
        setComputeError('');
        setComputeResult(null);
        if (!season || !week) {
            setComputeError('Provide a season and week.');
            return;
        }
        setComputing(true);
        try {
            const result = await computeRankingMetrics(Number(season), Number(week));
            setComputeResult(result);
            await loadPreview(season, week, previewMetric);
        } catch (err) {
            setComputeError(err.message);
        } finally {
            setComputing(false);
        }
    };

    const changePreviewMetric = (value) => {
        setPreviewMetric(value);
        loadPreview(season, week, value);
    };

    const handleBackfill = async () => {
        setBackfillError('');
        setBackfillResult(null);
        if (!season) {
            setBackfillError('Provide a season.');
            return;
        }
        setBackfilling(true);
        try {
            const results = await backfillRankingMetrics(Number(season));
            setBackfillResult(results);
            const lastWeek = results?.[results.length - 1]?.week;
            if (lastWeek) {
                setWeek(lastWeek);
                await loadPreview(season, lastWeek, previewMetric);
            }
        } catch (err) {
            setBackfillError(err.message);
        } finally {
            setBackfilling(false);
        }
    };

    const weekOptionLabel = useMemo(() => (week ? weekLabel(Number(week)) : ''), [week]);

    return (
        <Panel header="Compute ranking metrics">
            <Box sx={{ p: '18px', maxWidth: 720 }}>
                <Box sx={{ color: 'var(--text-muted)', fontSize: '0.82rem', mb: '18px' }}>
                    Recomputes Pythagorean EQW, Margin of Victory, Scoring Offense, Scoring Defense, Nutter Power Rating,
                    Colley Matrix, ASR, and Composite for every team using season-to-date results through the selected week.
                    Re-running for the same season/week replaces the previously computed values.
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', mb: '14px' }}>
                    <Box>
                        <Box sx={labelSx}>Season</Box>
                        <Box component="select" value={season} onChange={(e) => setSeason(e.target.value)} sx={selectSx}>
                            {seasons.length === 0 && <option value="">No seasons found</option>}
                            {seasons.map((option) => <option key={option} value={option}>Season {option}</option>)}
                        </Box>
                    </Box>
                    <Box>
                        <Box sx={labelSx}>Week</Box>
                        <Box component="select" value={week} onChange={(e) => setWeek(e.target.value)} sx={selectSx}>
                            {validWeeks.length === 0 && <option value="">No completed weeks</option>}
                            {validWeeks.map((option) => <option key={option} value={option}>{weekLabel(option)}</option>)}
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', mb: '14px' }}>
                    <Box component="button" type="button" onClick={handleCompute} disabled={computing || !week} sx={{ ...btnPrimarySx, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {computing && <CircularProgress size={16} sx={{ color: '#fff' }} />}
                        Recompute for {weekOptionLabel || 'week'}
                    </Box>
                    <Box component="button" type="button" onClick={handleBackfill} disabled={backfilling || !season} title="Recomputes every completed week of the season, in order" sx={{ ...btnGhostSx, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {backfilling && <CircularProgress size={16} />}
                        Backfill entire season
                    </Box>
                </Box>

                {computeError && <Alert severity="error" sx={{ mb: '14px' }}>{computeError}</Alert>}
                {computeResult && (
                    <Alert severity="success" sx={{ mb: '14px' }}>
                        Computed {computeResult.metricTypesComputed.length} metrics for {computeResult.teamsProcessed} teams
                        (Season {computeResult.season}, {weekOptionLabel}).
                    </Alert>
                )}
                {backfillError && <Alert severity="error" sx={{ mb: '14px' }}>{backfillError}</Alert>}
                {backfillResult && (
                    <Alert severity="success" sx={{ mb: '14px' }}>
                        Backfilled {backfillResult.length} week{backfillResult.length === 1 ? '' : 's'} for Season {season}
                        {backfillResult.length > 0 ? ` (weeks ${backfillResult[0].week}-${backfillResult[backfillResult.length - 1].week})` : ''}.
                    </Alert>
                )}

                <Box sx={{ mt: '10px' }}>
                    <Box sx={labelSx}>Preview metric</Box>
                    <Box component="select" value={previewMetric} onChange={(e) => changePreviewMetric(e.target.value)} sx={{ ...selectSx, maxWidth: 260 }}>
                        {RANKING_METRIC_TYPES.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
                    </Box>
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', mt: '6px' }}>
                        {rankingMetricDescription(previewMetric)}
                    </Box>
                </Box>

                <Box sx={{ mt: '14px' }}>
                    {previewLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>
                    ) : !previewRows || previewRows.length === 0 ? (
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                            No computed values yet for this season/week/metric. Recompute above to populate this preview.
                        </Box>
                    ) : (
                        <DataTable minWidth={420}>
                            <thead>
                                <tr>
                                    <th className="lft stick">Team</th>
                                    <th className="lft">Record</th>
                                    <th>{rankingMetricShortLabel(previewMetric)}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewRows.map((row) => (
                                    <tr key={row.teamId}>
                                        <td className="lft stick">{row.teamName}</td>
                                        <td className="lft">{row.wins != null ? `${row.wins}-${row.losses ?? 0}` : '-'}</td>
                                        <td>{row.value.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </DataTable>
                    )}
                </Box>
            </Box>
        </Panel>
    );
};

export default RankingMetricsPanel;
