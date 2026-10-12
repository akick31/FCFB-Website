import React, { useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import useProfileEditor from '../../hooks/useProfileEditor';
import { rowSx, lblSx, descSx, ctrlSx, inputSx, primarySx } from './profileStyles';

const PasswordRow = ({ onSave }) => {
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const { open, saving, error, toggle, save: saveEditor } = useProfileEditor();

    const save = () =>
        saveEditor(
            () => onSave(current, next),
            () => {
                setCurrent('');
                setNext('');
            }
        );

    return (
        <Box sx={{ borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 0 } }}>
            <Box sx={{ ...rowSx, borderBottom: 0 }}>
                <Box>
                    <Box sx={lblSx}>Password</Box>
                    <Box sx={descSx}>Update your account password</Box>
                </Box>
                <Box component="button" sx={ctrlSx} onClick={toggle}>
                    {open ? 'Cancel' : 'Update'}
                </Box>
            </Box>
            {open && (
                <Box sx={{ px: 2, pb: 2, display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box
                        component="input"
                        type="password"
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                        placeholder="Current password"
                        sx={{ ...inputSx, flex: '1 1 180px' }}
                    />
                    <Box
                        component="input"
                        type="password"
                        value={next}
                        onChange={(e) => setNext(e.target.value)}
                        placeholder="New password"
                        sx={{ ...inputSx, flex: '1 1 180px' }}
                    />
                    <Box component="button" onClick={save} disabled={saving || !current || !next} sx={primarySx}>
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

PasswordRow.propTypes = { onSave: PropTypes.func.isRequired };

export default PasswordRow;
