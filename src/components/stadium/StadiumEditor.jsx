import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import AppearanceEditor from '../team/appearance/AppearanceEditor';
import { STADIUM_SECTIONS } from '../team/appearance/appearanceSections';
import StadiumDetails from './StadiumDetails';
import StadiumPreview from './StadiumPreview';
import { getStadium, updateStadium } from '../../api/stadiumApi';

const StadiumEditor = forwardRef(({ name, team, opponent, canEdit, onRenamed, onDirtyChange }, ref) => {
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
        (design) => <StadiumPreview venue={stadium?.name} design={design} team={team} opponent={opponent} />,
        [stadium?.name, team, opponent]
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
            <StadiumDetails stadium={stadium} canEdit={canEdit} onSaved={detailsSaved} />
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
                onSave={async (payload) => {
                    const saved = await updateStadium(stadium.name, { design: payload });
                    setStadium(saved);
                    return saved.design;
                }}
            />
        </Box>
    );
});

StadiumEditor.displayName = 'StadiumEditor';

StadiumEditor.propTypes = {
    name: PropTypes.string.isRequired,
    team: PropTypes.string,
    opponent: PropTypes.string,
    canEdit: PropTypes.bool.isRequired,
    onRenamed: PropTypes.func,
    onDirtyChange: PropTypes.func,
};

export default StadiumEditor;
