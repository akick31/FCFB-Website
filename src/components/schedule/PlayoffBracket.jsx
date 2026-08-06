import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import TeamMark from '../ui/TeamMark';
import { ensureTeam } from '../../hooks/useTeamsMap';

const ROUND_LABELS = { 1: 'First Round', 2: 'Second Round', 3: 'Quarterfinal', 4: 'Semifinal', 5: 'Championship' };
const LINE = 'var(--line)';

const chunkPairs = (games) => {
    const pairs = [];
    for (let index = 0; index < games.length; index += 2) pairs.push(games.slice(index, index + 2));
    return pairs;
};

const orderRoundGames = (games, nextRoundGames) => {
    if (!nextRoundGames || nextRoundGames.length === 0) return games;
    const feedIndex = (game) => {
        const teams = [game.home_team, game.away_team];
        const index = nextRoundGames.findIndex((next) => teams.includes(next.home_team) || teams.includes(next.away_team));
        return index === -1 ? nextRoundGames.length : index;
    };
    return games
        .map((game, originalIndex) => ({ game, originalIndex, feed: feedIndex(game) }))
        .sort((a, b) => a.feed - b.feed || a.originalIndex - b.originalIndex)
        .map((entry) => entry.game);
};

const bracketSx = {
    display: 'flex',
    overflowX: 'auto',
    py: 0.75,
    '& .brd': { display: 'flex', flexDirection: 'column', justifyContent: 'space-around', flex: '1 1 0', minWidth: 160, pr: '26px', position: 'relative' },
    '& .brd.out-none': { pr: 0 },
    '& .rl': { fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, color: 'var(--text-dim)', textAlign: 'center', mb: '8px', position: 'absolute', top: '-4px', left: 0, right: '26px' },
    '& .brd.out-none .rl': { right: 0 },
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
    '& .brd.out-paired .pair::before': { content: '""', position: 'absolute', right: '-13px', top: '25%', bottom: '25%', width: '2px', background: LINE },
    '& .brd.out-paired .pair > .bmatch::after': { content: '""', position: 'absolute', top: '50%', right: '-13px', width: '13px', height: '2px', background: LINE },
    '& .brd.out-paired .pair::after': { content: '""', position: 'absolute', right: '-26px', top: '50%', width: '13px', height: '2px', background: LINE },
    '& .brd.in .brd-inner > .bmatch::before, & .brd.in .pair > .bmatch::before': { content: '""', position: 'absolute', top: '50%', left: '-13px', width: '13px', height: '2px', background: LINE },
    '& .brd.out-single .bmatch::after': { content: '""', position: 'absolute', top: '50%', right: '-26px', width: '26px', height: '2px', background: LINE },
};

const PlayoffBracket = ({ rounds, teamsMap }) => {
    const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);

    const orderedRounds = useMemo(() => {
        const result = {};
        for (let i = roundNumbers.length - 1; i >= 0; i--) {
            const round = roundNumbers[i];
            const nextRound = roundNumbers[i + 1];
            result[round] = orderRoundGames(rounds[round] || [], nextRound != null ? result[nextRound] : null);
        }
        return result;
    }, [rounds, roundNumbers]);

    if (roundNumbers.length === 0) return null;
    const first = roundNumbers[0];

    const markFor = (name) => {
        if (!name) return { name };
        if (!teamsMap[name]) ensureTeam(name);
        return teamsMap[name] || { name };
    };

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
            <Box
                key={game.game_id || game.id}
                className="bmatch"
                component={game.game_id ? Link : 'div'}
                to={game.game_id ? `/game-details/${game.game_id}` : undefined}
                sx={{ textDecoration: 'none', color: 'inherit' }}
            >
                {teamRow(game.away_team, game.playoff_away_seed, game.away_score, game.away_score > game.home_score)}
                {teamRow(game.home_team, game.playoff_home_seed, game.home_score, homeWin)}
            </Box>
        );
    };

    return (
        <Box sx={bracketSx}>
            {roundNumbers.map((round, index) => {
                const games = orderedRounds[round] || [];
                const nextRound = roundNumbers[index + 1];
                const nextGames = nextRound != null ? orderedRounds[nextRound] : null;
                const hasIncoming = round !== first;
                const outgoingMode = !nextGames ? 'none' : nextGames.length * 2 === games.length ? 'paired' : nextGames.length === games.length ? 'single' : 'single';
                const inner = outgoingMode === 'paired'
                    ? <Box className="brd-inner">{chunkPairs(games).map((pair, pairIndex) => <Box key={pairIndex} className="pair">{pair.map(match)}</Box>)}</Box>
                    : <Box className="brd-inner">{games.map(match)}</Box>;
                return (
                    <Box key={round} className={`brd out-${outgoingMode} ${hasIncoming ? 'in' : ''}`}>
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
