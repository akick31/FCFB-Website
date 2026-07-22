import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getFilteredGames } from '../../api/gameApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { isGameOngoing } from '../game/scoreboard/utils/scoreboardFormatters';
import { formatScoreboardQuarter } from '../../utils/gameUtils';
import TeamMark from '../ui/TeamMark';

const POLL_MS = 30000;

const loadGames = async () => {
    const live = await getFilteredGames({ category: 'ONGOING', sort: 'CLOSEST_TO_END', page: 0, size: 25 });
    const liveGames = live?.content || [];
    if (liveGames.length > 0) return liveGames;

    const past = await getFilteredGames({ category: 'PAST', sort: 'MOST_TIME_REMAINING', page: 0, size: 15 });
    return past?.content || [];
};

const statusLabel = (game) => {
    if (!isGameOngoing(game.game_status)) return 'FINAL';
    const quarter = formatScoreboardQuarter(game.quarter);
    return game.clock ? `${quarter} ${game.clock}` : quarter;
};

const TickerItem = ({ game, teamsMap, onOpen }) => {
    const home = teamsMap[game.home_team] || { abbreviation: game.home_team };
    const away = teamsMap[game.away_team] || { abbreviation: game.away_team };
    const homeWon = game.home_score > game.away_score;

    return (
        <Box
            onClick={() => onOpen(game.game_id)}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.9,
                px: 1.9,
                py: 0.9,
                borderRight: '1px solid var(--line-soft)',
                whiteSpace: 'nowrap',
                fontSize: '0.78rem',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'var(--surface)' },
            }}
        >
            <Box component="span" sx={{ fontSize: '0.56rem', fontWeight: 800, letterSpacing: '0.04em', color: isGameOngoing(game.game_status) ? 'var(--live)' : 'var(--text-dim)' }}>
                {statusLabel(game)}
            </Box>
            <TeamMark team={away} size={16} />
            <Box component="b" sx={{ fontWeight: 800, color: homeWon ? 'var(--text-dim)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{game.away_score}</Box>
            <TeamMark team={home} size={16} />
            <Box component="b" sx={{ fontWeight: 800, color: homeWon ? 'var(--text)' : 'var(--text-dim)', fontVariantNumeric: 'tabular-nums' }}>{game.home_score}</Box>
        </Box>
    );
};

TickerItem.propTypes = {
    game: PropTypes.object.isRequired,
    teamsMap: PropTypes.object.isRequired,
    onOpen: PropTypes.func.isRequired,
};

const LiveTicker = () => {
    const navigate = useNavigate();
    const teamsMap = useTeamsMap();
    const [games, setGames] = useState([]);
    const trackRef = useRef(null);

    useEffect(() => {
        let active = true;
        const refresh = () => loadGames().then((next) => { if (active) setGames(next); }).catch(() => {});
        refresh();
        const timer = setInterval(refresh, POLL_MS);
        return () => {
            active = false;
            clearInterval(timer);
        };
    }, []);

    const anyLive = games.some((game) => isGameOngoing(game.game_status));
    const scrollBy = (dir) => trackRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });

    if (games.length === 0) return null;

    return (
        <Box sx={{ display: 'flex', alignItems: 'stretch', backgroundColor: 'var(--brand-ink)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', px: '14px', fontFamily: 'var(--cond)', fontSize: '0.72rem', letterSpacing: '0.06em', color: '#cfe3ee', backgroundColor: 'var(--brand-deep)', borderRight: '1px solid var(--line)' }}>
                {anyLive ? 'LIVE' : 'SCORES'}
            </Box>
            <IconButton onClick={() => scrollBy(-1)} aria-label="Scroll scores left" sx={{ borderRadius: 0, color: 'var(--text-muted)', borderRight: '1px solid var(--line-soft)', '&:hover': { color: 'var(--text)', backgroundColor: 'var(--surface)' } }}>
                <ChevronLeft fontSize="small" />
            </IconButton>
            <Box ref={trackRef} sx={{ display: 'flex', overflowX: 'auto', flex: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                {games.map((game) => (
                    <TickerItem key={game.game_id} game={game} teamsMap={teamsMap} onOpen={(id) => navigate(`/game-details/${id}`)} />
                ))}
            </Box>
            <IconButton onClick={() => scrollBy(1)} aria-label="Scroll scores right" sx={{ borderRadius: 0, color: 'var(--text-muted)', borderLeft: '1px solid var(--line-soft)', '&:hover': { color: 'var(--text)', backgroundColor: 'var(--surface)' } }}>
                <ChevronRight fontSize="small" />
            </IconButton>
        </Box>
    );
};

export default LiveTicker;
