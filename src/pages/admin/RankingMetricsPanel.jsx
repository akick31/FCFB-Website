import React from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import useRankingMetrics from '../../hooks/useRankingMetrics';
import {
    RANKING_METRIC_TYPES,
    rankingMetricColumnLabel,
    rankingMetricDescription,
} from '../../constants/rankingMetrics';
import { weekLabel } from '../../utils/formatText';

const labelSx = {
    display: 'block',
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 800,
    color: 'var(--text-dim)',
    mb: '5px',
};
const inputSx = {
    width: '100%',
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    px: '12px',
    py: '10px',
    font: 'inherit',
    fontSize: '0.85rem',
};
const selectSx = {
    ...inputSx,
    cursor: 'pointer',
    '& option': { background: 'var(--surface-2)', color: 'var(--text)' },
};
const btnPrimarySx = {
    border: 0,
    background: 'var(--brand-deep)',
    color: '#fff',
    borderRadius: 'var(--r-sm)',
    px: '18px',
    py: '10px',
    font: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:disabled': { opacity: 0.6, cursor: 'default' },
};
const btnGhostSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text-muted)',
    borderRadius: 'var(--r-sm)',
    px: '16px',
    py: '10px',
    font: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' },
    '&:disabled': { opacity: 0.6, cursor: 'default' },
};

const RankingMetricsPanel = () => {
    const {
        seasons,
        season,
        setSeason,
        validWeeks,
        week,
        setWeek,
        computing,
        computeError,
        computeResult,
        backfilling,
        backfillError,
        backfillResult,
        previewMetric,
        previewLoading,
        previewRows,
        handleCompute,
        changePreviewMetric,
        handleBackfill,
    } = useRankingMetrics();
    const weekOptionLabel = week ? weekLabel(Number(week)) : '';

    return (
        <Panel header="Compute ranking metrics">
            <Box sx={{ p: '18px', maxWidth: 720 }}>
                <Box sx={{ color: 'var(--text-muted)', fontSize: '0.82rem', mb: '18px' }}>
                    Recomputes Pythagorean EQW, Margin of Victory, Scoring Offense, Scoring Defense, Nutter Power
                    Rating, Colley Matrix, ASR, and Composite for every team using season-to-date results through the
                    selected week. Re-running for the same season/week replaces the previously computed values.
                </Box>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '14px',
                        mb: '14px',
                    }}
                >
                    <Box>
                        <Box sx={labelSx}>Season</Box>
                        <Box
                            component="select"
                            value={season}
                            onChange={(e) => setSeason(e.target.value)}
                            sx={selectSx}
                        >
                            {seasons.length === 0 && <option value="">No seasons found</option>}
                            {seasons.map((option) => (
                                <option key={option} value={option}>
                                    Season {option}
                                </option>
                            ))}
                        </Box>
                    </Box>
                    <Box>
                        <Box sx={labelSx}>Week</Box>
                        <Box component="select" value={week} onChange={(e) => setWeek(e.target.value)} sx={selectSx}>
                            {validWeeks.length === 0 && <option value="">No completed weeks</option>}
                            {validWeeks.map((option) => (
                                <option key={option} value={option}>
                                    {weekLabel(option)}
                                </option>
                            ))}
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', mb: '14px' }}>
                    <Box
                        component="button"
                        type="button"
                        onClick={handleCompute}
                        disabled={computing || !week}
                        sx={{ ...btnPrimarySx, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        {computing && <CircularProgress size={16} sx={{ color: '#fff' }} />}
                        Recompute for {weekOptionLabel || 'week'}
                    </Box>
                    <Box
                        component="button"
                        type="button"
                        onClick={handleBackfill}
                        disabled={backfilling || !season}
                        title="Recomputes every completed week of the season, in order"
                        sx={{ ...btnGhostSx, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        {backfilling && <CircularProgress size={16} />}
                        Backfill entire season
                    </Box>
                </Box>

                {computeError && (
                    <Alert severity="error" sx={{ mb: '14px' }}>
                        {computeError}
                    </Alert>
                )}
                {computeResult && (
                    <Alert severity="success" sx={{ mb: '14px' }}>
                        Computed {computeResult.metricTypesComputed.length} metrics for {computeResult.teamsProcessed}{' '}
                        teams (Season {computeResult.season}, {weekOptionLabel}).
                    </Alert>
                )}
                {backfillError && (
                    <Alert severity="error" sx={{ mb: '14px' }}>
                        {backfillError}
                    </Alert>
                )}
                {backfillResult && (
                    <Alert severity="success" sx={{ mb: '14px' }}>
                        Backfilled {backfillResult.length} week{backfillResult.length === 1 ? '' : 's'} for Season{' '}
                        {season}
                        {backfillResult.length > 0
                            ? ` (weeks ${backfillResult[0].week}-${backfillResult[backfillResult.length - 1].week})`
                            : ''}
                        .
                    </Alert>
                )}

                <Box sx={{ mt: '10px' }}>
                    <Box sx={labelSx}>Preview metric</Box>
                    <Box
                        component="select"
                        value={previewMetric}
                        onChange={(e) => changePreviewMetric(e.target.value)}
                        sx={{ ...selectSx, maxWidth: 260 }}
                    >
                        {RANKING_METRIC_TYPES.map((entry) => (
                            <option key={entry.value} value={entry.value}>
                                {entry.label}
                            </option>
                        ))}
                    </Box>
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', mt: '6px' }}>
                        {rankingMetricDescription(previewMetric)}
                    </Box>
                </Box>

                <Box sx={{ mt: '14px' }}>
                    {previewLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : !previewRows || previewRows.length === 0 ? (
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                            No computed values yet for this season/week/metric. Recompute above to populate this
                            preview.
                        </Box>
                    ) : (
                        <DataTable minWidth={420}>
                            <thead>
                                <tr>
                                    <th className="lft stick">Team</th>
                                    <th className="lft">Record</th>
                                    <th>{rankingMetricColumnLabel(previewMetric)}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewRows.map((row) => (
                                    <tr key={row.teamId}>
                                        <td className="lft stick">{row.teamName}</td>
                                        <td className="lft">
                                            {row.wins != null ? `${row.wins}-${row.losses ?? 0}` : '-'}
                                        </td>
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
