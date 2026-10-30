import React, { useEffect, useState } from 'react';
import { Alert, Box } from '@mui/material';
import PropTypes from 'prop-types';
import SegTabs from '../../ui/SegTabs';
import FieldLabel from './FieldLabel';
import OverviewCards from './OverviewCards';
import { partTabSx } from './chipStyles';
import { layoutFields } from './settingsLayout';
import { resolveView } from './settingsViews';
import { isEnabled, isVisible } from '../../team/appearance/appearanceForm';
import { primaryButtonSx } from '../../../styles/controls';

const helpOf = (definition, form, enabled) =>
    !enabled && definition.disabledHelp ? definition.disabledHelp(form) : definition.help;

const fieldCellSx = (definition) => {
    if (definition.fullWidth) {
        return { gridColumn: '1 / -1', minWidth: 0 };
    }
    if (definition.rowSpan) {
        return { gridRow: `span ${definition.rowSpan}`, minWidth: 0 };
    }
    if (definition.type === 'logo') {
        return { gridColumn: { lg: 'span 2' }, minWidth: 0 };
    }
    return { minWidth: 0 };
};

const SettingsPanel = ({
    sections,
    form,
    renderControl,
    canEdit,
    saving,
    saved,
    error,
    sectionActions,
    onViewChange,
}) => {
    const [requestedTab, setRequestedTab] = useState(sections[0]?.tab || sections[0]?.title);
    const [requestedViews, setRequestedViews] = useState({});
    const { tab, tabs, views, view } = resolveView(sections, requestedTab, requestedViews[requestedTab], form);
    const fields = view ? layoutFields(view.section, view.groupKey, isVisible, form) : [];
    const viewKey = view?.key;

    useEffect(() => {
        if (onViewChange && view) {
            onViewChange({ tab, section: view.section.title, group: view.label });
        }
    }, [tab, viewKey]);

    return (
        <Box sx={{ border: '1px solid var(--line)', borderRadius: 'var(--r-md, 10px)', background: 'var(--surface)' }}>
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '8px',
                    p: '8px 10px',
                    borderBottom: '1px solid var(--line)',
                    background: 'var(--surface)',
                    borderRadius: 'var(--r-md, 10px) var(--r-md, 10px) 0 0',
                }}
            >
                {tabs.length > 1 && (
                    <SegTabs
                        value={tab}
                        onChange={setRequestedTab}
                        options={tabs.map((name) => ({ value: name, label: name }))}
                        ariaLabel="Settings group"
                        buttonSx={{ height: '30px' }}
                    />
                )}
                <Box sx={{ flex: 1 }} />
                {view && sectionActions?.(view.section)}
                {saved && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700 }}>Saved</Box>}
                {canEdit ? (
                    <Box component="button" type="submit" disabled={saving} sx={primaryButtonSx}>
                        {saving ? 'Saving...' : 'Save'}
                    </Box>
                ) : (
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>View only</Box>
                )}
            </Box>
            {views.length > 1 && (
                <Box
                    role="tablist"
                    aria-label="Settings part"
                    sx={{
                        display: 'flex',
                        gap: '18px',
                        px: '14px',
                        borderBottom: '1px solid var(--line)',
                        overflowX: 'auto',
                    }}
                >
                    {views.map((candidate) => (
                        <Box
                            key={candidate.key}
                            component="button"
                            type="button"
                            role="tab"
                            aria-selected={candidate.key === view.key}
                            onClick={() => setRequestedViews((current) => ({ ...current, [tab]: candidate.key }))}
                            sx={partTabSx(candidate.key === view.key)}
                        >
                            {candidate.label}
                        </Box>
                    ))}
                </Box>
            )}
            {error && (
                <Alert severity="error" sx={{ m: '10px 12px 0' }}>
                    {error}
                </Alert>
            )}
            {view?.section.overview && <OverviewCards ends={view.section.overview(form)} />}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        lg: 'repeat(3, minmax(0, 1fr))',
                    },
                    gap: '10px 14px',
                    p: '10px 12px 14px',
                    alignItems: 'start',
                }}
            >
                {fields.map((definition) => {
                    const enabled = isEnabled(definition, form);
                    return (
                        <Box key={definition.key} data-field={definition.key} sx={fieldCellSx(definition)}>
                            <FieldLabel
                                label={definition.label}
                                help={helpOf(definition, form, enabled)}
                                unavailable={!enabled}
                            />
                            <Box
                                component="fieldset"
                                disabled={!canEdit || !enabled}
                                sx={{ border: 0, p: 0, m: 0, minWidth: 0, opacity: enabled ? 1 : 0.55 }}
                            >
                                {renderControl(definition, { disabled: !canEdit || !enabled })}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

SettingsPanel.propTypes = {
    sections: PropTypes.array.isRequired,
    form: PropTypes.object.isRequired,
    renderControl: PropTypes.func.isRequired,
    canEdit: PropTypes.bool,
    saving: PropTypes.bool,
    saved: PropTypes.bool,
    error: PropTypes.string,
    sectionActions: PropTypes.func,
    onViewChange: PropTypes.func,
};

export default SettingsPanel;
