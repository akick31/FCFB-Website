import React, { useEffect, useMemo, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import SegTabs from '../../components/ui/SegTabs';
import AppearanceEditor from '../../components/team/appearance/AppearanceEditor';
import { UNIFORM_SECTIONS, TEAM_FIELD_SECTIONS } from '../../components/team/appearance/appearanceSections';
import { getTeamByName } from '../../api/teamApi';
import { getTeamUniform, updateTeamUniform, getTeamField, updateTeamField } from '../../api/teamAppearanceApi';
import { checkIfUserIsAdmin } from '../../utils/utils';

const TAB_OPTIONS = [{ value: 'uniform', label: 'Uniform' }, { value: 'field', label: 'Field' }];

const TeamAppearance = ({ user }) => {
    const { teamName } = useParams();
    const [tab, setTab] = useState('uniform');
    const [team, setTeam] = useState(null);
    const [uniform, setUniform] = useState(null);
    const [field, setField] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Promise.all([getTeamByName(teamName), getTeamUniform(teamName), getTeamField(teamName)])
            .then(([loadedTeam, loadedUniform, loadedField]) => {
                if (cancelled) return;
                setTeam(loadedTeam);
                setUniform(loadedUniform);
                setField(loadedField);
            })
            .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load team appearance'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [teamName]);

    const canEdit = useMemo(() => checkIfUserIsAdmin() || (!!user?.team && user.team === teamName), [user, teamName]);

    if (loading) {
        return <PageWrap><Box sx={{ display: 'flex', justifyContent: 'center', p: '40px' }}><CircularProgress /></Box></PageWrap>;
    }
    if (error) {
        return <PageWrap><Alert severity="error">{error}</Alert></PageWrap>;
    }

    return (
        <PageWrap>
            <PageHeading eyebrow={team?.name || teamName} title="Team appearance" />
            {!canEdit && <Alert severity="info" sx={{ mb: '16px' }}>You can only edit your own team&apos;s appearance. This is a read-only preview.</Alert>}
            <Box sx={{ mb: '16px' }}>
                <SegTabs value={tab} onChange={setTab} options={TAB_OPTIONS} ariaLabel="Appearance section" />
            </Box>
            {tab === 'uniform' && uniform && (
                <AppearanceEditor
                    team={teamName}
                    view="UNIFORM"
                    half="uniform"
                    sections={UNIFORM_SECTIONS}
                    source={uniform}
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
                    canEdit={canEdit}
                    onSave={async (payload) => { setField(await updateTeamField(teamName, payload)); }}
                />
            )}
        </PageWrap>
    );
};

TeamAppearance.propTypes = {
    user: PropTypes.object,
};

export default TeamAppearance;
