import React, { useEffect, useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import LogoUrlField from '../LogoUrlField';
import { updateBowlMeta } from '../../../api/fieldAppearanceApi';

const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem' };
const btnSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };

const BowlMetaEditor = ({ bowl, onSaved }) => {
    const [name, setName] = useState(bowl);
    const [logo, setLogo] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => { setName(bowl); setLogo(''); setSaved(false); setError(null); }, [bowl]);

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError(null);
        setSaved(false);
        try {
            const result = await updateBowlMeta(bowl, { name: name.trim(), logo: logo.trim() || null });
            setSaved(true);
            onSaved(result.bowl);
        } catch (err) {
            setError(err.message || 'Failed to update bowl');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Panel header="Bowl details" sx={{ mb: '16px' }}>
            <Box component="form" onSubmit={submit} sx={{ p: '16px', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '14px', alignItems: 'end' }}>
                {error && <Alert severity="error" sx={{ gridColumn: '1 / -1' }}>{error}</Alert>}
                {saved && <Alert severity="success" sx={{ gridColumn: '1 / -1' }}>Saved</Alert>}
                <Box>
                    <Box sx={labelSx}>Bowl name</Box>
                    <Box component="input" value={name} onChange={(e) => setName(e.target.value)} sx={inputSx} />
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem', mt: '4px' }}>Renames it everywhere, including scheduled games.</Box>
                </Box>
                <Box>
                    <Box sx={labelSx}>Replace logo</Box>
                    <LogoUrlField label="" value={logo} onChange={(e) => setLogo(e.target.value)} />
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem', mt: '4px' }}>Blank keeps the current logo.</Box>
                </Box>
                <Box component="button" type="submit" disabled={saving} sx={{ ...btnSx, gridColumn: '1 / -1', justifySelf: 'start' }}>
                    {saving ? 'Saving...' : 'Save bowl details'}
                </Box>
            </Box>
        </Panel>
    );
};

BowlMetaEditor.propTypes = { bowl: PropTypes.string.isRequired, onSaved: PropTypes.func.isRequired };

export default BowlMetaEditor;
