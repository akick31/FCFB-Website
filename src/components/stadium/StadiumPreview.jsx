import React, { useMemo, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import SegTabs from '../ui/SegTabs';
import { usePreviewImage } from '../../hooks/usePreviewImage';
import { renderStadiumPreview } from '../../api/stadiumApi';

export const PREVIEW_VIEWS = ['BOTH', 'LEFT', 'RIGHT', 'LEFT_SCOREBOARD', 'RIGHT_SCOREBOARD'];

const CAPTIONS = {
    BOTH: 'Top row: close kick. Bottom row: long kick.',
    LEFT: 'Top: close kick. Bottom: long kick.',
    RIGHT: 'Top: close kick. Bottom: long kick.',
};

const captionSx = {
    color: 'var(--text-dim)',
    fontSize: '0.68rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    textAlign: 'center',
};

const CROWD_FILLS = [
    { value: '1', label: 'Full' },
    { value: '0.75', label: '75%' },
    { value: '0.5', label: 'Half' },
];

const crowdSwitchSx = { height: '26px', px: '9px', fontSize: '0.7rem' };

const StadiumPreview = ({ venue, design, team, opponent, category, eventKey, view = 'BOTH', title = 'Preview' }) => {
    const [crowd, setCrowd] = useState('1');
    const request = useMemo(
        () => ({ venue, design, team, opponent, category, key: eventKey, view, crowd_fill: Number(crowd) }),
        [venue, design, team, opponent, category, eventKey, view, crowd]
    );
    const { url, loading, error } = usePreviewImage(renderStadiumPreview, request);

    return (
        <Panel
            header={title}
            more={
                <SegTabs
                    value={crowd}
                    onChange={setCrowd}
                    options={CROWD_FILLS}
                    ariaLabel="Crowd"
                    buttonSx={crowdSwitchSx}
                />
            }
        >
            <Box sx={{ p: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {error && <Alert severity="warning">{error}</Alert>}
                <Box sx={{ position: 'relative', minHeight: 120, display: 'flex', justifyContent: 'center' }}>
                    {url && (
                        <Box
                            component="img"
                            src={url}
                            alt="Stadium preview"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: { xs: '30vh', md: 'calc(100vh - 290px)' },
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
                {view === 'BOTH' && (
                    <Box sx={{ ...captionSx, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                        <span>Left end</span>
                        <span>Right end</span>
                    </Box>
                )}
                {CAPTIONS[view] && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>{CAPTIONS[view]}</Box>}
            </Box>
        </Panel>
    );
};

StadiumPreview.propTypes = {
    venue: PropTypes.string,
    design: PropTypes.object,
    team: PropTypes.string,
    opponent: PropTypes.string,
    category: PropTypes.oneOf(['BOWL', 'PLAYOFF', 'CCG']),
    eventKey: PropTypes.string,
    view: PropTypes.oneOf(PREVIEW_VIEWS),
    title: PropTypes.string,
};

export default StadiumPreview;
