import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import TeamMark from '../../ui/TeamMark';
import TvLogo from '../../ui/TvLogo';
import GameTypeLabel from '../cards/GameTypeLabel';
import { formatScoreboardStatus } from '../../../utils/gameUtils';

const CoachlessName = ({ mark, name, rank, record, align, teamId }) => (
    <Box
        component={teamId ? Link : 'div'}
        to={teamId ? `/team-details/${teamId}` : undefined}
        sx={{ cursor: teamId ? 'pointer' : 'default', textAlign: align, minWidth: 0, textDecoration: 'none', color: 'inherit', '&:focus-visible': { outline: '2px solid var(--brand)', outlineOffset: '2px' } }}
    >
        <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, textTransform: 'uppercase', fontSize: { xs: '0.85rem', md: '1.25rem' }, lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {rank > 0 && rank <= 25 && <Box component="span" sx={{ color: 'var(--gold)', fontSize: '0.72em', mr: 0.5 }}>{rank}</Box>}
            {mark?.name || name}
        </Box>
        {record && <Box sx={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 600, mt: '2px' }}>{record}</Box>}
    </Box>
);

CoachlessName.propTypes = {
    mark: PropTypes.object,
    name: PropTypes.string,
    rank: PropTypes.number,
    record: PropTypes.string,
    align: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    teamId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const Score = ({ value, dimmed, winner, side }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        {winner && side === 'away' && null}
        {winner && side === 'home' && <Box component="span" sx={{ display: { xs: 'none', md: 'inline' }, color: 'var(--text)', fontSize: '0.9rem' }}>▸</Box>}
        <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontSize: { xs: '1.8rem', md: '2.9rem' }, lineHeight: 0.9, color: dimmed ? 'var(--text-dim)' : 'var(--text)' }}>{value}</Box>
        {winner && side === 'away' && <Box component="span" sx={{ display: { xs: 'none', md: 'inline' }, color: 'var(--text)', fontSize: '0.9rem' }}>◂</Box>}
    </Box>
);

Score.propTypes = { value: PropTypes.number, dimmed: PropTypes.bool, winner: PropTypes.bool, side: PropTypes.string };

const GameScorebug = ({ game, awayMark, homeMark, homeTeam, awayColor, homeColor, spreadText, venueText, threadLink, columns, awayQuarters, homeQuarters, showQuarters }) => {
    const homeWin = game.home_score > game.away_score;
    const overtime = game.quarter > 4;
    const finalLabel = game.game_status === 'FINAL'
        ? `Final${overtime ? ' / OT' : ''}`
        : formatScoreboardStatus(game.game_status);
    const awayRecord = `${game.away_wins || 0}-${game.away_losses || 0}`;
    const homeRecord = `${game.home_wins || 0}-${game.home_losses || 0}`;
    const quarterCols = [...columns, 'T'];
    const quarterGridCols = { xs: `26px repeat(${quarterCols.length}, 15px)`, md: `34px repeat(${quarterCols.length}, 22px)` };
    const quarterRow = (abbr, quarters, total) => (
        <Box sx={{ display: 'grid', gridTemplateColumns: quarterGridCols, alignItems: 'center', fontSize: '0.72rem' }}>
            <Box sx={{ color: 'var(--text-dim)', fontWeight: 800, fontSize: '0.6rem', overflow: 'hidden', whiteSpace: 'nowrap' }}>{abbr}</Box>
            {quarters.map((value, i) => <Box key={i} sx={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', color: 'var(--text-muted)' }}>{value ?? '-'}</Box>)}
            <Box sx={{ textAlign: 'center', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{total}</Box>
        </Box>
    );

    return (
        <Box sx={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', px: 2, py: 1.1, background: 'var(--surface-2)', borderBottom: '1px solid var(--line)', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, flexWrap: 'wrap' }}>
                <GameTypeLabel game={game} homeTeam={homeTeam} />
                <Box sx={{ ml: 'auto', display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {spreadText && (
                        <Box component="span">
                            <Box component="span" sx={{ color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.58rem', letterSpacing: '0.04em', mr: 0.6 }}>Spread</Box>{spreadText}
                        </Box>
                    )}
                    {game.tv_channel && <TvLogo channel={game.tv_channel} height={15} />}
                </Box>
            </Box>

            <Box
                sx={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: { xs: 'auto auto 1fr auto auto', md: 'auto 1fr auto auto auto 1fr auto' },
                    gridTemplateAreas: {
                        xs: '"awaylogo awayscore status homescore homelogo" "quarters quarters quarters quarters quarters"',
                        md: '"awaylogo awayname awayscore status homescore homename homelogo" ". . . quarters . . ."',
                    },
                    columnGap: { xs: '10px', md: '16px' },
                    rowGap: { xs: '8px', md: 0 },
                    alignItems: 'center',
                    px: { xs: 1.5, md: 3 },
                    py: '18px',
                }}
            >
                <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '26%', background: `linear-gradient(90deg, ${awayColor}, transparent)`, opacity: 0.16, pointerEvents: 'none' }} />
                <Box sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '26%', background: `linear-gradient(270deg, ${homeColor}, transparent)`, opacity: 0.16, pointerEvents: 'none' }} />

                <TeamMark team={awayMark} sx={{ gridArea: 'awaylogo', zIndex: 1, width: { xs: 44, md: 64 }, height: { xs: 44, md: 64 } }} />
                <Box sx={{ gridArea: 'awayname', minWidth: 0, zIndex: 1, display: { xs: 'none', md: 'block' } }}>
                    <CoachlessName mark={awayMark} name={game.away_team} rank={game.away_team_rank} record={awayRecord} align="right" teamId={awayMark?.id} />
                </Box>
                <Box sx={{ gridArea: 'awayscore', zIndex: 1 }}>
                    <Score value={game.away_score} dimmed={homeWin} winner={!homeWin} side="away" />
                </Box>

                <Box sx={{ gridArea: 'status', zIndex: 1, textAlign: 'center' }}>
                    <Box sx={{ fontFamily: 'var(--cond)', color: 'var(--text-dim)', fontSize: '0.8rem' }}>{finalLabel.toUpperCase()}</Box>
                </Box>

                <Box sx={{ gridArea: 'homescore', zIndex: 1 }}>
                    <Score value={game.home_score} dimmed={!homeWin} winner={homeWin} side="home" />
                </Box>
                <Box sx={{ gridArea: 'homename', minWidth: 0, zIndex: 1, display: { xs: 'none', md: 'block' } }}>
                    <CoachlessName mark={homeMark} name={game.home_team} rank={game.home_team_rank} record={homeRecord} align="left" teamId={homeMark?.id} />
                </Box>
                <TeamMark team={homeMark} sx={{ gridArea: 'homelogo', zIndex: 1, width: { xs: 44, md: 64 }, height: { xs: 44, md: 64 } }} />

                {showQuarters && (
                    <Box sx={{ gridArea: 'quarters', zIndex: 1, justifySelf: 'center', mt: '4px' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: quarterGridCols, fontSize: '0.58rem', color: 'var(--text-dim)', fontWeight: 800 }}>
                            <span />
                            {quarterCols.map((label) => <Box key={label} sx={{ textAlign: 'center' }}>{label}</Box>)}
                        </Box>
                        {quarterRow(awayMark?.abbreviation, awayQuarters, game.away_score)}
                        {quarterRow(homeMark?.abbreviation, homeQuarters, game.home_score)}
                    </Box>
                )}
            </Box>

            {venueText && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: threadLink ? 0.75 : 1.25, fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                    {venueText}
                </Box>
            )}

            {threadLink && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1.25, borderTop: '1px solid var(--line-soft)', pt: 1 }}>
                    <Box component="a" href={threadLink} target="_blank" rel="noopener noreferrer" sx={{ color: 'var(--brand)', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none' }}>Open game thread in Discord ↗</Box>
                </Box>
            )}
        </Box>
    );
};

GameScorebug.propTypes = {
    game: PropTypes.object.isRequired,
    awayMark: PropTypes.object,
    homeMark: PropTypes.object,
    homeTeam: PropTypes.object,
    awayColor: PropTypes.string,
    homeColor: PropTypes.string,
    spreadText: PropTypes.string,
    venueText: PropTypes.string,
    threadLink: PropTypes.string,
    columns: PropTypes.array.isRequired,
    awayQuarters: PropTypes.array.isRequired,
    homeQuarters: PropTypes.array.isRequired,
    showQuarters: PropTypes.bool,
};

export default GameScorebug;
