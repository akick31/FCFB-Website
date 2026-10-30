import React, { useEffect, useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import StadiumCreateDialog from '../../stadium/StadiumCreateDialog';
import StadiumEditDialog from '../../stadium/StadiumEditDialog';
import StadiumHeaderCard from '../../stadium/StadiumHeaderCard';
import StadiumPicker from '../../stadium/StadiumPicker';
import StadiumPreview from '../../stadium/StadiumPreview';
import { assignEventStadium, getStadium } from '../../../api/stadiumApi';
import { labelSx, primaryButtonSx, secondaryButtonSx } from '../../../styles/controls';

const EventStadiumTab = ({ category, eventKey, venue, onChanged }) => {
    const [choice, setChoice] = useState(venue || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(null);
    const [creating, setCreating] = useState(false);
    const [version, setVersion] = useState(0);

    useEffect(() => setChoice(venue || ''), [venue]);

    const unchanged = (choice || '') === (venue || '');

    const assign = async (name) => {
        const saved = await assignEventStadium({ category, key: eventKey, venue: name || null });
        onChanged(saved || null);
        return saved;
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        try {
            await assign(choice);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const openEditor = async () => {
        try {
            setEditing(await getStadium(choice));
        } catch (err) {
            setError(err.message);
        }
    };

    const refresh = () => setVersion((current) => current + 1);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {error && <Alert severity="error">{error}</Alert>}
            <StadiumHeaderCard
                controls={
                    <Box>
                        <Box component="label" sx={labelSx}>
                            Played at
                        </Box>
                        <StadiumPicker value={choice} onChange={setChoice} allowNone noneLabel="Standard stadium" />
                    </Box>
                }
                actions={
                    <>
                        {!unchanged && (
                            <Box component="button" type="button" onClick={save} disabled={saving} sx={primaryButtonSx}>
                                {saving ? 'Saving...' : 'Use this stadium'}
                            </Box>
                        )}
                        {choice && (
                            <Box component="button" type="button" onClick={openEditor} sx={secondaryButtonSx}>
                                Edit stadium
                            </Box>
                        )}
                        <Box component="button" type="button" onClick={() => setCreating(true)} sx={secondaryButtonSx}>
                            Create stadium
                        </Box>
                    </>
                }
            ></StadiumHeaderCard>
            <Box sx={{ maxWidth: 900 }}>
                <StadiumPreview
                    key={version}
                    venue={choice || undefined}
                    category={category}
                    eventKey={eventKey}
                    title={choice || 'Standard stadium'}
                />
            </Box>
            {editing && (
                <StadiumEditDialog
                    open
                    adminTools={false}
                    category={category}
                    eventKey={eventKey}
                    stadium={editing}
                    onClose={() => {
                        setEditing(null);
                        refresh();
                    }}
                    onChanged={refresh}
                    onMoved={async (name) => {
                        setEditing(null);
                        setChoice(name);
                        await assign(name);
                        refresh();
                    }}
                />
            )}
            <StadiumCreateDialog
                open={creating}
                category={category}
                eventKey={eventKey}
                onClose={async (created) => {
                    setCreating(false);
                    if (created) {
                        setChoice(created);
                        await assign(created);
                    }
                    refresh();
                }}
            />
        </Box>
    );
};

EventStadiumTab.propTypes = {
    category: PropTypes.oneOf(['BOWL', 'PLAYOFF', 'CCG']).isRequired,
    eventKey: PropTypes.string.isRequired,
    venue: PropTypes.string,
    onChanged: PropTypes.func.isRequired,
};

export default EventStadiumTab;
