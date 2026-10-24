import React, { useMemo } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import { usePreviewImage } from '../../hooks/usePreviewImage';
import { renderStadiumPreview } from '../../api/stadiumApi';

const StadiumPreview = ({ venue, design, team, opponent }) => {
    const request = useMemo(() => ({ venue, design, team, opponent }), [venue, design, team, opponent]);
    const { url, loading, error } = usePreviewImage(renderStadiumPreview, request);

    return (
        <Panel header="Live preview">
            <Box sx={{ p: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {error && <Alert severity="warning">{error}</Alert>}
                <Box sx={{ position: 'relative', minHeight: 160 }}>
                    {url && (
                        <Box
                            component="img"
                            src={url}
                            alt="Stadium preview: left and right ends on a close and a long kick"
                            sx={{
                                width: '100%',
                                borderRadius: 'var(--r-sm)',
                                border: '1px solid var(--line)',
                                opacity: loading ? 0.5 : 1,
                                transition: 'opacity 0.15s',
                            }}
                        />
                    )}
                    {loading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <CircularProgress size={24} />
                        </Box>
                    )}
                </Box>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        color: 'var(--text-dim)',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        textAlign: 'center',
                    }}
                >
                    <span>Left end</span>
                    <span>Right end</span>
                </Box>
                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                    Top row: close kick. Bottom row: long kick. Unsaved edits are shown.
                </Box>
            </Box>
        </Panel>
    );
};

StadiumPreview.propTypes = {
    venue: PropTypes.string,
    design: PropTypes.object,
    team: PropTypes.string,
    opponent: PropTypes.string,
};

export default StadiumPreview;
