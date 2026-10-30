import React, { useCallback, useEffect, useState } from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import TeamMark from '../../components/ui/TeamMark';
import FactList from '../../components/ui/FactList';
import StadiumEditDialog from '../../components/stadium/StadiumEditDialog';
import StadiumPreview from '../../components/stadium/StadiumPreview';
import StadiumResultsPanel from '../../components/stadium/StadiumResultsPanel';

import { eventsAt, isTeamStadium, locationOf } from '../../components/stadium/stadiumUsage';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { checkIfUserIsAdmin } from '../../utils/utils';
import { stadiumPath } from '../../utils/stadiumPath';
import { getStadium, getStadiumById, getStadiumGames } from '../../api/stadiumApi';
import { primaryButtonSx } from '../../styles/controls';

const StadiumPage = () => {
    const { id: pathId } = useParams();
    const [params] = useSearchParams();
    const byId = /^\d+$/.test(pathId || '');
    const name = params.get('name') || (byId ? null : pathId);
    const navigate = useNavigate();
    const teamsMap = useTeamsMap();
    const [isAdmin] = useState(checkIfUserIsAdmin);
    const [stadium, setStadium] = useState(null);
    const [games, setGames] = useState(null);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);

    const load = useCallback(async () => {
        try {
            const loadedStadium = byId ? await getStadiumById(pathId) : await getStadium(name);
            setStadium(loadedStadium);
            setGames(await getStadiumGames(loadedStadium.name));
            if (!byId && loadedStadium.id) {
                navigate(stadiumPath(loadedStadium), { replace: true });
            }
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    }, [byId, pathId, name, navigate]);

    useEffect(() => {
        setStadium(null);
        load();
    }, [load]);

    if (error) {
        return (
            <PageWrap>
                <Alert severity="error">{error}</Alert>
            </PageWrap>
        );
    }
    if (!stadium || !games) {
        return (
            <PageWrap>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: '40px' }}>
                    <CircularProgress />
                </Box>
            </PageWrap>
        );
    }

    const facts = [
        isTeamStadium(stadium) ? `Home of ${stadium.teams.join(', ')}` : 'Neutral site',
        locationOf(stadium) || 'No location set',
        stadium.capacity && `${Number(stadium.capacity).toLocaleString()} seats`,
        eventsAt(stadium).length > 0 && `Hosts ${eventsAt(stadium).join(', ')}`,
        !stadium.active && 'Retired',
    ].filter(Boolean);
    const homeRecords = stadium.teams
        .map((team) => games.records.find((entry) => entry.team === team))
        .filter(Boolean)
        .map((record) => `${record.team} is ${record.wins}-${record.losses} at ${stadium.name} all-time`);

    return (
        <PageWrap>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    {stadium.teams.slice(0, 3).map((team) => (
                        <TeamMark key={team} team={teamsMap[team] || { name: team }} size={48} />
                    ))}
                    <Box sx={{ flex: 1, minWidth: 220 }}>
                        <Box component="h1" sx={{ m: 0, fontSize: '1.6rem', fontWeight: 900 }}>
                            {stadium.name}
                        </Box>
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                            <FactList items={facts} />
                        </Box>
                        {homeRecords.map((line) => (
                            <Box
                                key={line}
                                sx={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 700, mt: '2px' }}
                            >
                                {line}
                            </Box>
                        ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {isAdmin && (
                            <Box component="button" type="button" onClick={() => setEditing(true)} sx={primaryButtonSx}>
                                Edit stadium
                            </Box>
                        )}
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1.15fr)' },
                        gap: '16px',
                        alignItems: 'start',
                    }}
                >
                    <StadiumPreview venue={stadium.name} team={stadium.teams[0]} title="Field view" />
                    <StadiumResultsPanel games={games.games} records={games.records} />
                </Box>
            </Box>
            {isAdmin && (
                <StadiumEditDialog
                    open={editing}
                    stadium={stadium}
                    onClose={() => {
                        setEditing(false);
                        load();
                    }}
                    onChanged={load}
                    onMoved={(movedTo) => {
                        setEditing(false);
                        navigate(stadiumPath({ name: movedTo }), { replace: true });
                    }}
                />
            )}
        </PageWrap>
    );
};

export default StadiumPage;
