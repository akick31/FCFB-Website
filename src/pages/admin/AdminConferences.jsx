import React, { useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import Toggle from '../../components/ui/Toggle';
import { getConferences, createConference, setConferenceActive } from '../../api/conferenceApi';
import { refreshConferences } from '../../components/constants/conferences';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem' };
const btnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const manageBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };

const emptyForm = { code: '', label: '', logoUrl: '', logoUrlDark: '' };

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

    const handleCreate = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const nextOrder = conferences.reduce((max, conference) => Math.max(max, conference.display_order || 0), -1) + 1;
            await createConference({
                code: form.code.trim().toUpperCase().replace(/\s+/g, '_'),
                label: form.label.trim(),
                logoUrl: form.logoUrl.trim() || null,
                logoUrlDark: form.logoUrlDark.trim() || null,
                displayOrder: nextOrder,
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
                            <th style={{ textAlign: 'center' }}>Active</th>
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
                                <td style={{ textAlign: 'center' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
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
                    <Box component="button" type="submit" disabled={saving} sx={btnSx}>
                        {saving ? 'Adding...' : 'Add conference'}
                    </Box>
                </Box>
            </Panel>
        </AdminLayout>
    );
};

export default AdminConferences;
