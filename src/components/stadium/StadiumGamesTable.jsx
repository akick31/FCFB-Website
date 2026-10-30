import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import DataTable from '../ui/DataTable';
import TableMessageRow from '../ui/TableMessageRow';
import TeamName from '../ui/TeamName';

const scoreSx = {
    color: 'var(--text)',
    fontWeight: 800,
    fontVariantNumeric: 'tabular-nums',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
};

const scoreOf = (game) => {
    if (!game.game_id) {
        return <Box sx={{ color: 'var(--text-dim)' }}>Scheduled</Box>;
    }
    return (
        <Box component={Link} to={`/game-details/${game.game_id}`} sx={scoreSx}>
            {game.final ? `${game.away_score}–${game.home_score}` : 'Live'}
        </Box>
    );
};

const winnerWeight = (game, side) => {
    if (!game.final) {
        return 600;
    }
    const mine = side === 'away' ? game.away_score : game.home_score;
    const theirs = side === 'away' ? game.home_score : game.away_score;
    return mine > theirs ? 800 : 500;
};

const StadiumGamesTable = ({ games }) => (
    <DataTable minWidth={560} phoneMinWidth={0} tableLayout="fixed" dense>
        <thead>
            <tr>
                <th className="lft wide" style={{ width: 70 }}>
                    Season
                </th>
                <th className="lft wide" style={{ width: '18%' }}>
                    Week
                </th>
                <th>Away</th>
                <th style={{ width: 84, textAlign: 'center' }}>Score</th>
                <th className="lft">Home</th>
            </tr>
        </thead>
        <tbody>
            {games.length === 0 && <TableMessageRow colSpan={5}>No games match.</TableMessageRow>}
            {games.map((game) => (
                <tr key={game.game_id ?? `${game.season}-${game.week}-${game.home_team}`}>
                    <td className="lft wide">{game.season}</td>
                    <td className="lft wide">{game.postseason_game_name || `Week ${game.week}`}</td>
                    <td>
                        <Box
                            sx={{ display: 'flex', justifyContent: 'flex-end', fontWeight: winnerWeight(game, 'away') }}
                        >
                            <TeamName name={game.away_team} size={18} sx={{ flexDirection: 'row-reverse' }} />
                        </Box>
                    </td>
                    <td style={{ textAlign: 'center' }}>{scoreOf(game)}</td>
                    <td className="lft">
                        <Box sx={{ fontWeight: winnerWeight(game, 'home') }}>
                            <TeamName name={game.home_team} size={18} />
                        </Box>
                    </td>
                </tr>
            ))}
        </tbody>
    </DataTable>
);

StadiumGamesTable.propTypes = {
    games: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default StadiumGamesTable;
