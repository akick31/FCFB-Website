import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import SegTabs from '../../components/ui/SegTabs';
import TeamMark from '../../components/ui/TeamMark';
import BackButton from '../../components/ui/BackButton';
import AppearanceEditor from '../../components/team/appearance/AppearanceEditor';
import ColorsEditor from '../../components/team/appearance/ColorsEditor';
import LogosEditor from '../../components/team/appearance/LogosEditor';
import { UNIFORM_SECTIONS, TEAM_FIELD_SECTIONS } from '../../components/team/appearance/appearanceSections';
import { getTeamById } from '../../api/teamApi';
import {
    getTeamUniform,
    updateTeamUniform,
    getTeamField,
    updateTeamField,
    getTeamColors,
    updateTeamColors,
    getTeamLogos,
    updateTeamLogos,
} from '../../api/teamAppearanceApi';
import { checkIfUserIsAdmin } from '../../utils/utils';

const BASE_TABS = [
    { value: 'uniform', label: 'Uniform' },
    { value: 'field', label: 'Field' },
    { value: 'colors', label: 'Colors' },
];

const UNSAVED_MESSAGE = 'You have unsaved appearance changes. Leave without saving?';

const TAB_VALUES = ['uniform', 'field', 'colors', 'logos'];

const TeamAppearance = ({ user }) => {
    const { teamId, tab: tabParam } = useParams();
    const navigate = useNavigate();
    const tab = TAB_VALUES.includes(tabParam) ? tabParam : 'uniform';
    const setTab = (value) => navigate(`/team-appearance/${teamId}/${value}`, { replace: true });
    const [dirtyTabs, setDirtyTabs] = useState({});
    const loadScopeRef = useRef(null);
    const uniformRef = useRef(null);
    const fieldRef = useRef(null);
    const colorsRef = useRef(null);
    const logosRef = useRef(null);
    const tabRefs = { uniform: uniformRef, field: fieldRef, colors: colorsRef, logos: logosRef };
    const [savingAll, setSavingAll] = useState(false);
    const hasUnsaved = Object.values(dirtyTabs).some(Boolean);
    const saveAll = async () => {
        setSavingAll(true);
        try {
            await Promise.all(
                Object.entries(dirtyTabs)
                    .filter(([, dirty]) => dirty)
                    .map(([key]) => tabRefs[key]?.current?.save())
            );
        } finally {
            setSavingAll(false);
        }
    };
    const setTabDirty = (key) => {
        const scope = loadScopeRef.current;
        return (isDirty) => {
            if (scope.active) {
                setDirtyTabs((current) => (current[key] === isDirty ? current : { ...current, [key]: isDirty }));
            }
        };
    };

    useEffect(() => {
        if (!TAB_VALUES.includes(tabParam)) {
            navigate(`/team-appearance/${teamId}/uniform`, { replace: true });
        }
    }, [tabParam, teamId, navigate]);

    useEffect(() => {
        if (!hasUnsaved) {
            return undefined;
        }
        const handler = (event) => {
            event.preventDefault();
            event.returnValue = UNSAVED_MESSAGE;
            return UNSAVED_MESSAGE;
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [hasUnsaved]);

    const leave = () => {
        if (!hasUnsaved || window.confirm(UNSAVED_MESSAGE)) {
            navigate(-1);
        }
    };
    const [team, setTeam] = useState(null);
    const [uniform, setUniform] = useState(null);
    const [field, setField] = useState(null);
    const [colors, setColors] = useState(null);
    const [logos, setLogos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const teamName = team?.name;

    useEffect(() => {
        const scope = { active: true };
        loadScopeRef.current = scope;
        setLoading(true);
        setError(null);
        setTeam(null);
        setUniform(null);
        setField(null);
        setColors(null);
        setLogos(null);
        setDirtyTabs({});
        getTeamById(teamId)
            .then((loadedTeam) => {
                if (!scope.active) {
                    return null;
                }
                setTeam(loadedTeam);
                const name = loadedTeam?.name;
                if (!name) {
                    throw new Error('Team not found');
                }
                return Promise.all([getTeamUniform(name), getTeamField(name), getTeamColors(name), getTeamLogos(name)]);
            })
            .then((loaded) => {
                if (!scope.active || !loaded) {
                    return;
                }
                const [loadedUniform, loadedField, loadedColors, loadedLogos] = loaded;
                setUniform(loadedUniform);
                setField(loadedField);
                setColors(loadedColors);
                setLogos(loadedLogos);
            })
            .catch((err) => {
                if (scope.active) {
                    setError(err.message || 'Failed to load team appearance');
                }
            })
            .finally(() => {
                if (scope.active) {
                    setLoading(false);
                }
            });
        return () => {
            scope.active = false;
        };
    }, [teamId]);

    const isAdmin = useMemo(() => checkIfUserIsAdmin(), []);
    const tabs = useMemo(() => (isAdmin ? [...BASE_TABS, { value: 'logos', label: 'Logos' }] : BASE_TABS), [isAdmin]);
    const canEdit = useMemo(
        () => isAdmin || (!!user?.team && !!teamName && user.team === teamName),
        [isAdmin, user, teamName]
    );

    if (loading) {
        return (
            <PageWrap>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: '40px' }}>
                    <CircularProgress />
                </Box>
            </PageWrap>
        );
    }
    if (error || !teamName) {
        return (
            <PageWrap>
                <BackButton onBack={() => navigate(-1)} />
                <Alert severity="error">{error || 'Team not found.'}</Alert>
            </PageWrap>
        );
    }

    const panel = (key) => ({ sx: { display: tab === key ? 'block' : 'none' } });

    return (
        <PageWrap>
            <BackButton onBack={leave} />
            <PageHeading
                eyebrow={
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <TeamMark team={team} size={20} />
                        {teamName}
                    </Box>
                }
                title="Team appearance"
            />
            {!canEdit && (
                <Alert severity="info" sx={{ mb: '16px' }}>
                    You can only edit your own team&apos;s appearance. This is a read-only preview.
                </Alert>
            )}
            <Box sx={{ mb: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <SegTabs value={tab} onChange={setTab} options={tabs} ariaLabel="Appearance section" />
                {canEdit && hasUnsaved && (
                    <Box
                        component="button"
                        type="button"
                        onClick={saveAll}
                        disabled={savingAll}
                        sx={{
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
                        }}
                    >
                        {savingAll ? 'Saving all...' : 'Save all tabs'}
                    </Box>
                )}
            </Box>
            {uniform && (
                <Box {...panel('uniform')}>
                    <AppearanceEditor
                        ref={uniformRef}
                        team={teamName}
                        view="UNIFORM"
                        half="uniform"
                        sections={UNIFORM_SECTIONS}
                        source={uniform}
                        teamColors={colors}
                        canEdit={canEdit}
                        previewGroups={[
                            { title: 'Primary helmet', views: [{ view: 'HELMET' }] },
                            { title: 'Home jersey', views: [{ view: 'JERSEY' }] },
                            { title: 'Away jersey', views: [{ view: 'AWAY_JERSEY' }] },
                            {
                                title: 'Secondary helmet',
                                views: [{ view: 'SECONDARY_HELMET' }],
                                note: 'Worn by the away team when both shells clash.',
                            },
                        ]}
                        onDirtyChange={setTabDirty('uniform')}
                        onSave={async (payload) => {
                            const scope = loadScopeRef.current;
                            const savedUniform = await updateTeamUniform(teamName, payload);
                            if (scope.active) {
                                setUniform(savedUniform);
                            }
                            return savedUniform;
                        }}
                    />
                </Box>
            )}
            {field && (
                <Box {...panel('field')}>
                    <AppearanceEditor
                        ref={fieldRef}
                        team={teamName}
                        view="FIELD"
                        half="field"
                        sections={TEAM_FIELD_SECTIONS}
                        source={field}
                        teamColors={colors}
                        wallTextDefault={teamName}
                        previewGroups={[
                            { title: 'Field', views: [{ view: 'FIELD' }], note: 'Unsaved edits shown here. Save to apply.' },
                            {
                                title: 'Walls',
                                views: [
                                    { view: 'LEFT_WALL', label: 'Left wall' },
                                    { view: 'RIGHT_WALL', label: 'Right wall' },
                                ],
                            },
                        ]}
                        canEdit={canEdit}
                        onDirtyChange={setTabDirty('field')}
                        onSave={async (payload) => {
                            const scope = loadScopeRef.current;
                            const savedField = await updateTeamField(teamName, payload);
                            if (scope.active) {
                                setField(savedField);
                            }
                            return savedField;
                        }}
                    />
                </Box>
            )}
            {colors && (
                <Box {...panel('colors')}>
                    <ColorsEditor
                        ref={colorsRef}
                        team={teamName}
                        source={colors}
                        isAdmin={isAdmin}
                        canEditTertiary={canEdit}
                        onDirtyChange={setTabDirty('colors')}
                        onSave={async (payload) => {
                            const scope = loadScopeRef.current;
                            const savedColors = await updateTeamColors(teamName, payload);
                            if (scope.active) {
                                setColors(savedColors);
                            }
                            return savedColors;
                        }}
                    />
                </Box>
            )}
            {isAdmin && logos && (
                <Box {...panel('logos')}>
                    <LogosEditor
                        ref={logosRef}
                        team={teamName}
                        source={logos}
                        canEdit={isAdmin}
                        onDirtyChange={setTabDirty('logos')}
                        onSave={async (payload) => {
                            const scope = loadScopeRef.current;
                            const savedLogos = await updateTeamLogos(teamName, payload);
                            if (scope.active) {
                                setLogos(savedLogos);
                            }
                            return savedLogos;
                        }}
                    />
                </Box>
            )}
        </PageWrap>
    );
};

TeamAppearance.propTypes = {
    user: PropTypes.object,
};

export default TeamAppearance;
