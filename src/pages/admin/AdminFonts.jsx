import React, { useState } from 'react';
import { Box, Alert } from '@mui/material';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import PagedFooter from '../../components/ui/PagedFooter';
import usePagedRows from '../../hooks/usePagedRows';
import useFitCount from '../../hooks/useFitCount';
import { addFont, deleteFont } from '../../api/fontApi';
import { useFonts, registerUploadedFont, removeFont } from '../../components/team/appearance/fontStore';
import { inputSx, labelSx, primaryButtonSx } from '../../styles/controls';

const removeBtnSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text-muted)',
    borderRadius: 'var(--r-sm)',
    px: '10px',
    height: '30px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.72rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:hover': { borderColor: '#e55', color: '#e55' },
};

const isCustomFont = (font) => font.value.startsWith('CUSTOM_');

const emptyForm = { label: '', url: '', ack: false };

const AdminFonts = () => {
    const fonts = useFonts();
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [fitRef, pageSize] = useFitCount({ rowHeight: 41 });
    const { page, pageCount, pageRows, setPage } = usePagedRows(fonts, pageSize, fonts.length);

    const handleAdd = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const option = await addFont(form.label.trim(), form.url.trim(), form.ack);
            registerUploadedFont(option);
            setForm(emptyForm);
            setSuccess(`Added "${option.label}" to the shared font library`);
        } catch (err) {
            setError(err.message || 'Failed to add font');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (font) => {
        const confirmed = window.confirm(
            `Remove "${font.label}" from the shared font library? Any team currently using it will fall back to the default font.`
        );
        if (!confirmed) {
            return;
        }
        setError(null);
        try {
            await deleteFont(font.value);
            removeFont(font.value);
        } catch (err) {
            setError(err.message || 'Failed to remove font');
        }
    };

    return (
        <AdminLayout title="Fonts">
            {error && (
                <Alert severity="error" sx={{ mb: '16px' }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: '16px' }}>
                    {success}
                </Alert>
            )}

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(0, 3fr)' },
                    gap: '16px',
                    alignItems: 'start',
                }}
            >
                <Panel header="Add a font">
                    <Box
                        component="form"
                        onSubmit={handleAdd}
                        sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                    >
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gap: '12px',
                            }}
                        >
                            <Box>
                                <Box sx={labelSx}>Name</Box>
                                <Box
                                    component="input"
                                    value={form.label}
                                    onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                                    required
                                    sx={inputSx}
                                />
                            </Box>
                            <Box>
                                <Box sx={labelSx}>TrueType font URL (.ttf)</Box>
                                <Box
                                    component="input"
                                    value={form.url}
                                    onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                                    required
                                    placeholder="https://..."
                                    sx={inputSx}
                                />
                            </Box>
                        </Box>
                        <Box
                            component="label"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.8rem',
                                color: 'var(--text-muted)',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={form.ack}
                                onChange={(e) => setForm((prev) => ({ ...prev, ack: e.target.checked }))}
                            />
                            I have the right to share this font, and understand it will be available league-wide in the
                            uniform and field editors.
                        </Box>
                        <Box
                            component="button"
                            type="submit"
                            disabled={saving || !form.ack}
                            sx={{ ...primaryButtonSx, justifySelf: 'start' }}
                        >
                            {saving ? 'Adding...' : 'Add font'}
                        </Box>
                    </Box>
                </Panel>

                <Panel header="Font library" more={`${fonts.length} fonts`}>
                    <Box ref={fitRef}>
                        <DataTable minWidth={360} phoneMinWidth={0} dense>
                            <thead>
                                <tr>
                                    <th className="lft stick">Font</th>
                                    <th style={{ textAlign: 'center' }}>Source</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageRows.map((font) => {
                                    const custom = isCustomFont(font);
                                    return (
                                        <tr key={font.value}>
                                            <td className="lft stick">{font.label}</td>
                                            <td style={{ textAlign: 'center' }}>{custom ? 'Custom' : 'Built-in'}</td>
                                            <td className="lft">
                                                {custom && (
                                                    <Box
                                                        component="button"
                                                        type="button"
                                                        onClick={() => handleDelete(font)}
                                                        sx={removeBtnSx}
                                                    >
                                                        Remove
                                                    </Box>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </DataTable>
                        <PagedFooter
                            page={page}
                            pageCount={pageCount}
                            pageSize={pageSize}
                            total={fonts.length}
                            onChange={setPage}
                            noun="fonts"
                        />
                    </Box>
                </Panel>
            </Box>
        </AdminLayout>
    );
};

export default AdminFonts;
