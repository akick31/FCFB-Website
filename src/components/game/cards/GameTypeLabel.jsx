import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { getConference } from '../../constants/conferences';
import PlayoffLogo from '../../ui/PlayoffLogo';
import ConferenceMark from '../../ui/ConferenceMark';

const PLAYOFF_ROUNDS = { 1: 'First Round', 2: 'Second Round', 3: 'Quarterfinal', 4: 'Semifinal' };

const LogoImg = ({ src }) =>
    src ? <Box component="img" src={src} alt="" sx={{ height: 15, width: 'auto', objectFit: 'contain', flexShrink: 0 }} /> : null;

LogoImg.propTypes = { src: PropTypes.string };

const resolve = (game, homeTeam) => {
    const conferenceCode = homeTeam?.conference;
    const conferenceMark = conferenceCode ? <ConferenceMark conference={conferenceCode} size={15} /> : null;
    switch (game.game_type) {
        case 'NATIONAL_CHAMPIONSHIP':
            return { node: <PlayoffLogo size={16} />, text: 'National Championship' };
        case 'PLAYOFFS':
            return { node: <PlayoffLogo size={16} />, text: PLAYOFF_ROUNDS[game.playoff_round] || 'Playoff' };
        case 'BOWL':
            return { node: <LogoImg src={game.postseason_game_logo} />, text: game.postseason_game_name || 'Bowl' };
        case 'CONFERENCE_CHAMPIONSHIP':
            return { node: conferenceMark, text: 'Championship Game' };
        case 'CONFERENCE_GAME':
            return { node: conferenceMark, text: 'Conference Game' };
        case 'OUT_OF_CONFERENCE':
            return { node: null, text: 'Out of Conference' };
        default:
            return { node: conferenceMark, text: getConference(conferenceCode)?.label || 'Game' };
    }
};

const GameTypeLabel = ({ game, homeTeam }) => {
    const { node, text } = resolve(game, homeTeam);
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
            {node}
            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</Box>
        </Box>
    );
};

GameTypeLabel.propTypes = {
    game: PropTypes.object.isRequired,
    homeTeam: PropTypes.object,
};

export default GameTypeLabel;
