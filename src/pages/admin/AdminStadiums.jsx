import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Alert, CircularProgress } from '@mui/material';
import AdminLayout from '../../components/layout/AdminLayout';
import BackButton from '../../components/ui/BackButton';
import Panel from '../../components/ui/Panel';
import StadiumEditor from '../../components/stadium/StadiumEditor';
import StadiumPicker from '../../components/stadium/StadiumPicker';
import { buttonSx, inputSx, labelSx, secondaryButtonSx } from '../../components/stadium/stadiumStyles';
import { createStadium, getStadiums, setStadiumActive } from '../../api/stadiumApi';

const usageOf = (stadium) =>
    [
        ...stadium.teams,
        ...stadium.bowls,
        ...stadium.conferences.map((conference) => `${conference} championship`),
        ...stadium.playoff_rounds,
    ].join(', ');

const AdminStadiums = () => {
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const selected = params.get('name');
    const [stadiums, setStadiums] = useState([]);
    const [showRetired, setShowRetired] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newName, setNewName] = useState('');
    const [copyFrom, setCopyFrom] = useState('');
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setStadiums(await getStadiums(true));
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const select = (name) => setParams(name ? { name } : {}, { replace: true });

    const visible = useMemo(
        () =>
            stadiums.filter(
                (stadium) =>
                    (showRetired || stadium.active) &&
                    (!query || `${stadium.name} ${stadium.city || ''} ${usageOf(stadium)}`.toLowerCase().includes(query.toLowerCase()))
            ),
        [stadiums, showRetired, query]
    );
    const current = stadiums.find((stadium) => stadium.name === selected);

    const create = async (event) => {
        event.preventDefault();
        setBusy(true);
        try {
            const created = await createStadium({ name: newName.trim(), copy_from: copyFrom || null });
            setNewName('');
            setCopyFrom('');
            await load();
            select(created.name);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const toggleActive = async () => {
        setBusy(true);
        try {
            await setStadiumActive(current.name, !current.active);
            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <AdminLayout title="Stadiums">
            <BackButton onBack={() => navigate(-1)} />
            {error && (
                <Alert severity="error" sx={{ mb: '16px' }}>
                    {error}
                </Alert>
            )}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '320px 1fr' }, gap: '16px', alignItems: 'start' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Panel header="New stadium">
                        <Box component="form" onSubmit={create} sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Box>
                                <Box component="label" sx={labelSx} htmlFor="new-stadium">
                                    Name
                                </Box>
                                <Box
                                    component="input"
                                    id="new-stadium"
                                    value={newName}
                                    onChange={(event) => setNewName(event.target.value)}
                                    placeholder="Mercedes-Benz Stadium"
                                    sx={inputSx}
                                />
                            </Box>
                            <Box>
                                <Box component="label" sx={labelSx}>
                                    Start from
                                </Box>
                                <StadiumPicker
                                    value={copyFrom}
                                    onChange={setCopyFrom}
                                    allowNone
                                    noneLabel="Standard crowd"
                                    ariaLabel="Copy design from"
                                />
                            </Box>
                            <Box component="button" type="submit" disabled={busy || !newName.trim()} sx={buttonSx}>
                                Create stadium
                            </Box>
                        </Box>
                    </Panel>
                    <Panel header={`Stadiums (${visible.length})`}>
                        <Box sx={{ p: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <Box
                                component="input"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search stadiums, cities or teams"
                                aria-label="Search stadiums"
                                sx={inputSx}
                            />
                            <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                                <input type="checkbox" checked={showRetired} onChange={(event) => setShowRetired(event.target.checked)} />
                                Show retired stadiums
                            </Box>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: '20px' }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : (
                                <Box sx={{ maxHeight: 520, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {visible.map((stadium) => (
                                        <Box
                                            key={stadium.name}
                                            component="button"
                                            type="button"
                                            onClick={() => select(stadium.name)}
                                            sx={{
                                                textAlign: 'left',
                                                border: '1px solid',
                                                borderColor: stadium.name === selected ? 'var(--brand)' : 'var(--line)',
                                                background: stadium.name === selected ? 'var(--surface-2)' : 'var(--surface)',
                                                color: 'var(--text)',
                                                borderRadius: 'var(--r-sm)',
                                                p: '8px 10px',
                                                font: 'inherit',
                                                cursor: 'pointer',
                                                opacity: stadium.active ? 1 : 0.6,
                                            }}
                                        >
                                            <Box sx={{ fontWeight: 700, fontSize: '0.84rem' }}>
                                                {stadium.name}
                                                {!stadium.active && ' (retired)'}
                                            </Box>
                                            <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                                                {[stadium.city, stadium.state].filter(Boolean).join(', ') || 'Neutral site'}
                                                {usageOf(stadium) && ` · ${usageOf(stadium)}`}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Panel>
                </Box>
                <Box>
                    {current ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Box component="button" type="button" onClick={toggleActive} disabled={busy} sx={secondaryButtonSx}>
                                    {current.active ? 'Retire stadium' : 'Restore stadium'}
                                </Box>
                            </Box>
                            <StadiumEditor
                                name={current.name}
                                team={current.teams[0]}
                                canEdit
                                onRenamed={async (name) => {
                                    await load();
                                    select(name);
                                }}
                            />
                        </Box>
                    ) : (
                        <Alert severity="info">Pick a stadium to edit it, or create a new one.</Alert>
                    )}
                </Box>
            </Box>
        </AdminLayout>
    );
};

export default AdminStadiums;
