import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import EditorShell from '../../appearance/editor/EditorShell';
import SettingsPanel from '../../appearance/editor/SettingsPanel';
import AppearanceControl from './AppearanceControl';
import LivePreview from './LivePreview';
import { formFrom, payloadFrom } from './appearanceSections';
import { useAppearanceDraft } from '../../../hooks/useAppearanceDraft';

const copySx = {
    border: '1px solid var(--line)',
    background: 'var(--surface)',
    color: 'var(--text-muted)',
    borderRadius: 'var(--r-sm)',
    px: '8px',
    height: '28px',
    font: 'inherit',
    fontSize: '0.66rem',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    cursor: 'pointer',
    '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' },
};

const AppearanceEditor = forwardRef(
    (
        {
            team,
            view,
            half,
            sections,
            source,
            canEdit,
            onSave,
            teamColors,
            wallTextDefault,
            previewGroups,
            previewLabel = 'Live preview',
            onDirtyChange,
            renderPreview,
            previewWidth = 380,
        },
        ref
    ) => {
        const groups = previewGroups || [{ title: previewLabel, views: [{ view }] }];
        const sourceForm = useMemo(() => formFrom(sections, source, teamColors), [sections, source, teamColors]);
        const { form, changeForm, saving, error, saved, save } = useAppearanceDraft(sourceForm, onDirtyChange);

        const draftPayload = useMemo(() => payloadFrom(sections, form), [sections, form]);
        const previewBody = useMemo(() => ({ [half]: draftPayload }), [half, draftPayload]);
        const [activeView, setActiveView] = useState(null);

        const change = (key, value) => {
            changeForm((current) => {
                const next = { ...current, [key]: value };
                const showsText = value === 'TEXT_ONLY' || value === 'TEXT_WITH_LOGOS';
                if (key === 'wall_design' && showsText && !current.wall_text && wallTextDefault) {
                    next.wall_text = wallTextDefault;
                }
                return next;
            });
        };

        const copyFrom = (copyMap) => {
            changeForm((current) => {
                const next = { ...current };
                Object.entries(copyMap).forEach(([target, src]) => {
                    next[target] = current[src];
                });
                return next;
            });
        };

        const doSave = async () => {
            await save(async (draft) => {
                const persisted = await onSave(payloadFrom(sections, draft));
                return formFrom(sections, persisted, teamColors);
            });
        };

        const submit = async (event) => {
            event.preventDefault();
            await doSave();
        };

        useImperativeHandle(ref, () => ({ save: doSave }));

        const renderControl = (definition, { disabled }) => (
            <AppearanceControl
                definition={
                    definition.optionsFor ? { ...definition, options: definition.optionsFor(form) } : definition
                }
                value={form[definition.key]}
                onChange={(value) => change(definition.key, value)}
                disabled={disabled}
                teamColors={teamColors}
                team={team}
            />
        );

        const sectionActions = (section) =>
            section.copyMap &&
            canEdit && (
                <Box component="button" type="button" onClick={() => copyFrom(section.copyMap)} sx={copySx}>
                    Copy from primary
                </Box>
            );

        const shownGroups = groups.filter((group) => !group.when || !activeView || group.when(activeView));
        const preview = renderPreview
            ? renderPreview(draftPayload, activeView)
            : (shownGroups.length ? shownGroups : groups).map((group) => (
                  <LivePreview
                      key={group.title}
                      title={group.title}
                      team={team}
                      views={group.views}
                      body={previewBody}
                      note={group.note}
                  />
              ));

        return (
            <Box component="form" onSubmit={submit}>
                <EditorShell
                    previewWidth={previewWidth}
                    preview={preview}
                    settings={
                        <SettingsPanel
                            sections={sections}
                            form={form}
                            renderControl={renderControl}
                            canEdit={canEdit}
                            saving={saving}
                            saved={saved}
                            error={error}
                            sectionActions={sectionActions}
                            onViewChange={setActiveView}
                        />
                    }
                />
            </Box>
        );
    }
);

AppearanceEditor.displayName = 'AppearanceEditor';

AppearanceEditor.propTypes = {
    team: PropTypes.string.isRequired,
    view: PropTypes.string,
    half: PropTypes.oneOf(['uniform', 'field', 'stadium']).isRequired,
    sections: PropTypes.array.isRequired,
    source: PropTypes.object.isRequired,
    canEdit: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    teamColors: PropTypes.object,
    wallTextDefault: PropTypes.string,
    previewGroups: PropTypes.array,
    previewLabel: PropTypes.string,
    onDirtyChange: PropTypes.func,
    renderPreview: PropTypes.func,
    previewWidth: PropTypes.number,
};

export default AppearanceEditor;
