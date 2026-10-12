import React from 'react';
import { Box, Avatar } from '@mui/material';
import TeamMark from '../ui/TeamMark';
import { camelOrSnakeField } from '../../utils/fieldHelper';
import { resolveLogoUrl } from '../../utils/logoUrl';
import { cardSx, teamRowSx, removeXSx } from './postseasonStyles';

const PostseasonMatchupCard = ({ game, showEdit = false, teamMap, onEdit, onDelete }) => {
    const home = camelOrSnakeField(game, 'homeTeam', 'home_team');
    const away = camelOrSnakeField(game, 'awayTeam', 'away_team');
    const finished = camelOrSnakeField(game, 'finished', 'finished');
    const started = camelOrSnakeField(game, 'started', 'started');
    const homeScore = camelOrSnakeField(game, 'homeScore', 'home_score');
    const awayScore = camelOrSnakeField(game, 'awayScore', 'away_score');
    const logo = camelOrSnakeField(game, 'postseasonGameLogo', 'postseason_game_logo');
    const bowlName = camelOrSnakeField(game, 'postseasonGameName', 'postseason_game_name');
    const homeWon = finished && homeScore != null && homeScore > awayScore;
    const awayWon = finished && awayScore != null && awayScore > homeScore;

    return (
        <Box sx={cardSx}>
            {(logo || showEdit) && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        px: '12px',
                        py: '9px',
                        borderBottom: '1px solid var(--line-soft)',
                        background: 'var(--surface-2)',
                    }}
                >
                    {logo && <Avatar src={resolveLogoUrl(logo)} variant="rounded" sx={{ width: 28, height: 28 }} />}
                    {showEdit && (
                        <Box sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{bowlName || 'Unnamed bowl game'}</Box>
                    )}
                    {showEdit && (
                        <Box
                            component="button"
                            type="button"
                            onClick={() => onEdit(game)}
                            sx={{ ...removeXSx, color: 'var(--brand)', fontSize: '0.72rem', fontWeight: 700 }}
                        >
                            Edit
                        </Box>
                    )}
                </Box>
            )}
            <Box sx={teamRowSx(homeWon)}>
                <TeamMark team={teamMap[home] || { name: home }} size={22} />
                <Box sx={{ fontWeight: homeWon ? 800 : 600, fontSize: '0.85rem' }}>{home}</Box>
                {(finished || started) && homeScore != null && (
                    <Box sx={{ ml: 'auto', fontFamily: 'var(--cond)', fontWeight: 800 }}>{homeScore}</Box>
                )}
            </Box>
            <Box sx={teamRowSx(awayWon)}>
                <TeamMark team={teamMap[away] || { name: away }} size={22} />
                <Box sx={{ fontWeight: awayWon ? 800 : 600, fontSize: '0.85rem' }}>{away}</Box>
                {(finished || started) && awayScore != null && (
                    <Box sx={{ ml: 'auto', fontFamily: 'var(--cond)', fontWeight: 800 }}>{awayScore}</Box>
                )}
                <Box component="button" type="button" onClick={() => onDelete(game.id)} sx={removeXSx}>
                    &times;
                </Box>
            </Box>
        </Box>
    );
};

export default PostseasonMatchupCard;
