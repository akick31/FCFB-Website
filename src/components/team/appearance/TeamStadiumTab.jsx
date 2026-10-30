import React, { forwardRef, useEffect, useState } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import StadiumHeaderCard from '../../stadium/StadiumHeaderCard';
import StadiumEditor from '../../stadium/StadiumEditor';
import StadiumPicker, { BUILD_NEW } from '../../stadium/StadiumPicker';
import StadiumHistoryButton from '../../stadium/StadiumHistoryButton';
import StadiumPreview from '../../stadium/StadiumPreview';
import { assignTeamStadium } from '../../../api/stadiumApi';
import { inputSx, labelSx, primaryButtonSx } from '../../../styles/controls';

const TeamStadiumTab = forwardRef(({ team, stadium, canEdit, onStadiumChanged, onDirtyChange }, ref) => {
    const [choice, setChoice] = useState(stadium || '');
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [version, setVersion] = useState(0);

    useEffect(() => setChoice(stadium || ''), [stadium]);

    const building = choice === BUILD_NEW;
    const switching = !building && choice && choice !== stadium;
    const editingCurrent = stadium && choice === stadium;
    const previewName = building || !choice ? 'Standard stadium' : choice;

    const apply = async () => {
        setSaving(true);
        setError(null);
        try {
            const venue = building ? newName.trim() : choice;
            const saved = await assignTeamStadium({ team, venue, build_new: building });
            setNewName('');
            onStadiumChanged(saved.name);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const chooser = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Box>
                <Box component="label" sx={labelSx}>
                    Team stadium
                </Box>
                <StadiumPicker value={choice} onChange={setChoice} allowBuild={canEdit} disabled={!canEdit} />
            </Box>
            {building && (
                <Box
                    component="input"
                    aria-label="New stadium name"
                    placeholder="New stadium name"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    sx={inputSx}
                />
            )}
            {canEdit && (building || switching) && (
                <Box
                    component="button"
                    type="button"
                    onClick={apply}
                    disabled={saving || (building && !newName.trim())}
                    sx={primaryButtonSx}
                >
                    {saving ? 'Saving...' : building ? 'Build stadium' : 'Move to this stadium'}
                </Box>
            )}
        </Box>
    );

    if (editingCurrent) {
        return (
            <StadiumEditor
                key={`${stadium}:${version}`}
                ref={ref}
                name={stadium}
                team={team}
                canEdit={canEdit}
                headerControls={chooser}
                headerActions={
                    <StadiumHistoryButton
                        stadium={stadium}
                        canRevert={canEdit}
                        onReverted={() => setVersion((current) => current + 1)}
                    />
                }
                onRenamed={onStadiumChanged}
                onDirtyChange={onDirtyChange}
            />
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <StadiumHeaderCard controls={chooser} />
            <Box sx={{ maxWidth: 720 }}>
                <StadiumPreview
                    venue={building || !choice ? undefined : choice}
                    team={team}
                    title={`Preview: ${previewName}`}
                />
            </Box>
        </Box>
    );
});

TeamStadiumTab.displayName = 'TeamStadiumTab';

TeamStadiumTab.propTypes = {
    team: PropTypes.string.isRequired,
    stadium: PropTypes.string,
    canEdit: PropTypes.bool.isRequired,
    onStadiumChanged: PropTypes.func.isRequired,
    onDirtyChange: PropTypes.func,
};

export default TeamStadiumTab;
