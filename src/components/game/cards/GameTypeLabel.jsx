import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { getConference } from '../../constants/conferences';
import PlayoffLogo from '../../ui/PlayoffLogo';

const PLAYOFF_ROUNDS = { 1: 'First Round', 2: 'Second Round', 3: 'Quarterfinal', 4: 'Semifinal' };

const LogoImg = ({ src }) =>
    src ? <Box component="img" src={src} alt="" sx={{ height: 15, width: 'auto', objectFit: 'contain', flexShrink: 0 }} /> : null;

LogoImg.propTypes = { src: PropTypes.string };

const resolve = (game, homeTeam) => {
    const conference = getConference(homeTeam?.conference);
    switch (game.game_type) {
        case 'NATIONAL_CHAMPIONSHIP':
            return { node: <PlayoffLogo size={16} />, text: 'National Championship' };
        case 'PLAYOFFS':
            return { node: <PlayoffLogo size={16} />, text: PLAYOFF_ROUNDS[game.playoff_round] || 'Playoff' };
        case 'BOWL':
            return { logo: game.postseason_game_logo || null, text: game.postseason_game_name || 'Bowl' };
        case 'CONFERENCE_CHAMPIONSHIP':
            return { logo: conference?.logo_url || null, text: 'Championship Game' };
        case 'CONFERENCE_GAME':
            return { logo: conference?.logo_url || null, text: 'Conference Game' };
        case 'OUT_OF_CONFERENCE':
            return { logo: null, text: 'Out of Conference' };
        default:
            return { logo: conference?.logo_url || null, text: conference?.label || 'Game' };
    }
};

const GameTypeLabel = ({ game, homeTeam }) => {
    const { logo, node, text } = resolve(game, homeTeam);
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                color: 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.66rem',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                minWidth: 0,
            }}
        >
            {node || <LogoImg src={logo} />}
            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</Box>
        </Box>
    );
};

GameTypeLabel.propTypes = {
    game: PropTypes.object.isRequired,
    homeTeam: PropTypes.object,
};

export default GameTypeLabel;
