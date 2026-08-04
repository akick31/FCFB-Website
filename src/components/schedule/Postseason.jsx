import React, { useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import TeamMark from '../ui/TeamMark';
import { R2_BYE_SEEDS, R1_GAMES, R2_OPPONENT_R1, playoffWeekForRound, QF_SEED_GROUPS, SF_SEED_GROUPS } from '../constants/playoffBracket';
import { field } from '../../utils/fieldHelper';
import { clickableProps } from '../../utils/a11y';

const LINE = 'var(--line)';

const bracketSx = {
    display: 'flex',
    overflowX: 'auto',
    py: 0.75,
    justifyContent: 'center',
    '& .brd': { display: 'flex', flexDirection: 'column', flex: '0 0 auto', width: 189, pr: '26px', position: 'relative' },
    '& .brd.final': { pr: 0 },
    '& .rl': { fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, color: 'var(--text-dim)', textAlign: 'center', mb: '8px' },
    '& .wk': { fontSize: '0.56rem', color: 'var(--text-dim)', textAlign: 'center', display: 'block', mt: '-4px', mb: '8px' },
    '& .brd-col': { display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-around' },
    '& .slot': { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: '3px', position: 'relative' },
    '& .bmatch': { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', overflow: 'hidden', width: '100%', cursor: 'pointer', position: 'relative' },
    '& .bmatch:hover': { borderColor: 'color-mix(in srgb, var(--brand) 50%, var(--line))' },
    '& .bmatch.ph': { opacity: 0.55, borderStyle: 'dashed', cursor: 'default' },
    '& .bteam': { display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 8px', fontSize: '0.74rem', minHeight: 24 },
    '& .bteam + .bteam': { borderTop: '1px solid var(--line-soft)' },
    '& .bteam .sd': { color: 'var(--text-dim)', fontWeight: 800, fontSize: '0.6rem', width: 14, flex: '0 0 auto', textAlign: 'right' },
    '& .bteam .nm': { fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 },
    '& .bteam.tbd .nm': { color: 'var(--text-dim)', fontStyle: 'italic' },
    '& .bteam .sc': { marginLeft: 'auto', fontFamily: 'var(--cond)', fontWeight: 800, fontSize: '0.78rem' },
    '& .bteam.loser': { color: 'var(--text-dim)' },
    '& .bstatus': { textAlign: 'center', lineHeight: 1, px: '4px', py: '3px', fontSize: '0.56rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--surface-2)', color: 'var(--text-dim)', borderTop: '1px solid var(--line-soft)' },
    '& .bactions': { display: 'flex', justifyContent: 'flex-end', gap: '4px', borderTop: '1px solid var(--line-soft)', px: '4px', py: '3px' },
    '& .bactions button': { border: 0, background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-dim)', padding: '1px 4px' },
    '& .bactions button:hover': { color: 'var(--text)' },
    '& .bactions button.danger:hover': { color: 'var(--live)' },
    '& .brd:not(.r1):not(.final) .slot::before': { content: '""', position: 'absolute', right: '-13px', top: '25%', bottom: '25%', width: '2px', background: LINE },
    '& .brd:not(.r1):not(.final) .slot::after': { content: '""', position: 'absolute', right: '-26px', top: '50%', width: '13px', height: '2px', background: LINE },
    '& .brd:not(.r1):not(.final) .bmatch::after': { content: '""', position: 'absolute', top: '50%', right: '-13px', width: '13px', height: '2px', background: LINE },
    '& .brd:not(.r1) .bmatch::before': { content: '""', position: 'absolute', top: '50%', left: '-13px', width: '13px', height: '2px', background: LINE },
    '& .brd.r1 .bmatch::after': { content: '""', position: 'absolute', top: '50%', right: '-26px', width: '26px', height: '2px', background: LINE },
};

const formatBracketQuarter = (q) => {
    if (q >= 6) return `${q - 4}OT`;
    if (q === 5) return 'OT';
    if (q === 4) return '4th';
    if (q === 3) return '3rd';
    if (q === 2) return '2nd';
    if (q === 1) return '1st';
    return '';
};

const Postseason = ({
    postseasonSchedule = [],
    teamMap = {},
    loading = false,
    adminMode = false,
    onAdvanceTeam,
    onDeleteGame,
}) => {
    const navigate = useNavigate();

    const playoffGames = useMemo(() =>
        postseasonSchedule.filter(g => {
            const gt = field(g, 'gameType', 'game_type');
            return gt === 'PLAYOFFS' || gt === 'NATIONAL_CHAMPIONSHIP';
        }), [postseasonSchedule]);

    const gamesByRound = useMemo(() => {
        const rounds = {};
        playoffGames.forEach(g => {
            const r = field(g, 'playoffRound', 'playoff_round') || 0;
            if (!rounds[r]) rounds[r] = [];
            rounds[r].push(g);
        });
        return rounds;
    }, [playoffGames]);

    const seedToTeam = useMemo(() => {
        const mapping = {};
        playoffGames.forEach(g => {
            const hs = field(g, 'playoffHomeSeed', 'playoff_home_seed');
            const as_ = field(g, 'playoffAwaySeed', 'playoff_away_seed');
            const home = field(g, 'homeTeam', 'home_team');
            const away = field(g, 'awayTeam', 'away_team');
            if (hs && home && home !== 'TBD' && home !== 'OPEN') mapping[hs] = home;
            if (as_ && away && away !== 'TBD' && away !== 'OPEN') mapping[as_] = away;
        });
        return mapping;
    }, [playoffGames]);

    const findR1Game = (highSeed, lowSeed) =>
        (gamesByRound[1] || []).find(g => {
            const hs = field(g, 'playoffHomeSeed', 'playoff_home_seed');
            const as_ = field(g, 'playoffAwaySeed', 'playoff_away_seed');
            return (hs === highSeed && as_ === lowSeed) || (hs === lowSeed && as_ === highSeed);
        });

    const findR2Game = (byeSeed) =>
        (gamesByRound[2] || []).find(g => {
            const hs = field(g, 'playoffHomeSeed', 'playoff_home_seed');
            const as_ = field(g, 'playoffAwaySeed', 'playoff_away_seed');
            return hs === byeSeed || as_ === byeSeed;
        });

    const getGameBracketPos = (game, seedGroups) => {
        const hs = field(game, 'playoffHomeSeed', 'playoff_home_seed') || 99;
        const as_ = field(game, 'playoffAwaySeed', 'playoff_away_seed') || 99;
        const minSeed = Math.min(hs, as_);
        for (let i = 0; i < seedGroups.length; i++) {
            if (seedGroups[i].includes(minSeed)) return i;
        }
        const maxSeed = Math.max(hs === 99 ? 0 : hs, as_ === 99 ? 0 : as_);
        for (let i = 0; i < seedGroups.length; i++) {
            if (seedGroups[i].includes(maxSeed)) return i;
        }
        return 99;
    };

    const getGamesForRound = (round, expectedCount, seedGroups) => {
        const roundGames = gamesByRound[round] || [];
        const result = Array(expectedCount).fill(null);
        for (const game of roundGames) {
            const pos = getGameBracketPos(game, seedGroups);
            if (pos >= 0 && pos < expectedCount) result[pos] = game;
        }
        return result;
    };

    const r2Data = useMemo(() =>
        R2_BYE_SEEDS.map((byeSeed, idx) => ({ byeSeed, r1: R2_OPPONENT_R1[idx], game: findR2Game(byeSeed) })),
        [gamesByRound]);

    const qfData = useMemo(() => getGamesForRound(3, 4, QF_SEED_GROUPS), [gamesByRound]);
    const sfData = useMemo(() => getGamesForRound(4, 2, SF_SEED_GROUPS), [gamesByRound]);
    const ncgData = useMemo(() => getGamesForRound(5, 1, [[1, 2, 3, 4, 5, 6, 7, 8]]), [gamesByRound]);

    const getTeamDisplayName = (teamName) => {
        if (!teamName || teamName === 'TBD' || teamName === 'OPEN') return null;
        const td = teamMap[teamName];
        return td?.abbreviation || teamName?.substring(0, 14);
    };

    const getWinnerLabel = (game) => {
        if (!game) return null;
        const home = field(game, 'homeTeam', 'home_team');
        const away = field(game, 'awayTeam', 'away_team');
        const homeName = getTeamDisplayName(home);
        const awayName = getTeamDisplayName(away);
        return (homeName && awayName) ? `${homeName}/${awayName}` : null;
    };

    const getQFLabels = (qfIndex) => {
        const r2Game1 = r2Data[qfIndex * 2]?.game;
        const r2Game2 = r2Data[qfIndex * 2 + 1]?.game;
        return {
            top: getWinnerLabel(r2Game1) || `R2 Game ${qfIndex * 2 + 1}`,
            bottom: getWinnerLabel(r2Game2) || `R2 Game ${qfIndex * 2 + 2}`,
        };
    };

    const getSFLabels = (sfIndex) => {
        const qfGame1 = qfData[sfIndex * 2];
        const qfGame2 = qfData[sfIndex * 2 + 1];
        return { top: getWinnerLabel(qfGame1) || `QF ${sfIndex * 2 + 1}`, bottom: getWinnerLabel(qfGame2) || `QF ${sfIndex * 2 + 2}` };
    };

    const getNCGLabel = () => ({ top: getWinnerLabel(sfData[0]) || 'SF 1', bottom: getWinnerLabel(sfData[1]) || 'SF 2' });

    const teamRow = (teamName, seed, score, isWinner, customLabel) => {
        const isTBD = !teamName || teamName === 'TBD' || teamName === 'OPEN';
        const displayText = isTBD && customLabel ? customLabel : (isTBD ? 'TBD' : (teamMap[teamName]?.abbreviation || teamName));
        return (
            <Box className={`bteam ${isTBD ? 'tbd' : ''} ${!isWinner && !isTBD && score != null ? 'loser' : ''}`}>
                {seed != null && <Box component="span" className="sd">{seed}</Box>}
                {!isTBD && <TeamMark team={teamMap[teamName] || { name: teamName }} size={16} />}
                <Box component="span" className="nm">{displayText}</Box>
                {score != null && <Box component="span" className="sc">{score}</Box>}
            </Box>
        );
    };

    const renderGameCard = (game, customAwayLabel) => {
        if (!game) return null;
        const home = field(game, 'homeTeam', 'home_team');
        const away = field(game, 'awayTeam', 'away_team');
        const hs = field(game, 'playoffHomeSeed', 'playoff_home_seed');
        const as_ = field(game, 'playoffAwaySeed', 'playoff_away_seed');
        const fin = field(game, 'finished', 'finished');
        const started = field(game, 'started', 'started');
        const hsc = field(game, 'homeScore', 'home_score');
        const asc = field(game, 'awayScore', 'away_score');
        const gid = field(game, 'gameId', 'game_id');
        const quarter = field(game, 'quarter', 'quarter');
        const clock = field(game, 'clock', 'clock') || field(game, 'gameClock', 'game_clock');
        const status = game.game_status || field(game, 'gameStatus', 'game_status') || field(game, 'status', 'status');
        const homeWon = fin && hsc != null && hsc > asc;
        const awayWon = fin && asc != null && asc > hsc;
        const clickable = !adminMode && gid && (started || fin);

        let statusText = null;
        if (fin || status === 'FINAL' || status === 'COMPLETED') {
            statusText = 'Final';
        } else if (started) {
            if (status === 'HALFTIME') statusText = 'Halftime';
            else if (status === 'OPENING_KICKOFF') statusText = 'Kickoff';
            else if (status === 'END_OF_REGULATION') statusText = 'End of Reg';
            else if (status === 'OVERTIME') statusText = 'OT';
            else {
                const qtr = formatBracketQuarter(quarter);
                const time = (quarter >= 5) ? '' : (clock || '');
                statusText = (qtr && time) ? `${qtr} | ${time}` : (qtr || (status ? status.replace(/_/g, ' ') : null));
            }
        }

        return (
            <Box
                className="bmatch"
                {...(clickable ? clickableProps(() => navigate(`/game-details/${gid}`)) : {})}
            >
                {teamRow(home, hs, (fin || started) ? hsc : null, homeWon)}
                {teamRow(away, as_, (fin || started) ? asc : null, awayWon, customAwayLabel)}
                {statusText && <Box className="bstatus">{statusText}</Box>}
                {adminMode && (onAdvanceTeam || onDeleteGame) && (
                    <Box className="bactions">
                        {onAdvanceTeam && <Box component="button" type="button" title="Advance winner" onClick={(e) => { e.stopPropagation(); onAdvanceTeam(game); }}>&rarr;</Box>}
                        {onDeleteGame && <Box component="button" type="button" className="danger" title="Delete game" onClick={(e) => { e.stopPropagation(); onDeleteGame(game.id); }}>&times;</Box>}
                    </Box>
                )}
            </Box>
        );
    };

    const renderPlaceholder = (topLabel, bottomLabel) => (
        <Box className="bmatch ph">
            <Box className="bteam tbd"><Box component="span" className="nm">{topLabel}</Box></Box>
            <Box className="bteam tbd"><Box component="span" className="nm">{bottomLabel}</Box></Box>
        </Box>
    );

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={40} /></Box>;
    }

    if (playoffGames.length === 0) {
        return <Box sx={{ color: 'var(--text-muted)', textAlign: 'center', py: 3 }}>No playoff games scheduled for this season.</Box>;
    }

    const round = (label, weekNum, cls, children) => (
        <Box className={`brd ${cls || ''}`}>
            <Box className="rl">{label}</Box>
            <Box component="span" className="wk">Wk {weekNum}</Box>
            <Box className="brd-col">{children}</Box>
        </Box>
    );

    return (
        <Box sx={bracketSx}>
            {round('First Round', playoffWeekForRound(1), 'r1', R1_GAMES.map((entry, idx) => (
                <Box key={idx} className="slot">
                    {renderGameCard(findR1Game(entry.highSeed, entry.lowSeed)) || renderPlaceholder(`#${entry.highSeed}`, `#${entry.lowSeed}`)}
                </Box>
            )))}

            {round('Second Round', playoffWeekForRound(2), '', r2Data.map((d, idx) => {
                const byeTeamName = seedToTeam[d.byeSeed];
                const r1Game = findR1Game(d.r1.h, d.r1.l);
                const winnerLabel = getWinnerLabel(r1Game) || `#${d.r1.h} / #${d.r1.l}`;
                return (
                    <Box key={idx} className="slot">
                        {renderGameCard(d.game, winnerLabel) || renderPlaceholder(`#${d.byeSeed} ${byeTeamName || '(BYE)'}`, winnerLabel)}
                    </Box>
                );
            }))}

            {round('Quarterfinals', playoffWeekForRound(3), '', qfData.map((game, idx) => {
                const labels = getQFLabels(idx);
                return <Box key={idx} className="slot">{renderGameCard(game) || renderPlaceholder(labels.top, labels.bottom)}</Box>;
            }))}

            {round('Semifinals', playoffWeekForRound(4), '', sfData.map((game, idx) => {
                const labels = getSFLabels(idx);
                return <Box key={idx} className="slot">{renderGameCard(game) || renderPlaceholder(labels.top, labels.bottom)}</Box>;
            }))}

            {round('Championship', playoffWeekForRound(5), 'final', [
                <Box key={0} className="slot">
                    {renderGameCard(ncgData[0]) || (() => { const labels = getNCGLabel(); return renderPlaceholder(labels.top, labels.bottom); })()}
                </Box>,
            ])}
        </Box>
    );
};

Postseason.propTypes = {
    postseasonSchedule: PropTypes.array,
    teamMap: PropTypes.object,
    loading: PropTypes.bool,
    adminMode: PropTypes.bool,
    onAdvanceTeam: PropTypes.func,
    onDeleteGame: PropTypes.func,
};

export default Postseason;
