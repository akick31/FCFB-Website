import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import DataTable from '../ui/DataTable';
import Pager from '../ui/Pager';
import { GAME_TYPE_DESCRIPTIONS, GAME_STATUS_DESCRIPTIONS } from '../../constants/gameEnums';

const pillSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', px: '8px', py: '3px', borderRadius: 'var(--r-sm)', lineHeight: 1 };
const editBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '10px', py: '5px', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };

const GamesTable = ({ games, loading, currentPage, pageSize, totalGames, pageCount, onPageChange }) => {
    if (loading) {
        return <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    }
    if (games.length === 0) {
        return <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No games found.</Box>;
    }
    return (
        <Box sx={{ p: '16px' }}>
            <DataTable minWidth={720}>
                <thead>
                    <tr>
                        <th className="lft stick">Teams</th>
                        <th className="lft">Score</th>
                        <th>Quarter</th>
                        <th>Clock</th>
                        <th className="lft">Game type</th>
                        <th className="lft">Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {games.map((game) => (
                        <tr key={game.game_id || game.gameId}>
                            <td className="lft stick">{game.awayTeam || game.away_team} @ {game.homeTeam || game.home_team}</td>
                            <td className="lft">{game.awayScore || game.away_score || 0} - {game.homeScore || game.home_score || 0}</td>
                            <td>{game.quarter || 1}</td>
                            <td>{game.clock || game.game_clock || '00:00'}</td>
                            <td className="lft">
                                <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: 'var(--brand)' }}>{GAME_TYPE_DESCRIPTIONS[game.gameType || game.game_type] || 'Unknown'}</Box>
                            </td>
                            <td className="lft">
                                <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: game.gameStatus === 'IN_PROGRESS' ? 'var(--field)' : 'var(--text-muted)' }}>{GAME_STATUS_DESCRIPTIONS[game.gameStatus || game.game_status] || 'Unknown'}</Box>
                            </td>
                            <td>
                                <Box component={Link} to={`/admin/edit-game/${game.game_id}`} sx={{ ...editBtnSx, textDecoration: 'none', display: 'inline-block' }}>Edit</Box>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </DataTable>

            {totalGames > pageSize && (
                <>
                    <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', mt: '10px' }}>
                        Showing {Math.min(currentPage * pageSize + 1, totalGames)} to {Math.min((currentPage + 1) * pageSize, totalGames)} of {totalGames} games
                    </Box>
                    <Pager page={currentPage} pageCount={pageCount} onChange={onPageChange} />
                </>
            )}
        </Box>
    );
};

GamesTable.propTypes = {
    games: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    currentPage: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    totalGames: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default GamesTable;
