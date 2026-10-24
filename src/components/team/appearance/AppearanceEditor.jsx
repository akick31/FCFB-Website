import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Box, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import AppearanceControl from './AppearanceControl';
import LivePreview from './LivePreview';
import { formFrom, payloadFrom, isVisible } from './appearanceSections';
import { useAppearanceDraft } from '../../../hooks/useAppearanceDraft';

const labelSx = {
    display: 'block',
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 800,
    color: 'var(--text-dim)',
    mb: '5px',
};
const helpSx = { color: 'var(--text-dim)', fontSize: '0.7rem', mt: '4px' };
const btnSx = {
    border: 0,
    background: 'var(--brand-deep)',
    color: '#fff',
    borderRadius: 'var(--r-sm)',
    px: '16px',
    height: '38px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:disabled': { opacity: 0.6, cursor: 'default' },
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
        },
        ref
    ) => {
        const groups = previewGroups || [
            { title: previewLabel, views: [{ view }], note: 'Unsaved edits shown here. Save to apply.' },
        ];
        const sourceForm = useMemo(() => formFrom(sections, source, teamColors), [sections, source, teamColors]);
        const { form, changeForm, saving, error, saved, save } = useAppearanceDraft(sourceForm, onDirtyChange);

        const draftPayload = useMemo(() => payloadFrom(sections, form), [sections, form]);
        const previewBody = useMemo(() => ({ [half]: draftPayload }), [half, draftPayload]);

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

        return (
            <Box component="form" onSubmit={submit}>
                {error && (
                    <Alert severity="error" sx={{ mb: '12px' }}>
                        {error}
                    </Alert>
                )}
                {saved && (
                    <Alert severity="success" sx={{ mb: '12px' }}>
                        Saved
                    </Alert>
                )}
                {canEdit && (
                    <Box component="button" type="submit" disabled={saving} sx={{ ...btnSx, mb: '16px' }}>
                        {saving ? 'Saving...' : 'Save'}
                    </Box>
                )}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
                        gap: '16px',
                        alignItems: 'start',
                    }}
                >
                    <Panel header={canEdit ? 'Settings' : 'Settings (view only)'}>
                        <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {sections.map((section) => (
                                <Box
                                    key={section.title}
                                    sx={{
                                        border: '1px solid var(--line)',
                                        borderRadius: 'var(--r-sm)',
                                        background: 'var(--surface-2)',
                                        p: '14px',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '8px',
                                            borderBottom: '1px solid var(--line)',
                                            pb: '8px',
                                            mb: section.help ? '4px' : '12px',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                fontFamily: 'var(--cond)',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                fontSize: '0.95rem',
                                                letterSpacing: '0.03em',
                                                color: 'var(--brand)',
                                            }}
                                        >
                                            {section.title}
                                        </Box>
                                        {section.copyMap && canEdit && (
                                            <Box
                                                component="button"
                                                type="button"
                                                onClick={() => copyFrom(section.copyMap)}
                                                sx={{
                                                    border: '1px solid var(--line)',
                                                    background: 'var(--surface)',
                                                    color: 'var(--text-muted)',
                                                    borderRadius: 'var(--r-sm)',
                                                    px: '8px',
                                                    height: '26px',
                                                    font: 'inherit',
                                                    fontSize: '0.66rem',
                                                    fontWeight: 800,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.03em',
                                                    cursor: 'pointer',
                                                    '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' },
                                                }}
                                            >
                                                Copy from primary
                                            </Box>
                                        )}
                                    </Box>
                                    {section.help && <Box sx={{ ...helpSx, mt: 0, mb: '12px' }}>{section.help}</Box>}
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                            gap: '14px',
                                        }}
                                    >
                                        {section.fields
                                            .filter((definition) => isVisible(definition, form))
                                            .map((definition) =>
                                                definition.type === 'subheading' ? (
                                                    <Box
                                                        key={definition.key}
                                                        sx={{
                                                            gridColumn: '1 / -1',
                                                            mt: '2px',
                                                            pt: '8px',
                                                            borderTop: '1px solid var(--line)',
                                                            fontFamily: 'var(--cond)',
                                                            fontSize: '0.72rem',
                                                            fontWeight: 800,
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em',
                                                            color: 'var(--text-muted)',
                                                        }}
                                                    >
                                                        {definition.label}
                                                    </Box>
                                                ) : definition.type === 'divider' ? (
                                                    <Box
                                                        key={definition.key}
                                                        sx={{
                                                            gridColumn: '1 / -1',
                                                            mt: '2px',
                                                            borderTop: '1px solid var(--line)',
                                                        }}
                                                    />
                                                ) : (
                                                    <Box
                                                        key={definition.key}
                                                        sx={
                                                            definition.fullWidth
                                                                ? { gridColumn: '1 / -1' }
                                                                : definition.rowSpan
                                                                  ? { gridRow: `span ${definition.rowSpan}` }
                                                                  : undefined
                                                        }
                                                    >
                                                        <Box sx={labelSx}>{definition.label}</Box>
                                                        <AppearanceControl
                                                            definition={
                                                                definition.optionsFor
                                                                    ? {
                                                                          ...definition,
                                                                          options: definition.optionsFor(form),
                                                                      }
                                                                    : definition
                                                            }
                                                            value={form[definition.key]}
                                                            onChange={(value) => change(definition.key, value)}
                                                            disabled={!canEdit}
                                                            teamColors={teamColors}
                                                            team={team}
                                                        />
                                                        {definition.help && <Box sx={helpSx}>{definition.help}</Box>}
                                                    </Box>
                                                )
                                            )}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Panel>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            position: { md: 'sticky' },
                            top: { md: '16px' },
                        }}
                    >
                        {renderPreview
                            ? renderPreview(draftPayload)
                            : groups.map((group) => (
                                  <LivePreview
                                      key={group.title}
                                      title={group.title}
                                      team={team}
                                      views={group.views}
                                      body={previewBody}
                                      note={group.note}
                                  />
                              ))}
                    </Box>
                </Box>
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
};

export default AppearanceEditor;
