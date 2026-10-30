import React from 'react';
import PropTypes from 'prop-types';
import TeamAbbr from '../home/TeamAbbr';

const rankPrefix = (rank) => (rank ? `#${rank} ` : '');

const GameLine = ({ game }) => (
    <>
        <TeamAbbr name={game.home_team} prefix={rankPrefix(game.home_rank)} />
        <span>
            {game.home_score}-{game.away_score}
        </span>
        <TeamAbbr name={game.away_team} prefix={rankPrefix(game.away_rank)} />
    </>
);

GameLine.propTypes = {
    game: PropTypes.shape({
        away_team: PropTypes.string,
        home_team: PropTypes.string,
        away_score: PropTypes.number,
        home_score: PropTypes.number,
        away_rank: PropTypes.number,
        home_rank: PropTypes.number,
    }).isRequired,
};

export default GameLine;
