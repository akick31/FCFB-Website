import React, { useState } from 'react';
import { Box, Dialog, DialogContent, DialogTitle, useMediaQuery } from '@mui/material';
import PropTypes from 'prop-types';
import PageTabs from './PageTabs';
import { secondaryButtonSx } from '../../styles/controls';

const EditDialog = ({ open, title, onClose, actions, maxWidth = 'md', tabs, children }) => {
    const phone = useMediaQuery('(max-width:900px)');
    const [activeTab, setActiveTab] = useState(tabs?.[0]?.value);
    const shownTab = tabs?.find((tab) => tab.value === activeTab) || tabs?.[0];
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={phone}
            fullWidth
            maxWidth={maxWidth}
            PaperProps={{
                sx: {
                    background: 'var(--ground)',
                    border: '1px solid var(--line)',
                    height: tabs && !phone ? 'min(760px, calc(100vh - 64px))' : undefined,
                },
            }}
        >
            <DialogTitle
                component="div"
                sx={{ display: 'flex', alignItems: 'center', gap: '12px', pb: tabs ? 0 : undefined }}
            >
                <Box component="h2" sx={{ m: 0, flex: 1, minWidth: 0, font: 'inherit', fontWeight: 800 }}>
                    {title}
                </Box>
                {actions}
                <Box component="button" type="button" onClick={onClose} sx={secondaryButtonSx}>
                    Done
                </Box>
            </DialogTitle>
            {tabs && (
                <Box sx={{ px: '24px', pt: '10px' }}>
                    <PageTabs value={shownTab?.value} onChange={setActiveTab} options={tabs} ariaLabel="Sections" />
                </Box>
            )}
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '16px', '& > *': { flexShrink: 0 } }}>
                {children}
                {shownTab?.content}
            </DialogContent>
        </Dialog>
    );
};

EditDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.node.isRequired,
    onClose: PropTypes.func.isRequired,
    actions: PropTypes.node,
    maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            content: PropTypes.node,
        })
    ),
    children: PropTypes.node,
};

export default EditDialog;
