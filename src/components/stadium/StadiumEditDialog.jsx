import React, { useEffect, useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, useMediaQuery } from '@mui/material';
import PropTypes from 'prop-types';
import StadiumAdminTools from './StadiumAdminTools';
import StadiumEditor from './StadiumEditor';

import { getStadiums } from '../../api/stadiumApi';
import { secondaryButtonSx } from '../../styles/controls';

const StadiumEditDialog = ({ open, stadium, onClose, onChanged, onMoved, category, eventKey, adminTools = true }) => {
    const phone = useMediaQuery('(max-width:900px)');
    const [stadiums, setStadiums] = useState([]);
    const [version, setVersion] = useState(0);

    useEffect(() => {
        if (!open || !adminTools) {
            return undefined;
        }
        let active = true;
        getStadiums(true)
            .then((loaded) => active && setStadiums(loaded))
            .catch(() => {});
        return () => {
            active = false;
        };
    }, [open, adminTools]);

    const changed = () => {
        setVersion((current) => current + 1);
        onChanged();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={phone}
            fullWidth
            maxWidth="xl"
            PaperProps={{ sx: { background: 'var(--ground)', border: '1px solid var(--line)' } }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    fontWeight: 800,
                }}
            >
                Edit {stadium.name}
                <Box sx={{ flex: 1 }} />
                {adminTools && (
                    <StadiumAdminTools stadium={stadium} stadiums={stadiums} onChanged={changed} onMerged={onMoved} />
                )}
                <Box component="button" type="button" onClick={onClose} sx={secondaryButtonSx}>
                    Done
                </Box>
            </DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <StadiumEditor
                    category={category}
                    eventKey={eventKey}
                    key={`${stadium.name}:${version}`}
                    name={stadium.name}
                    team={stadium.teams[0]}
                    canEdit
                    onRenamed={onMoved}
                />
            </DialogContent>
        </Dialog>
    );
};

StadiumEditDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    stadium: PropTypes.shape({
        name: PropTypes.string.isRequired,
        active: PropTypes.bool.isRequired,
        teams: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onChanged: PropTypes.func.isRequired,
    onMoved: PropTypes.func.isRequired,
    category: PropTypes.oneOf(['BOWL', 'PLAYOFF', 'CCG']),
    eventKey: PropTypes.string,
    adminTools: PropTypes.bool,
};

export default StadiumEditDialog;
