import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import TeamName from '../ui/TeamName';
import GameTypeLabel from '../game/cards/GameTypeLabel';
import useLivePlay from '../../hooks/useLivePlay';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { useColorMode } from '../../context/ColorModeContext';
import { pickTeamColor } from '../../utils/teamColor';
import { homeWinProbability } from '../../utils/winProbability';
import { describePlay } from '../../utils/formatPlay';
import { formatBallLocationWithTeam, isGameOngoing } from '../game/scoreboard/utils/scoreboardFormatters';
import { formatDownAndDistance, formatScoreboardQuarter } from '../../utils/gameUtils';

const statusText = (game, ongoing) => {
    if (game.upcoming) {
        return 'Upcoming';
    }
    return ongoing ? `${formatScoreboardQuarter(game.quarter)} ${game.clock || ''}` : 'Final';
};

const dimSx = { color: 'var(--text-dim)', fontSize: '0.72rem' };

const Side = ({ name, rank, score, strong, possession }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, fontWeight: strong ? 800 : 500 }}>
        <Box
            sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                flexShrink: 0,
                background: possession ? 'var(--field)' : 'transparent',
            }}
        />
        {rank > 0 && rank <= 25 && (
            <Box component="span" sx={{ color: 'var(--gold)', fontSize: '0.64rem', fontWeight: 800 }}>
                #{rank}
            </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
            <TeamName name={name} size={18} sx={{ fontSize: '0.84rem' }} />
        </Box>
        <Box sx={{ fontFamily: 'var(--cond)', fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>
            {score ?? ''}
        </Box>
    </Box>
);

Side.propTypes = {
    name: PropTypes.string,
    rank: PropTypes.number,
    score: PropTypes.number,
    strong: PropTypes.bool,
    possession: PropTypes.bool,
};

const WinBar = ({ homePct, homeName, awayName, homeColor, awayColor }) => {
    const leaderIsHome = homePct >= 50;
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box
                sx={{
                    flex: 1,
                    height: 5,
                    borderRadius: '3px',
                    background: 'var(--surface-2)',
                    overflow: 'hidden',
                    display: 'flex',
                    gap: '2px',
                }}
            >
                <Box sx={{ width: `${100 - homePct}%`, background: awayColor }} />
                <Box sx={{ width: `${homePct}%`, background: homeColor }} />
            </Box>
            <Box sx={{ ...dimSx, whiteSpace: 'nowrap' }}>
                {leaderIsHome ? homeName : awayName} {Math.max(homePct, 100 - homePct)}%
            </Box>
        </Box>
    );
};

WinBar.propTypes = {
    homePct: PropTypes.number.isRequired,
    homeName: PropTypes.string,
    awayName: PropTypes.string,
    homeColor: PropTypes.string.isRequired,
    awayColor: PropTypes.string.isRequired,
};

const HomeGameRow = ({ game }) => {
    const teamsMap = useTeamsMap();
    const { mode } = useColorMode();
    const ongoing = isGameOngoing(game.game_status);
    const play = useLivePlay(game, ongoing);
    const home = teamsMap[game.home_team];
    const away = teamsMap[game.away_team];
    const homeProbability = ongoing ? homeWinProbability(game, play) : null;
    const situation =
        ongoing && game.down
            ? `${formatDownAndDistance(game.down, game.yards_to_go)} ${formatBallLocationWithTeam(
                  game.ball_location,
                  game.possession,
                  game.home_team,
                  game.away_team,
                  home,
                  away
              )}`
            : null;
    const lastPlay =
        ongoing && play ? describePlay(play, { homeName: game.home_team, awayName: game.away_team }) : null;
    return (
        <Box
            component={game.game_id ? Link : 'div'}
            to={game.game_id ? `/game-details/${game.game_id}` : undefined}
            data-home-game
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '58px minmax(0, 1fr)', sm: '64px minmax(0, 1fr) minmax(0, 1.1fr)' },
                gap: '4px 14px',
                alignItems: 'center',
                px: '12px',
                py: '7px',
                borderBottom: '1px solid var(--line-soft)',
                color: 'inherit',
                textDecoration: 'none',
                '&:last-of-type': { borderBottom: 0 },
                '&:hover': { background: 'var(--surface-2)' },
            }}
        >
            <Box
                sx={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: ongoing ? 'var(--live)' : 'var(--text-dim)',
                }}
            >
                {statusText(game, ongoing)}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                <Side
                    name={game.away_team}
                    rank={game.away_team_rank}
                    score={game.upcoming ? null : game.away_score}
                    strong={ongoing || game.upcoming || game.away_score > game.home_score}
                    possession={ongoing && game.possession === 'AWAY'}
                />
                <Side
                    name={game.home_team}
                    rank={game.home_team_rank}
                    score={game.upcoming ? null : game.home_score}
                    strong={ongoing || game.upcoming || game.home_score > game.away_score}
                    possession={ongoing && game.possession === 'HOME'}
                />
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                {ongoing ? (
                    <>
                        <Box sx={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>{situation}</Box>
                        {lastPlay && (
                            <Box sx={{ ...dimSx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {lastPlay}
                            </Box>
                        )}
                        {homeProbability != null && (
                            <WinBar
                                homePct={Math.round(homeProbability * 100)}
                                homeName={home?.abbreviation || game.home_team}
                                awayName={away?.abbreviation || game.away_team}
                                homeColor={pickTeamColor(home, mode)}
                                awayColor={pickTeamColor(away, mode)}
                            />
                        )}
                    </>
                ) : (
                    <Box sx={dimSx}>
                        <GameTypeLabel game={game} homeTeam={home} />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

HomeGameRow.propTypes = { game: PropTypes.object.isRequired };

export default HomeGameRow;
