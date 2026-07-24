import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import TeamMark from '../../ui/TeamMark';
import StatusPill from '../../ui/StatusPill';
import GameTypeLabel from './GameTypeLabel';
import { useColorMode } from '../../../theme/ColorModeContext';
import { pickTeamColor } from '../../../utils/teamColor';
import { isGameOngoing, formatBallLocationWithTeam } from '../scoreboard/utils/scoreboardFormatters';
import { formatScoreboardQuarter, formatDownAndDistance } from '../../../utils/gameUtils';
import { describePlay } from '../../../utils/formatPlay';
import { getGameStatsByIdAndTeam } from '../../../api/gameStatsApi';
import { getPreviousPlay } from '../../../api/playApi';
import { ensureTeam } from '../../../hooks/useTeamsMap';

const QUARTER_KEYS = ['q1_score', 'q2_score', 'q3_score', 'q4_score'];
const sum = (values) => values.reduce((total, value) => total + (value || 0), 0);

const useQuarterScores = (game) => {
    const [stats, setStats] = useState({ home: null, away: null });
    useEffect(() => {
        if (!game?.game_id || !game.home_team || !game.away_team) return;
        let active = true;
        Promise.all([
            getGameStatsByIdAndTeam(game.game_id, game.home_team).catch(() => null),
            getGameStatsByIdAndTeam(game.game_id, game.away_team).catch(() => null),
        ]).then(([home, away]) => {
            if (active) setStats({ home: home?.data || home || null, away: away?.data || away || null });
        });
        return () => { active = false; };
    }, [game?.game_id, game?.home_team, game?.away_team, game?.home_score, game?.away_score]);
    return stats;
};

const useLivePlay = (game, ongoing) => {
    const [play, setPlay] = useState(null);
    useEffect(() => {
        if (!game?.game_id || !ongoing) { setPlay(null); return undefined; }
        let active = true;
        getPreviousPlay(game.game_id).then((next) => { if (active) setPlay(next); }).catch(() => {});
        return () => { active = false; };
    }, [game?.game_id, ongoing, game?.home_score, game?.away_score]);
    return play;
};

const TeamRow = ({ team, name, rank, score, quarters, columns, isWinner, hasPossession, grid, size }) => (
    <Box sx={{ display: 'grid', alignItems: 'center', columnGap: '9px', px: 1.5, py: 1.1, position: 'relative', gridTemplateColumns: grid, borderTop: '1px solid var(--line-soft)', '&:first-of-type': { borderTop: 'none' } }}>
        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', backgroundColor: team?.__stripe }} />
        {hasPossession !== undefined && (
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: hasPossession ? 'var(--field)' : 'transparent', flexShrink: 0 }} />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
            <TeamMark team={team} size={size} />
            {rank > 0 && rank <= 25 && <Box component="span" sx={{ fontSize: '0.64rem', fontWeight: 800, color: 'var(--gold)' }}>#{rank}</Box>}
            <Box component="span" sx={{ fontWeight: 700, fontSize: size >= 26 ? '1.35rem' : '1.05rem', color: isWinner ? 'var(--text)' : 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {team?.name || name}
            </Box>
        </Box>
        {columns.map((_, index) => (
            <Box key={index} sx={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: size >= 26 ? '1.28rem' : '1.02rem', color: 'var(--text-muted)' }}>
                {quarters[index] != null ? quarters[index] : '-'}
            </Box>
        ))}
        <Box sx={{ textAlign: 'right', fontFamily: 'var(--cond)', fontWeight: 800, fontSize: size >= 26 ? '1.55rem' : '1.35rem', color: isWinner ? 'var(--text)' : 'var(--text-dim)' }}>
            {score}
        </Box>
    </Box>
);

TeamRow.propTypes = {
    team: PropTypes.object,
    name: PropTypes.string,
    rank: PropTypes.number,
    score: PropTypes.number,
    quarters: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    isWinner: PropTypes.bool,
    hasPossession: PropTypes.bool,
    grid: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
};

const GameCard = ({ game, teamsMap, compact = false }) => {
    const navigate = useNavigate();
    const { mode } = useColorMode();
    const ongoing = isGameOngoing(game.game_status);
    const stats = useQuarterScores(game);
    const play = useLivePlay(game, ongoing);

    const home = teamsMap[game.home_team];
    const away = teamsMap[game.away_team];
    useEffect(() => {
        if (!home) ensureTeam(game.home_team);
        if (!away) ensureTeam(game.away_team);
    }, [game.home_team, game.away_team, home, away]);

    const homeTeam = { ...(home || { name: game.home_team, abbreviation: game.home_team }), __stripe: pickTeamColor(home, mode) };
    const awayTeam = { ...(away || { name: game.away_team, abbreviation: game.away_team }), __stripe: pickTeamColor(away, mode) };

    const hasOt = Boolean(stats.home?.ot_score || stats.away?.ot_score);
    const keys = hasOt ? [...QUARTER_KEYS, 'ot_score'] : QUARTER_KEYS;
    const labels = hasOt ? ['Q1', 'Q2', 'Q3', 'Q4', 'OT'] : ['Q1', 'Q2', 'Q3', 'Q4'];
    const homeQuarters = keys.map((key) => stats.home?.[key]);
    const awayQuarters = keys.map((key) => stats.away?.[key]);
    const showQuarters = Boolean(stats.home && stats.away) && sum(homeQuarters) === game.home_score && sum(awayQuarters) === game.away_score;
    const columns = showQuarters ? labels : [];

    const qWidth = compact ? 50 : 64;
    const scWidth = compact ? 56 : 64;
    const logoSize = compact ? 24 : 27;
    const possCol = ongoing ? 'auto ' : '';
    const grid = showQuarters
        ? `${possCol}minmax(0,1fr) repeat(${columns.length}, ${qWidth}px) ${scWidth}px`
        : `${possCol}minmax(0,1fr) ${scWidth}px`;

    const homeWon = game.home_score > game.away_score;
    const awayWon = game.away_score > game.home_score;

    const homeWinProb = play?.win_probability != null
        ? (play.possession === 'HOME' ? play.win_probability : 1 - play.win_probability)
        : (game.win_probability != null ? (game.possession === 'HOME' ? game.win_probability : 1 - game.win_probability) : null);
    const homePct = homeWinProb != null ? Math.round(homeWinProb * 100) : null;
    const leaderIsHome = homePct != null && homePct >= 50;
    const leaderPct = homePct != null ? Math.max(homePct, 100 - homePct) : null;
    const leaderTeam = leaderIsHome ? homeTeam : awayTeam;

    const previousPlayText = ongoing && play ? describePlay(play, { homeName: game.home_team, awayName: game.away_team }) : null;

    return (
        <Box
            onClick={() => navigate(`/game-details/${game.game_id}`)}
            sx={{
                backgroundColor: 'var(--surface)',
                border: '1px solid',
                borderColor: ongoing ? 'color-mix(in srgb, var(--live) 42%, var(--line))' : 'var(--line)',
                borderRadius: 'var(--r)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform .14s, border-color .14s, box-shadow .14s',
                '&:hover': { transform: 'translateY(-2px)', borderColor: 'color-mix(in srgb, var(--brand) 55%, var(--line))', boxShadow: 'var(--shadow)' },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.9, backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--line-soft)' }}>
                <GameTypeLabel game={game} homeTeam={home} />
                <Box sx={{ ml: 'auto', display: 'flex', gap: 0.6, alignItems: 'center' }}>
                    {game.close_game && ongoing && <StatusPill variant="close">Close</StatusPill>}
                    {game.upset_alert && ongoing && <StatusPill variant="upset">Upset</StatusPill>}
                    {game.game_mode === 'CHEW' && <StatusPill variant="chew">Chew</StatusPill>}
                    {ongoing ? (
                        <StatusPill variant="live"><Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#fff' }} />Live</StatusPill>
                    ) : (
                        <StatusPill variant="final">{game.game_type === 'NATIONAL_CHAMPIONSHIP' ? 'Championship' : 'Final'}</StatusPill>
                    )}
                </Box>
            </Box>

            {showQuarters && (
                <Box sx={{ display: 'grid', columnGap: '9px', px: 1.5, pt: 0.6, pb: 0.3, gridTemplateColumns: grid, backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--line-soft)' }}>
                    {ongoing && <span />}
                    <span />
                    {columns.map((label) => (
                        <Box key={label} sx={{ textAlign: 'center', fontSize: '0.66rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</Box>
                    ))}
                    <span />
                </Box>
            )}

            <TeamRow team={awayTeam} name={game.away_team} rank={game.away_team_rank} score={game.away_score} quarters={awayQuarters} columns={columns} isWinner={awayWon || ongoing} hasPossession={ongoing ? game.possession === 'AWAY' : undefined} grid={grid} size={logoSize} />
            <TeamRow team={homeTeam} name={game.home_team} rank={game.home_team_rank} score={game.home_score} quarters={homeQuarters} columns={columns} isWinner={homeWon || ongoing} hasPossession={ongoing ? game.possession === 'HOME' : undefined} grid={grid} size={logoSize} />

            {ongoing ? (
                <>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 1, px: 1.5, py: 1, backgroundColor: 'var(--surface-2)', borderTop: '1px solid var(--line-soft)', fontSize: '0.74rem' }}>
                        <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, color: 'var(--brand)', whiteSpace: 'nowrap' }}>
                            {formatScoreboardQuarter(game.quarter)} {game.clock}
                        </Box>
                        <Box sx={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            {game.down ? `${formatDownAndDistance(game.down, game.yards_to_go)} ${formatBallLocationWithTeam(game.ball_location, game.possession, game.home_team, game.away_team, home, away)}` : ''}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, justifyContent: 'flex-end', color: 'var(--text-dim)', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--field)' }} />
                            {(game.possession === 'HOME' ? homeTeam : awayTeam).abbreviation} ball
                        </Box>
                    </Box>
                    {previousPlayText && (
                        <Box sx={{ px: 1.5, py: 0.7, fontSize: '0.72rem', color: 'var(--text-muted)', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--line-soft)' }}>
                            <Box component="b" sx={{ color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.04em', mr: 0.75 }}>Prev</Box>
                            {previousPlayText}
                        </Box>
                    )}
                    {homePct != null && (
                        <Box sx={{ px: 1.5, py: 1, backgroundColor: 'var(--surface)', borderTop: '1px solid var(--line-soft)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6, fontSize: '0.64rem', fontWeight: 800 }}>
                                <Box component="span" sx={{ color: leaderTeam.__stripe }}>{leaderTeam.abbreviation} {leaderPct}% win probability</Box>
                                <Box component="span" sx={{ color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.55rem' }}>Win Prob</Box>
                            </Box>
                            <Box sx={{ height: 6, borderRadius: '3px', display: 'flex', overflow: 'hidden' }}>
                                <Box sx={{ width: `${100 - homePct}%`, backgroundColor: awayTeam.__stripe }} />
                                <Box sx={{ width: `${homePct}%`, backgroundColor: homeTeam.__stripe }} />
                            </Box>
                        </Box>
                    )}
                </>
            ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1.5, py: 0.8, backgroundColor: 'var(--surface-2)', borderTop: '1px solid var(--line-soft)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    <span>{game.num_plays ? `${game.num_plays} plays` : ''}</span>
                    <span>{game.home_vegas_spread != null ? `${homeTeam.abbreviation} ${game.home_vegas_spread > 0 ? '+' : ''}${game.home_vegas_spread}` : ''}</span>
                </Box>
            )}
        </Box>
    );
};

GameCard.propTypes = {
    game: PropTypes.object.isRequired,
    teamsMap: PropTypes.object.isRequired,
    compact: PropTypes.bool,
};

export default GameCard;
