import React, { useState } from 'react';
import { Box, Drawer } from '@mui/material';
import PropTypes from 'prop-types';
import StadiumHistoryPanel from './StadiumHistoryPanel';
import { secondaryButtonSx } from '../../styles/controls';

const StadiumHistoryButton = ({ stadium, canRevert, onReverted }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Box component="button" type="button" onClick={() => setOpen(true)} sx={secondaryButtonSx}>
                History
            </Box>
            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, background: 'var(--ground)', p: '12px' } }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '8px' }}>
                    <Box component="button" type="button" onClick={() => setOpen(false)} sx={secondaryButtonSx}>
                        Close
                    </Box>
                </Box>
                {open && (
                    <StadiumHistoryPanel
                        stadium={stadium}
                        canRevert={canRevert}
                        onReverted={(saved) => {
                            setOpen(false);
                            onReverted(saved);
                        }}
                    />
                )}
            </Drawer>
        </>
    );
};

StadiumHistoryButton.propTypes = {
    stadium: PropTypes.string.isRequired,
    canRevert: PropTypes.bool.isRequired,
    onReverted: PropTypes.func.isRequired,
};

export default StadiumHistoryButton;
