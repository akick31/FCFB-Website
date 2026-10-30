import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Paged from '../ui/Paged';
import DataTable from '../ui/DataTable';
import TableMessageRow from '../ui/TableMessageRow';
import TeamName from '../ui/TeamName';
import { camelOrSnakeField } from '../../utils/fieldHelper';
import { resolveLogoUrl } from '../../utils/logoUrl';
import { compact, secondaryButtonSx } from '../../styles/controls';

const field = (game, camel, snake) => camelOrSnakeField(game, camel, snake);

const Side = ({ name, won }) =>
    name && name !== 'TBD' ? (
        <TeamName name={name} sx={{ fontWeight: won ? 800 : 600 }} />
    ) : (
        <Box component="span" sx={{ color: 'var(--text-dim)' }}>
            TBD
        </Box>
    );

Side.propTypes = { name: PropTypes.string, won: PropTypes.bool };

const resultOf = (game) => {
    const homeScore = field(game, 'homeScore', 'home_score');
    const awayScore = field(game, 'awayScore', 'away_score');
    if (field(game, 'finished', 'finished')) {
        return `Final ${awayScore}-${homeScore}`;
    }
    if (field(game, 'started', 'started')) {
        return `Live ${awayScore ?? 0}-${homeScore ?? 0}`;
    }
    return 'Not started';
};

const PostseasonGamesTable = ({ games, nameOf, emptyText, onEdit, onDelete }) => (
    <Paged rows={games} pageSize={20} noun="games">
        {(pageRows) => (
            <DataTable minWidth={720}>
                <thead>
                    <tr>
                        <th className="lft stick">Game</th>
                        <th className="lft">Matchup</th>
                        <th className="lft">Result</th>
                        <th className="lft">Venue</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {games.length === 0 && <TableMessageRow colSpan={5}>{emptyText}</TableMessageRow>}
                    {pageRows.map((game) => {
                        const home = field(game, 'homeTeam', 'home_team');
                        const away = field(game, 'awayTeam', 'away_team');
                        const finished = field(game, 'finished', 'finished');
                        const homeScore = field(game, 'homeScore', 'home_score');
                        const awayScore = field(game, 'awayScore', 'away_score');
                        const logo = field(game, 'postseasonGameLogo', 'postseason_game_logo');
                        return (
                            <tr key={game.id}>
                                <td className="lft stick">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {logo && (
                                            <Box
                                                component="img"
                                                src={resolveLogoUrl(logo)}
                                                alt=""
                                                sx={{ width: 24, height: 24, objectFit: 'contain' }}
                                            />
                                        )}
                                        <Box component="span" sx={{ fontWeight: 700 }}>
                                            {nameOf(game)}
                                        </Box>
                                    </Box>
                                </td>
                                <td className="lft">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                        <Side name={away} won={finished && awayScore > homeScore} />
                                        <Box component="span" sx={{ color: 'var(--text-dim)' }}>
                                            vs
                                        </Box>
                                        <Side name={home} won={finished && homeScore > awayScore} />
                                    </Box>
                                </td>
                                <td className="lft" style={{ color: 'var(--text-muted)' }}>
                                    {resultOf(game)}
                                </td>
                                <td className="lft" style={{ color: 'var(--text-muted)' }}>
                                    {field(game, 'venue', 'venue') || '-'}
                                </td>
                                <td>
                                    <Box sx={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                        {onEdit && (
                                            <Box
                                                component="button"
                                                type="button"
                                                onClick={() => onEdit(game)}
                                                sx={compact(secondaryButtonSx)}
                                            >
                                                Edit
                                            </Box>
                                        )}
                                        <Box
                                            component="button"
                                            type="button"
                                            onClick={() => onDelete(game.id)}
                                            sx={compact({ ...secondaryButtonSx, color: 'var(--live)' })}
                                        >
                                            Remove
                                        </Box>
                                    </Box>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </DataTable>
        )}
    </Paged>
);

PostseasonGamesTable.propTypes = {
    games: PropTypes.array.isRequired,
    nameOf: PropTypes.func.isRequired,
    emptyText: PropTypes.string.isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func.isRequired,
};

export default PostseasonGamesTable;
