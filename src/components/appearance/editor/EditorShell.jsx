import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { chipSx } from './chipStyles';

const EditorShell = ({ settings, preview, previewWidth = 380 }) => {
    const [previewOpen, setPreviewOpen] = useState(true);
    if (!preview) {
        return settings;
    }
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: `minmax(0, 1fr) ${previewWidth}px` },
                gap: '14px',
                alignItems: 'start',
            }}
        >
            <Box sx={{ minWidth: 0 }}>{settings}</Box>
            <Box
                sx={{
                    order: { xs: -1, md: 0 },
                    position: { md: 'sticky' },
                    top: { md: '12px' },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    minWidth: 0,
                }}
            >
                <Box
                    component="button"
                    type="button"
                    onClick={() => setPreviewOpen((open) => !open)}
                    aria-expanded={previewOpen}
                    sx={{ ...chipSx(previewOpen), display: { xs: 'inline-flex', md: 'none' }, alignSelf: 'flex-start' }}
                >
                    {previewOpen ? 'Hide preview' : 'Show preview'}
                </Box>
                <Box
                    sx={{
                        display: { xs: previewOpen ? 'flex' : 'none', md: 'flex' },
                        flexDirection: 'column',
                        gap: '10px',
                    }}
                >
                    {preview}
                </Box>
            </Box>
        </Box>
    );
};

EditorShell.propTypes = {
    settings: PropTypes.node.isRequired,
    preview: PropTypes.node,
    previewWidth: PropTypes.number,
};

export default EditorShell;
