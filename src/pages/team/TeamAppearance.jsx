import React, { useEffect, useMemo, useState } from 'react';
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
    getTeamUniform, updateTeamUniform, getTeamField, updateTeamField, getTeamColors, updateTeamColors, getTeamLogos, updateTeamLogos,
} from '../../api/teamAppearanceApi';
import { checkIfUserIsAdmin } from '../../utils/utils';

const BASE_TABS = [
    { value: 'uniform', label: 'Uniform' },
    { value: 'field', label: 'Field' },
    { value: 'colors', label: 'Colors' },
];

const TeamAppearance = ({ user }) => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState('uniform');
    const [team, setTeam] = useState(null);
    const [uniform, setUniform] = useState(null);
    const [field, setField] = useState(null);
    const [colors, setColors] = useState(null);
    const [logos, setLogos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const teamName = team?.name;

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getTeamById(teamId)
            .then((loadedTeam) => {
                if (cancelled) return null;
                setTeam(loadedTeam);
                const name = loadedTeam?.name;
                if (!name) throw new Error('Team not found');
                return Promise.all([getTeamUniform(name), getTeamField(name), getTeamColors(name), getTeamLogos(name)]);
            })
            .then((loaded) => {
                if (cancelled || !loaded) return;
                const [loadedUniform, loadedField, loadedColors, loadedLogos] = loaded;
                setUniform(loadedUniform);
                setField(loadedField);
                setColors(loadedColors);
                setLogos(loadedLogos);
            })
            .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load team appearance'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [teamId]);

    const isAdmin = useMemo(() => checkIfUserIsAdmin(), []);
    const tabs = useMemo(() => (isAdmin ? [...BASE_TABS, { value: 'logos', label: 'Logos' }] : BASE_TABS), [isAdmin]);
    const canEdit = useMemo(() => isAdmin || (!!user?.team && !!teamName && user.team === teamName), [isAdmin, user, teamName]);

    if (loading) {
        return <PageWrap><Box sx={{ display: 'flex', justifyContent: 'center', p: '40px' }}><CircularProgress /></Box></PageWrap>;
    }
    if (error || !teamName) {
        return <PageWrap><BackButton onBack={() => navigate(-1)} /><Alert severity="error">{error || 'Team not found.'}</Alert></PageWrap>;
    }

    return (
        <PageWrap>
            <BackButton onBack={() => navigate(-1)} />
            <PageHeading
                eyebrow={<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><TeamMark team={team} size={20} />{teamName}</Box>}
                title="Team appearance"
            />
            {!canEdit && <Alert severity="info" sx={{ mb: '16px' }}>You can only edit your own team&apos;s appearance. This is a read-only preview.</Alert>}
            <Box sx={{ mb: '16px' }}>
                <SegTabs value={tab} onChange={setTab} options={tabs} ariaLabel="Appearance section" />
            </Box>
            {tab === 'uniform' && uniform && (
                <AppearanceEditor
                    team={teamName}
                    view="UNIFORM"
                    half="uniform"
                    sections={UNIFORM_SECTIONS}
                    source={uniform}
                    teamColors={colors}
                    canEdit={canEdit}
                    onSave={async (payload) => { setUniform(await updateTeamUniform(teamName, payload)); }}
                />
            )}
            {tab === 'field' && field && (
                <AppearanceEditor
                    team={teamName}
                    view="FIELD"
                    half="field"
                    sections={TEAM_FIELD_SECTIONS}
                    source={field}
                    teamColors={colors}
                    wallTextDefault={teamName}
                    canEdit={canEdit}
                    onSave={async (payload) => { setField(await updateTeamField(teamName, payload)); }}
                />
            )}
            {tab === 'colors' && colors && (
                <ColorsEditor
                    team={teamName}
                    source={colors}
                    isAdmin={isAdmin}
                    canEditTertiary={canEdit}
                    onSave={async (payload) => { setColors(await updateTeamColors(teamName, payload)); }}
                />
            )}
            {tab === 'logos' && isAdmin && logos && (
                <LogosEditor
                    team={teamName}
                    source={logos}
                    canEdit={isAdmin}
                    onSave={async (payload) => { setLogos(await updateTeamLogos(teamName, payload)); }}
                />
            )}
        </PageWrap>
    );
};

TeamAppearance.propTypes = {
    user: PropTypes.object,
};

export default TeamAppearance;
