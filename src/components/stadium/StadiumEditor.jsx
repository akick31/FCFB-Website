import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import AppearanceEditor from '../team/appearance/AppearanceEditor';
import { STADIUM_SECTIONS } from '../team/appearance/appearanceSections';
import StadiumDetails from './StadiumDetails';
import StadiumHeaderCard from './StadiumHeaderCard';
import StadiumPreview from './StadiumPreview';
import { previewTitleFor, previewViewFor } from './stadiumPreviewViews';
import { getStadium, updateStadium } from '../../api/stadiumApi';

const StadiumEditor = forwardRef(
    (
        { name, team, opponent, category, eventKey, headerControls, headerActions, canEdit, onRenamed, onDirtyChange },
        ref
    ) => {
        const [stadium, setStadium] = useState(null);
        const [error, setError] = useState(null);

        useEffect(() => {
            let active = true;
            setStadium(null);
            setError(null);
            getStadium(name)
                .then((loaded) => active && setStadium(loaded))
                .catch((err) => active && setError(err.message));
            return () => {
                active = false;
            };
        }, [name]);

        const detailsSaved = (saved) => {
            setStadium(saved);
            if (saved.name !== name && onRenamed) {
                onRenamed(saved.name);
            }
        };

        const renderPreview = useCallback(
            (design, part) => (
                <StadiumPreview
                    venue={stadium?.name}
                    design={design}
                    team={team}
                    opponent={opponent}
                    category={category}
                    eventKey={eventKey}
                    view={previewViewFor(part, design)}
                    title={previewTitleFor(part)}
                />
            ),
            [stadium?.name, team, opponent, category, eventKey]
        );

        if (error) {
            return <Alert severity="error">{error}</Alert>;
        }
        if (!stadium) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: '24px' }}>
                    <CircularProgress size={28} />
                </Box>
            );
        }

        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {!stadium.active && (
                    <Alert severity="warning">
                        This stadium is retired. Old games still use it, but it is hidden from the pickers.
                    </Alert>
                )}
                <StadiumHeaderCard controls={headerControls} actions={headerActions}>
                    <StadiumDetails stadium={stadium} canEdit={canEdit} onSaved={detailsSaved} />
                </StadiumHeaderCard>
                <AppearanceEditor
                    ref={ref}
                    key={stadium.name}
                    team={team || stadium.name}
                    half="stadium"
                    sections={STADIUM_SECTIONS}
                    source={stadium.design}
                    canEdit={canEdit}
                    onDirtyChange={onDirtyChange}
                    renderPreview={renderPreview}
                    previewWidth={480}
                    onSave={async (payload) => {
                        const saved = await updateStadium(stadium.name, { design: payload });
                        setStadium(saved);
                        return saved.design;
                    }}
                />
            </Box>
        );
    }
);

StadiumEditor.displayName = 'StadiumEditor';

StadiumEditor.propTypes = {
    name: PropTypes.string.isRequired,
    team: PropTypes.string,
    opponent: PropTypes.string,
    category: PropTypes.oneOf(['BOWL', 'PLAYOFF', 'CCG']),
    eventKey: PropTypes.string,
    headerControls: PropTypes.node,
    headerActions: PropTypes.node,
    canEdit: PropTypes.bool.isRequired,
    onRenamed: PropTypes.func,
    onDirtyChange: PropTypes.func,
};

export default StadiumEditor;
