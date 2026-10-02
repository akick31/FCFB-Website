import React, { useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import BackButton from '../../components/ui/BackButton';
import AppearanceEditor from '../../components/team/appearance/AppearanceEditor';
import { TEAM_FIELD_SECTIONS } from '../../components/team/appearance/appearanceSections';
import { getGameById } from '../../api/gameApi';
import { getTeamColors } from '../../api/teamAppearanceApi';
import { getGameField, updateGameField } from '../../api/fieldAppearanceApi';
import { checkIfUserIsAdmin } from '../../utils/utils';

const GameAppearance = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const isAdmin = checkIfUserIsAdmin();
    const [game, setGame] = useState(null);
    const [field, setField] = useState(null);
    const [colors, setColors] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getGameById(gameId)
            .then((loadedGame) => {
                if (cancelled) return null;
                setGame(loadedGame);
                return Promise.all([getGameField(gameId), getTeamColors(loadedGame.home_team).catch(() => null)]);
            })
            .then((loaded) => {
                if (cancelled || !loaded) return;
                setField(loaded[0]);
                setColors(loaded[1]);
            })
            .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load game appearance'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [gameId]);

    if (loading) {
        return <PageWrap><Box sx={{ display: 'flex', justifyContent: 'center', p: '40px' }}><CircularProgress /></Box></PageWrap>;
    }
    if (error || !game) {
        return <PageWrap><BackButton onBack={() => navigate(-1)} /><Alert severity="error">{error || 'Game not found.'}</Alert></PageWrap>;
    }

    const isFinal = game.game_status === 'FINAL';
    const canEdit = isAdmin && !isFinal;

    return (
        <PageWrap>
            <BackButton onBack={() => navigate(`/game-details/${gameId}`)} />
            <PageHeading eyebrow={`${game.away_team} at ${game.home_team}`} title="Game appearance" />
            {isFinal && <Alert severity="info" sx={{ mb: '16px' }}>This game is final. Its field is frozen and can no longer be changed.</Alert>}
            {!isAdmin && <Alert severity="info" sx={{ mb: '16px' }}>Only admins or commissioners can change a game&apos;s field.</Alert>}
            {field && (
                <AppearanceEditor
                    team={game.home_team}
                    view="FIELD"
                    half="field"
                    sections={TEAM_FIELD_SECTIONS}
                    source={field}
                    teamColors={colors}
                    wallTextDefault={game.home_team}
                    canEdit={canEdit}
                    onSave={async (payload) => { setField(await updateGameField(gameId, payload)); }}
                />
            )}
        </PageWrap>
    );
};

GameAppearance.propTypes = { user: PropTypes.object };

export default GameAppearance;
