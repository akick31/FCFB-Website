import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Alert,
    Stack,
    CircularProgress,
} from '@mui/material';
import { Download, UploadFile, FormatListNumbered } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminNavigationItems } from '../../config/adminNavigation.jsx';
import { uploadRankings } from '../../api/rankingApi';
import { getCurrentSeasonOrLatest, getCurrentWeekOrLatest } from '../../api/seasonApi';

const POLL_TYPES = [
    { value: 'COACHES_POLL', label: 'Coaches Poll' },
    { value: 'PLAYOFF_COMMITTEE', label: 'Playoff Committee' },
];

const WEEK_OPTIONS = [
    ...Array.from({ length: 13 }, (_, index) => ({ value: index + 1, label: `Week ${index + 1}` })),
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
    const navigationItems = adminNavigationItems;

    const [season, setSeason] = useState('');
    const [week, setWeek] = useState(1);
    const [pollType, setPollType] = useState('COACHES_POLL');
    const [namesText, setNamesText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        Promise.all([
            getCurrentSeasonOrLatest().catch(() => ''),
            getCurrentWeekOrLatest().catch(() => 1),
        ]).then(([currentSeason, currentWeek]) => {
            setSeason(currentSeason);
            if (currentWeek) setWeek(currentWeek > 14 ? 14 : currentWeek);
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
        <DashboardLayout title="Rankings" navigationItems={navigationItems}>
            <Box sx={{ maxWidth: 720 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Upload Rankings</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Paste the teams in ranked order (one per line, rank = line number), or upload a CSV. Uploading replaces
                    that week&apos;s poll and updates each team&apos;s current ranking.
                </Typography>

                <Card>
                    <CardContent>
                        <Stack spacing={2}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <TextField
                                    label="Season"
                                    type="number"
                                    value={season}
                                    onChange={(event) => setSeason(event.target.value)}
                                    sx={{ width: { xs: '100%', sm: 140 } }}
                                />
                                <FormControl sx={{ minWidth: 160 }}>
                                    <InputLabel>Week</InputLabel>
                                    <Select value={week} label="Week" onChange={(event) => setWeek(event.target.value)}>
                                        {WEEK_OPTIONS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ minWidth: 200 }}>
                                    <InputLabel>Poll</InputLabel>
                                    <Select value={pollType} label="Poll" onChange={(event) => setPollType(event.target.value)}>
                                        {POLL_TYPES.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>

                            <TextField
                                label="Teams (ranked order, one per line)"
                                multiline
                                minRows={10}
                                value={namesText}
                                onChange={(event) => setNamesText(event.target.value)}
                                placeholder={'Georgia\nOhio State\nMichigan\n...'}
                            />

                            <Stack direction="row" spacing={2} flexWrap="wrap">
                                <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>
                                    CSV Template
                                </Button>
                                <Button variant="outlined" component="label" startIcon={<UploadFile />}>
                                    Upload CSV
                                    <input hidden type="file" accept=".csv,text/csv" onChange={handleCsvUpload} />
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <FormatListNumbered />}
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    Upload {pollLabel} — {weekLabel}
                                </Button>
                            </Stack>

                            {error && <Alert severity="error">{error}</Alert>}
                            {result && (
                                <Alert severity="success">
                                    Uploaded {result.length} teams for {pollLabel}, {weekLabel}, Season {season}.
                                </Alert>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        </DashboardLayout>
    );
};

export default RankingsManagement;
