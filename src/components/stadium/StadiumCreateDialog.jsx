import React, { useState } from 'react';
import { Alert, Box, Dialog, DialogContent, DialogTitle, useMediaQuery } from '@mui/material';
import PropTypes from 'prop-types';
import StadiumSuggestions from './StadiumSuggestions';
import StadiumEditor from './StadiumEditor';
import StadiumPicker from './StadiumPicker';

import { createStadium } from '../../api/stadiumApi';
import { inputSx, labelSx, primaryButtonSx, secondaryButtonSx } from '../../styles/controls';

const StadiumCreateDialog = ({ open, onClose, category, eventKey, stadiums = [], onOpenExisting }) => {
    const phone = useMediaQuery('(max-width:900px)');
    const [name, setName] = useState('');
    const [copyFrom, setCopyFrom] = useState('');
    const [created, setCreated] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const create = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError(null);
        try {
            const stadium = await createStadium({ name: name.trim(), copy_from: copyFrom || null });
            setCreated(stadium.name);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const close = () => {
        const finished = created;
        setName('');
        setCopyFrom('');
        setCreated(null);
        setError(null);
        onClose(finished);
    };

    return (
        <Dialog open={open} onClose={close} fullScreen={phone} fullWidth maxWidth={created ? 'xl' : 'sm'}>
            <DialogTitle
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 800 }}
            >
                {created ? `Design ${created}` : 'Create a stadium'}
                <Box component="button" type="button" onClick={close} sx={secondaryButtonSx}>
                    {created ? 'Done, use this stadium' : 'Cancel'}
                </Box>
            </DialogTitle>
            <DialogContent>
                {created ? (
                    <StadiumEditor name={created} category={category} eventKey={eventKey} canEdit />
                ) : (
                    <Box
                        component="form"
                        onSubmit={create}
                        sx={{ display: 'flex', flexDirection: 'column', gap: '12px', pt: '6px' }}
                    >
                        {error && <Alert severity="error">{error}</Alert>}
                        <Box>
                            <Box component="label" sx={labelSx} htmlFor="create-stadium-name">
                                Name
                            </Box>
                            <Box
                                component="input"
                                id="create-stadium-name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Mercedes-Benz Stadium"
                                sx={inputSx}
                            />
                            {onOpenExisting && (
                                <StadiumSuggestions typed={name} stadiums={stadiums} onPick={onOpenExisting} />
                            )}
                        </Box>
                        <Box>
                            <Box component="label" sx={labelSx}>
                                Start from
                            </Box>
                            <StadiumPicker
                                value={copyFrom}
                                onChange={setCopyFrom}
                                allowNone
                                noneLabel="Standard stadium"
                                ariaLabel="Copy design from"
                            />
                        </Box>
                        <Box component="button" type="submit" disabled={busy || !name.trim()} sx={primaryButtonSx}>
                            {busy ? 'Creating...' : 'Create and design'}
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

StadiumCreateDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    category: PropTypes.oneOf(['BOWL', 'PLAYOFF', 'CCG']),
    eventKey: PropTypes.string,
    stadiums: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string.isRequired })),
    onOpenExisting: PropTypes.func,
};

export default StadiumCreateDialog;
