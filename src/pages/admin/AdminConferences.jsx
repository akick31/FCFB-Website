import React, { useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import Toggle from '../../components/ui/Toggle';
import { getConferences, createConference, updateConference, setConferenceActive } from '../../api/conferenceApi';
import { refreshConferences } from '../../components/constants/conferences';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: '8px', font: 'inherit', fontSize: '0.85rem' };
const btnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', py: '10px', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const orderInputSx = { width: 64, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '8px', py: '5px', font: 'inherit', fontSize: '0.8rem', textAlign: 'right' };
const manageBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '10px', py: '5px', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };

const emptyForm = { code: '', label: '', logoUrl: '', logoUrlDark: '', displayOrder: 0 };

const AdminConferences = () => {
    const navigate = useNavigate();
    const [conferences, setConferences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getConferences();
            setConferences([...data].sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
        } catch (err) {
            setError('Failed to load conferences');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleToggleActive = async (conference) => {
        setError(null);
        try {
            await setConferenceActive(conference.code, !conference.active);
            refreshConferences();
            await load();
        } catch (err) {
            setError(err.message || 'Failed to update conference');
        }
    };

    const handleUpdateOrder = async (conference, displayOrder) => {
        try {
            await updateConference(conference.code, {
                code: conference.code,
                label: conference.label,
                logoUrl: conference.logo_url,
                logoUrlDark: conference.logo_url_dark,
                displayOrder,
            });
            refreshConferences();
            await load();
        } catch (err) {
            setError(err.message || 'Failed to update conference');
        }
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            await createConference({
                code: form.code.trim().toUpperCase().replace(/\s+/g, '_'),
                label: form.label.trim(),
                logoUrl: form.logoUrl.trim() || null,
                logoUrlDark: form.logoUrlDark.trim() || null,
                displayOrder: Number(form.displayOrder) || 0,
            });
            refreshConferences();
            setForm(emptyForm);
            setSuccess('Conference created');
            await load();
        } catch (err) {
            setError(err.message || 'Failed to create conference');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Conference Management">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Conference Management">
            {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: '16px' }}>{success}</Alert>}

            <Panel header="Conferences" sx={{ mb: '16px' }}>
                <DataTable minWidth={640}>
                    <thead>
                        <tr>
                            <th className="lft stick">Conference</th>
                            <th className="lft">Code</th>
                            <th>Order</th>
                            <th>Active</th>
                            <th className="lft">Teams</th>
                        </tr>
                    </thead>
                    <tbody>
                        {conferences.map((conference) => (
                            <tr key={conference.code}>
                                <td className="lft stick">
                                    <Box className="teamcell">
                                        {conference.logo_url && <Box component="img" src={conference.logo_url} alt="" sx={{ width: 22, height: 22, objectFit: 'contain' }} />}
                                        <span className="nm">{conference.label}</span>
                                    </Box>
                                </td>
                                <td className="lft">{conference.code}</td>
                                <td>
                                    <Box
                                        component="input"
                                        type="number"
                                        defaultValue={conference.display_order || 0}
                                        onBlur={(event) => {
                                            const next = Number(event.target.value) || 0;
                                            if (next !== conference.display_order) handleUpdateOrder(conference, next);
                                        }}
                                        sx={orderInputSx}
                                    />
                                </td>
                                <td>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Toggle on={!!conference.active} onClick={() => handleToggleActive(conference)} />
                                    </Box>
                                </td>
                                <td className="lft">
                                    <Box component="button" type="button" onClick={() => navigate(`/admin/conferences/${encodeURIComponent(conference.code)}`)} sx={manageBtnSx}>
                                        Manage teams
                                    </Box>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </DataTable>
            </Panel>

            <Panel header="Add conference">
                <Box component="form" onSubmit={handleCreate} sx={{ p: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', alignItems: 'end' }}>
                    <Box>
                        <Box sx={labelSx}>Code</Box>
                        <Box component="input" value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))} required sx={inputSx} />
                    </Box>
                    <Box>
                        <Box sx={labelSx}>Label</Box>
                        <Box component="input" value={form.label} onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))} required sx={inputSx} />
                    </Box>
                    <Box>
                        <Box sx={labelSx}>Logo URL</Box>
                        <Box component="input" value={form.logoUrl} onChange={(e) => setForm((prev) => ({ ...prev, logoUrl: e.target.value }))} sx={inputSx} />
                    </Box>
                    <Box>
                        <Box sx={labelSx}>Dark logo URL</Box>
                        <Box component="input" value={form.logoUrlDark} onChange={(e) => setForm((prev) => ({ ...prev, logoUrlDark: e.target.value }))} sx={inputSx} />
                    </Box>
                    <Box>
                        <Box sx={labelSx}>Order</Box>
                        <Box component="input" type="number" value={form.displayOrder} onChange={(e) => setForm((prev) => ({ ...prev, displayOrder: e.target.value }))} sx={inputSx} />
                    </Box>
                    <Box component="button" type="submit" disabled={saving} sx={btnSx}>
                        {saving ? 'Adding...' : 'Add conference'}
                    </Box>
                </Box>
            </Panel>
        </AdminLayout>
    );
};

export default AdminConferences;
