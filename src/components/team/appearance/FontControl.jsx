import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { addFont, deleteFont } from '../../../api/fontApi';
import { useFonts, registerUploadedFont, removeFont } from './fontStore';
import { checkIfUserIsAdmin } from '../../../utils/utils';

const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem' };
const smallInputSx = { ...inputSx, height: '32px', fontSize: '0.8rem' };
const linkSx = { alignSelf: 'flex-start', background: 'none', border: 0, p: 0, color: 'var(--brand)', font: 'inherit', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', cursor: 'pointer' };
const addSx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '12px', height: '30px', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };

const BOLD_SUFFIX = '|BOLD';

const FontControl = ({ value, onChange, disabled, allowDefault }) => {
    const fonts = useFonts();
    const isAdmin = checkIfUserIsAdmin();
    const bold = typeof value === 'string' && value.endsWith(BOLD_SUFFIX);
    const baseValue = bold ? value.slice(0, -BOLD_SUFFIX.length) : (value || '');
    const emit = (key, isBold) => onChange(isBold ? `${key}${BOLD_SUFFIX}` : key);
    const canRemove = isAdmin && baseValue.startsWith('CUSTOM_');

    const remove = async () => {
        // eslint-disable-next-line no-alert
        if (!window.confirm('Remove this font from the shared library?')) return;
        try {
            await deleteFont(baseValue);
            removeFont(baseValue);
            onChange(allowDefault ? '' : 'CLASSIC');
        } catch (err) {
            setError(err.message || 'Failed to remove font');
        }
    };
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState('');
    const [url, setUrl] = useState('');
    const [ack, setAck] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const options = allowDefault ? [{ value: '', label: 'Use default' }, ...fonts] : fonts;

    const submit = async () => {
        setBusy(true);
        setError(null);
        try {
            const option = await addFont(label.trim(), url.trim(), ack);
            registerUploadedFont(option);
            onChange(option.value);
            setOpen(false);
            setLabel('');
            setUrl('');
            setAck(false);
        } catch (err) {
            setError(err.message || 'Failed to add font');
        } finally {
            setBusy(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box component="select" disabled={disabled} value={baseValue} onChange={(e) => emit(e.target.value, bold)} sx={{ ...inputSx, flex: 1, width: 'auto' }}>
                    {options.map((option) => <option key={option.value || 'default'} value={option.value}>{option.label}</option>)}
                </Box>
                <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', cursor: disabled ? 'default' : 'pointer' }}>
                    <Box component="input" type="checkbox" disabled={disabled} checked={bold} onChange={(e) => emit(baseValue, e.target.checked)} />
                    Bold
                </Box>
            </Box>
            {!disabled && !open && (
                <Box sx={{ display: 'flex', gap: '12px' }}>
                    <Box component="button" type="button" onClick={() => setOpen(true)} sx={linkSx}>+ Add a font</Box>
                    {canRemove && <Box component="button" type="button" onClick={remove} sx={{ ...linkSx, color: 'var(--live)' }}>Remove font</Box>}
                </Box>
            )}
            {!disabled && open && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', p: '8px', background: 'var(--surface)' }}>
                    <Box component="input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Font name (shown in the list)" sx={smallInputSx} />
                    <Box component="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Direct link to a .ttf or .otf file" sx={smallInputSx} />
                    <Box component="label" sx={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        <Box component="input" type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
                        I have the right to share this font.
                    </Box>
                    {error && <Box sx={{ color: 'var(--live)', fontSize: '0.7rem' }}>{error}</Box>}
                    <Box sx={{ display: 'flex', gap: '8px' }}>
                        <Box component="button" type="button" disabled={busy || !label.trim() || !url.trim() || !ack} onClick={submit} sx={addSx}>{busy ? 'Adding...' : 'Add font'}</Box>
                        <Box component="button" type="button" onClick={() => setOpen(false)} sx={{ ...addSx, background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--line)' }}>Cancel</Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

FontControl.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    allowDefault: PropTypes.bool,
};

export default FontControl;
