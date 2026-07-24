import React from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import TeamMark from '../ui/TeamMark';

const ROUND_LABELS = { 1: 'First Round', 2: 'Second Round', 3: 'Quarterfinal', 4: 'Semifinal', 5: 'Championship' };
const LINE = 'var(--line)';

const chunkPairs = (games) => {
    const pairs = [];
    for (let index = 0; index < games.length; index += 2) pairs.push(games.slice(index, index + 2));
    return pairs;
};

const bracketSx = {
    display: 'flex',
    overflowX: 'auto',
    py: 0.75,
    '& .brd': { display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: '1 1 0', minWidth: 160, pr: '26px', position: 'relative' },
    '& .brd.final': { pr: 0 },
    '& .rl': { fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, color: 'var(--text-dim)', textAlign: 'center', mb: '8px', position: 'absolute', top: '-4px', left: 0, right: '26px' },
    '& .brd.final .rl': { right: 0 },
    '& .brd-inner': { display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: '14px', mt: '14px' },
    '& .pair': { position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: 1, gap: '14px' },
    '& .bmatch': { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', overflow: 'hidden', cursor: 'pointer', position: 'relative' },
    '& .bmatch:hover': { borderColor: 'color-mix(in srgb, var(--brand) 50%, var(--line))' },
    '& .bteam': { display: 'flex', alignItems: 'center', gap: '7px', padding: '6px 9px', fontSize: '0.8rem' },
    '& .bteam + .bteam': { borderTop: '1px solid var(--line-soft)' },
    '& .bteam .sd': { color: 'var(--text-dim)', fontWeight: 800, fontSize: '0.62rem', width: 15, flex: '0 0 auto' },
    '& .bteam .nm': { fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    '& .bteam .sc': { marginLeft: 'auto', fontFamily: 'var(--cond)', fontWeight: 800 },
    '& .bteam.loser': { color: 'var(--text-dim)' },
    '& .brd:not(.r1):not(.final) .pair::before': { content: '""', position: 'absolute', right: '-13px', top: '25%', bottom: '25%', width: '2px', background: LINE },
    '& .brd:not(.r1):not(.final) .pair > .bmatch::after': { content: '""', position: 'absolute', top: '50%', right: '-13px', width: '13px', height: '2px', background: LINE },
    '& .brd:not(.r1):not(.final) .pair::after': { content: '""', position: 'absolute', right: '-26px', top: '50%', width: '13px', height: '2px', background: LINE },
    '& .brd:not(.r1) .brd-inner > .bmatch::before, & .brd:not(.r1) .pair > .bmatch::before': { content: '""', position: 'absolute', top: '50%', left: '-13px', width: '13px', height: '2px', background: LINE },
    '& .brd.r1 .bmatch::after': { content: '""', position: 'absolute', top: '50%', right: '-26px', width: '26px', height: '2px', background: LINE },
};

const PlayoffBracket = ({ rounds, teamsMap }) => {
    const navigate = useNavigate();
    const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);
    if (roundNumbers.length === 0) return null;
    const first = roundNumbers[0];
    const last = roundNumbers[roundNumbers.length - 1];

    const markFor = (name) => teamsMap[name] || { name };

    const teamRow = (name, seed, score, isWinner) => (
        <Box className={`bteam ${isWinner ? '' : 'loser'}`}>
            <Box component="span" className="sd">{seed || ''}</Box>
            <TeamMark team={markFor(name)} size={18} />
            <Box component="span" className="nm">{name}</Box>
            <Box component="span" className="sc">{score}</Box>
        </Box>
    );

    const match = (game) => {
        const homeWin = game.home_score > game.away_score;
        return (
            <Box key={game.game_id || game.id} className="bmatch" onClick={() => game.game_id && navigate(`/game-details/${game.game_id}`)}>
                {teamRow(game.away_team, game.playoff_away_seed, game.away_score, game.away_score > game.home_score)}
                {teamRow(game.home_team, game.playoff_home_seed, game.home_score, homeWin)}
            </Box>
        );
    };

    return (
        <Box sx={bracketSx}>
            {roundNumbers.map((round) => {
                const games = rounds[round] || [];
                const isEntry = round === first;
                const isFinal = round === last;
                const inner = (isEntry || isFinal)
                    ? <Box className="brd-inner">{games.map(match)}</Box>
                    : <Box className="brd-inner">{chunkPairs(games).map((pair, index) => <Box key={index} className="pair">{pair.map(match)}</Box>)}</Box>;
                return (
                    <Box key={round} className={`brd ${isEntry ? 'r1' : ''} ${isFinal ? 'final' : ''}`}>
                        <Box className="rl">{ROUND_LABELS[round] || `Round ${round}`}</Box>
                        {inner}
                    </Box>
                );
            })}
        </Box>
    );
};

PlayoffBracket.propTypes = {
    rounds: PropTypes.object.isRequired,
    teamsMap: PropTypes.object.isRequired,
};

export default PlayoffBracket;
