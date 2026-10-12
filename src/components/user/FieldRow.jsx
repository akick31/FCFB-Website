import React, { useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import useProfileEditor from '../../hooks/useProfileEditor';
import { rowSx, lblSx, descSx, ctrlSx, inputSx, primarySx } from './profileStyles';

const FieldRow = ({ label, desc, type = 'text', onSave }) => {
    const [draft, setDraft] = useState('');
    const { open, saving, error, toggle, save: saveEditor } = useProfileEditor();

    const save = () =>
        saveEditor(
            () => onSave(draft),
            () => setDraft('')
        );

    return (
        <Box sx={{ borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 0 } }}>
            <Box sx={{ ...rowSx, borderBottom: 0 }}>
                <Box>
                    <Box sx={lblSx}>{label}</Box>
                    <Box sx={descSx}>{desc}</Box>
                </Box>
                <Box component="button" sx={ctrlSx} onClick={toggle}>
                    {open ? 'Cancel' : 'Change'}
                </Box>
            </Box>
            {open && (
                <Box sx={{ px: 2, pb: 2, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box
                        component="input"
                        type={type}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={`New ${label.toLowerCase()}`}
                        sx={{ ...inputSx, flex: '1 1 220px' }}
                    />
                    <Box component="button" onClick={save} disabled={saving || !draft} sx={primarySx}>
                        {saving ? 'Saving…' : 'Save'}
                    </Box>
                    {error && (
                        <Alert severity="error" sx={{ width: '100%' }}>
                            {error}
                        </Alert>
                    )}
                </Box>
            )}
        </Box>
    );
};

FieldRow.propTypes = {
    label: PropTypes.string.isRequired,
    desc: PropTypes.string,
    type: PropTypes.string,
    onSave: PropTypes.func.isRequired,
};

export default FieldRow;
