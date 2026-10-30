import React, { useEffect, useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import StadiumPicker from './StadiumPicker';
import StadiumPreview from './StadiumPreview';
import { assignGameStadium } from '../../api/stadiumApi';
import { labelSx, primaryButtonSx } from '../../styles/controls';

const GameStadiumPanel = ({ gameId, venue, homeTeam, awayTeam, canEdit, onChanged }) => {
    const [choice, setChoice] = useState(venue || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => setChoice(venue || ''), [venue]);

    const save = async () => {
        setSaving(true);
        setError(null);
        try {
            const saved = await assignGameStadium({ game_id: Number(gameId), venue: choice });
            onChanged(saved.name);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
                gap: '16px',
                alignItems: 'start',
                mb: '16px',
            }}
        >
            <Panel header="Stadium">
                <Box sx={{ p: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
                            gap: '10px',
                            alignItems: 'end',
                        }}
                    >
                        <Box>
                            <Box component="label" sx={labelSx}>
                                Played at
                            </Box>
                            <StadiumPicker value={choice} onChange={setChoice} disabled={!canEdit} />
                        </Box>
                        {canEdit && (
                            <Box
                                component="button"
                                type="button"
                                onClick={save}
                                disabled={saving || !choice || choice === venue}
                                sx={primaryButtonSx}
                            >
                                {saving ? 'Saving...' : 'Play here'}
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                        Changes where this game is played everywhere it shows up. The field below stays this game&apos;s
                        own.
                    </Box>
                </Box>
            </Panel>
            {choice && <StadiumPreview venue={choice} team={homeTeam} opponent={awayTeam} />}
        </Box>
    );
};

GameStadiumPanel.propTypes = {
    gameId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    venue: PropTypes.string,
    homeTeam: PropTypes.string,
    awayTeam: PropTypes.string,
    canEdit: PropTypes.bool.isRequired,
    onChanged: PropTypes.func.isRequired,
};

export default GameStadiumPanel;
