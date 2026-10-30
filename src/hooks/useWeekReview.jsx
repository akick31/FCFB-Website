import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import LinkListDialog from '../components/ui/LinkListDialog';
import UpsetLine from '../components/home/UpsetLine';
import TeamAbbr from '../components/home/TeamAbbr';
import GameLine from '../components/history/GameLine';
import { finalScore, formatMinutes, gamesById, withScores } from '../utils/weekHistory';
import { linkButtonSx } from '../styles/controls';

const linkSx = {
    display: 'inline-flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '4px',
    color: 'inherit',
    textDecoration: 'none',
    '&:hover': { color: 'var(--brand)' },
};

const GameLink = ({ gameId, children }) => (
    <Box component={Link} to={`/game-details/${gameId}`} sx={linkSx}>
        {children}
    </Box>
);

GameLink.propTypes = { gameId: PropTypes.number.isRequired, children: PropTypes.node };

const CountButton = ({ count, noun, onClick }) =>
    count > 0 ? (
        <Box component="button" type="button" onClick={onClick} sx={{ ...linkButtonSx, fontSize: 'inherit' }}>
            {count} {count === 1 ? noun.replace(/s$/, '') : noun}
        </Box>
    ) : (
        'None'
    );

CountButton.propTypes = {
    count: PropTypes.number.isRequired,
    noun: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

const gameRow = (id, label, game, extra = '') =>
    game && [
        id,
        label,
        <GameLink key={label} gameId={game.game_id}>
            {extra && <span>{extra}:</span>}
            <GameLine game={game} />
        </GameLink>,
    ];

const useWeekReview = (week) => {
    const [dialog, setDialog] = useState(null);
    const { highlights } = week;
    const byId = gamesById(week.games);
    const upsets = withScores(highlights.upsets, week.games);
    const spread = highlights.biggest_spread;
    const swing = highlights.biggest_swing;
    const fastest = highlights.fastest_game;
    const lists = {
        upsets: upsets.map((upset) => ({
            key: upset.game_id,
            to: `/game-details/${upset.game_id}`,
            content: <UpsetLine upset={upset} full plain />,
        })),
        ranked: highlights.ranked_losses.map((loss) => ({
            key: `${loss.game_id}-${loss.team}`,
            to: `/game-details/${loss.game_id}`,
            content: (
                <>
                    <TeamAbbr name={loss.team} prefix={`#${loss.rank} `} />
                    <span>lost to</span>
                    <TeamAbbr name={loss.opponent} suffix={`, ${finalScore(byId[loss.game_id])}`} />
                </>
            ),
        })),
        overtime: highlights.overtime_game_ids
            .map((id) => byId[id])
            .filter(Boolean)
            .map((game) => ({
                key: game.game_id,
                to: `/game-details/${game.game_id}`,
                content: <GameLine game={game} />,
            })),
    };
    const titles = { upsets: 'Upsets', ranked: 'Ranked teams that lost', overtime: 'Overtime games' };
    const rows = [
        upsets[0] && ['upset', 'Biggest upset', <UpsetLine key="upset" upset={upsets[0]} showLine />],
        [
            'upsets',
            'Upsets',
            <CountButton key="u" count={upsets.length} noun="upsets" onClick={() => setDialog('upsets')} />,
        ],
        [
            'ranked',
            'Ranked teams that lost',
            <CountButton key="r" count={lists.ranked.length} noun="teams" onClick={() => setDialog('ranked')} />,
        ],
        spread && [
            'spread',
            'Biggest spread',
            <GameLink key="spread" gameId={spread.game_id}>
                <TeamAbbr name={spread.favorite} suffix={` -${spread.points}`} />
                <span>{spread.favorite_won ? 'won' : 'lost'}</span>
            </GameLink>,
        ],
        swing && [
            'swing',
            'Biggest swing',
            <Box key="swing" component={Link} to={`/play-details/${swing.play_id}`} sx={linkSx}>
                <span>{Math.round(swing.swing * 100)}% for</span>
                <TeamAbbr name={swing.team} />
            </Box>,
        ],
        gameRow('closest', 'Closest game', byId[highlights.closest_game_id]),
        gameRow('blowout', 'Biggest blowout', byId[highlights.biggest_blowout_game_id]),
        gameRow('scoring', 'Highest scoring', byId[highlights.highest_scoring_game_id]),
        fastest && gameRow('fastest', 'Fastest game', byId[fastest.game_id], formatMinutes(fastest.minutes)),
        [
            'overtime',
            'Overtime',
            <CountButton key="ot" count={lists.overtime.length} noun="games" onClick={() => setDialog('overtime')} />,
        ],
    ]
        .filter(Boolean)
        .map(([id, label, value]) => ({ id, label, value }));
    const dialogElement = (
        <LinkListDialog
            open={Boolean(dialog)}
            title={dialog ? titles[dialog] : ''}
            items={dialog ? lists[dialog] : []}
            onClose={() => setDialog(null)}
        />
    );
    return { rows, dialog: dialogElement };
};

export default useWeekReview;
