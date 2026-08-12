import React, { useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import SegTabs from '../../components/ui/SegTabs';
import RankingMetricsPanel from './RankingMetricsPanel';
import { uploadRankings } from '../../api/rankingApi';
import { getCurrentSeasonOrLatest, getCurrentWeekOrLatest } from '../../api/seasonApi';
import { weekLabel } from '../../utils/formatText';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '12px', py: '10px', font: 'inherit', fontSize: '0.85rem' };
const selectSx = { ...inputSx, cursor: 'pointer', '& option': { background: 'var(--surface-2)', color: 'var(--text)' } };
const textareaSx = { ...inputSx, fontFamily: 'monospace', resize: 'vertical' };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '18px', py: '10px', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const btnGhostSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '16px', py: '10px', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };

const POLL_TYPES = [
    { value: 'COACHES_POLL', label: 'Coaches Poll' },
    { value: 'PLAYOFF_COMMITTEE', label: 'Playoff Committee' },
];

const WEEK_OPTIONS = [
    ...Array.from({ length: 13 }, (_, index) => ({ value: index + 1, label: weekLabel(index + 1) })),
    { value: 14, label: 'Postseason' },
];

const parseCsvToNames = (text) => {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const parsed = [];
    lines.forEach((line, index) => {
        const columns = line.split(',').map((column) => column.trim());
        if (index === 0 && /team|rank/i.test(line) && !/^\d/.test(columns[0])) return;
        if (columns.length >= 2) {
            const rank = parseInt(columns[0], 10);
            const team = columns.slice(1).join(',').trim();
            if (team) parsed.push({ rank: Number.isNaN(rank) ? null : rank, team });
        } else if (columns[0]) {
            parsed.push({ rank: null, team: columns[0] });
        }
    });
    if (parsed.length > 0 && parsed.every((row) => row.rank != null)) {
        parsed.sort((a, b) => a.rank - b.rank);
    }
    return parsed.map((row) => row.team);
};

const RankingsManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [tab, setTabState] = useState(searchParams.get('tab') || 'polls');
    const [season, setSeasonState] = useState(searchParams.get('season') || '');
    const [week, setWeekState] = useState(searchParams.get('week') ? Number(searchParams.get('week')) : 1);
    const [pollType, setPollTypeState] = useState(searchParams.get('pollType') || 'COACHES_POLL');
    const [namesText, setNamesText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const updateParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value === '' || value == null) next.delete(key); else next.set(key, String(value));
        setSearchParams(next, { replace: true });
    };
    const setSeason = (value) => { setSeasonState(value); updateParam('season', value); };
    const setWeek = (value) => { setWeekState(value); updateParam('week', value); };
    const setPollType = (value) => { setPollTypeState(value); updateParam('pollType', value); };
    const setTab = (value) => { setTabState(value); updateParam('tab', value); };

    useEffect(() => {
        Promise.all([
            getCurrentSeasonOrLatest().catch(() => ''),
            getCurrentWeekOrLatest().catch(() => 1),
        ]).then(([currentSeason, currentWeek]) => {
            if (!searchParams.get('season')) setSeason(currentSeason);
            if (!searchParams.get('week') && currentWeek) setWeek(currentWeek > 14 ? 14 : currentWeek);
        });
    }, []);

    const handleCsvUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setNamesText(parseCsvToNames(String(reader.result)).join('\n'));
        reader.readAsText(file);
        event.target.value = '';
    };

    const downloadTemplate = () => {
        const rows = ['rank,team', ...Array.from({ length: 25 }, (_, index) => `${index + 1},`)];
        const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'rankings_template.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async () => {
        setError('');
        setResult(null);
        const teams = namesText.split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
        if (!season || teams.length === 0) {
            setError('Provide a season and at least one team.');
            return;
        }
        setSubmitting(true);
        try {
            const uploaded = await uploadRankings({ season: Number(season), week: Number(week), pollType, teams });
            setResult(uploaded);
        } catch (submitError) {
            setError(submitError.message);
        } finally {
            setSubmitting(false);
        }
    };

    const pollLabel = POLL_TYPES.find((option) => option.value === pollType)?.label;
    const weekLabel = WEEK_OPTIONS.find((option) => option.value === Number(week))?.label;

    return (
        <AdminLayout title="Rankings">
            <Box sx={{ mb: '16px' }}>
                <SegTabs
                    ariaLabel="Rankings admin section"
                    value={tab}
                    onChange={setTab}
                    options={[
                        { value: 'polls', label: 'Polls' },
                        { value: 'metrics', label: 'Ranking Metrics' },
                    ]}
                />
            </Box>

            {tab === 'metrics' ? (
                <RankingMetricsPanel />
            ) : (
                <Panel header="Upload rankings">
                    <Box sx={{ p: '18px', maxWidth: 640 }}>
                        <Box sx={{ color: 'var(--text-muted)', fontSize: '0.82rem', mb: '18px' }}>
                            Paste the teams in ranked order (one per line, rank = line number), or upload a CSV. Uploading replaces
                            that week&apos;s poll and updates each team&apos;s current ranking.
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', mb: '14px' }}>
                            <Box>
                                <Box sx={labelSx}>Season</Box>
                                <Box component="input" type="number" value={season} onChange={(e) => setSeason(e.target.value)} sx={inputSx} />
                            </Box>
                            <Box>
                                <Box sx={labelSx}>Week</Box>
                                <Box component="select" value={week} onChange={(e) => setWeek(e.target.value)} sx={selectSx}>
                                    {WEEK_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </Box>
                            </Box>
                            <Box>
                                <Box sx={labelSx}>Poll</Box>
                                <Box component="select" value={pollType} onChange={(e) => setPollType(e.target.value)} sx={selectSx}>
                                    {POLL_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ mb: '14px' }}>
                            <Box sx={labelSx}>Teams (ranked order, one per line)</Box>
                            <Box component="textarea" rows={10} value={namesText} onChange={(e) => setNamesText(e.target.value)} placeholder={'Georgia\nOhio State\nMichigan\n...'} sx={textareaSx} />
                        </Box>

                        <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', mb: '14px' }}>
                            <Box component="button" type="button" onClick={downloadTemplate} sx={btnGhostSx}>&darr; CSV template</Box>
                            <Box component="label" sx={{ ...btnGhostSx, display: 'inline-flex', alignItems: 'center' }}>
                                &uarr; Upload CSV
                                <Box component="input" type="file" accept=".csv,text/csv" onChange={handleCsvUpload} sx={{ display: 'none' }} />
                            </Box>
                            <Box component="button" type="button" onClick={handleSubmit} disabled={submitting} sx={{ ...btnPrimarySx, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                {submitting && <CircularProgress size={16} sx={{ color: '#fff' }} />}
                                Upload {pollLabel}, {weekLabel}
                            </Box>
                        </Box>

                        {error && <Alert severity="error">{error}</Alert>}
                        {result && (
                            <Alert severity="success">
                                Uploaded {result.length} teams for {pollLabel}, {weekLabel}, Season {season}.
                            </Alert>
                        )}
                    </Box>
                </Panel>
            )}
        </AdminLayout>
    );
};

export default RankingsManagement;
