import React, { useEffect, useMemo, useRef, useState } from 'react';
import { visuallyHidden } from '@mui/utils';
import { Box, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Assessment, RestaurantMenu, Stop, Close, Palette } from '@mui/icons-material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getGameById, chewGameByGameId, unchewGameByGameId, endGameByGameId } from '../../api/gameApi';
import { getAllPlaysByGameId } from '../../api/playApi';
import { getGameStatsByIdAndTeam, generateGameStats } from '../../api/gameStatsApi.jsx';
import { getTeamByName } from '../../api/teamApi';
import { getCurrentSeasonOrLatest } from '../../api/seasonApi';
import { getScheduleBySeasonAndTeam } from '../../api/scheduleApi';
import { useTeamsMap, toEntry } from '../../hooks/useTeamsMap';
import { useVenuesMap } from '../../hooks/useVenuesMap';
import { useColorMode } from '../../context/ColorModeContext';
import { formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';
import GameStatComparison from '../../components/game/detail/GameStatComparison';
import DrivesTable from '../../components/game/detail/DrivesTable';
import { gameTypeName, buildWinProbSeries, buildScoreSeries, quarterBoundaries } from '../../utils/gameDetail';
import { buildDrives } from '../../utils/driveChart';
import ChewConfirmDialog from '../../components/gameManagement/ChewConfirmDialog';
import PageWrap from '../../components/layout/PageWrap';
import PageTabs from '../../components/ui/PageTabs';
import Panel from '../../components/ui/Panel';
import TeamMark from '../../components/ui/TeamMark';
import ConferenceMark from '../../components/ui/ConferenceMark';
import GameScorebug from '../../components/game/detail/GameScorebug';
import { buildScoreboardProps } from '../../components/game/detail/scoreboardProps';
import DriveFieldChart from '../../components/game/detail/DriveFieldChart';
import UserLink from '../../components/ui/UserLink';
import DetailRows from '../../components/ui/DetailRows';
import ComparisonTable from '../../components/ui/ComparisonTable';
import WinProbChart from '../../components/game/detail/WinProbChart';
import ScoreChart from '../../components/game/detail/ScoreChart';
import PlaysPanel from '../../components/game/detail/PlaysPanel';
import { useSeo } from '../../hooks/useSeo';

const unwrap = (result) => {
    const data = result?.data ?? result;
    return Array.isArray(data) ? data[0] : data;
};
const rankLabel = (rank) => (rank && rank <= 25 ? `#${rank}` : 'Unranked');

const markFrom = (teamsMap, name, teamObject) => teamsMap[name] || (teamObject ? toEntry(teamObject) : { name });

const computeTeamSeasonRecord = (scheduleRows, teamName) => {
    let wins = 0;
    let losses = 0;
    (scheduleRows || []).forEach((row) => {
        if (!row.finished || row.home_score == null || row.away_score == null) {
            return;
        }
        const isHome = row.home_team === teamName;
        const teamScore = isHome ? row.home_score : row.away_score;
        const oppScore = isHome ? row.away_score : row.home_score;
        if (teamScore > oppScore) {
            wins += 1;
        } else {
            losses += 1;
        }
    });
    return { wins, losses };
};

const GameDetails = ({ isAdmin }) => {
    const { gameId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const teamsMap = useTeamsMap();
    const venuesMap = useVenuesMap();
    const { mode } = useColorMode();
    const [adminBusy, setAdminBusy] = useState({});
    const [adminMessage, setAdminMessage] = useState(null);

    const [game, setGame] = useState(null);
    const [plays, setPlays] = useState([]);
    const [awayStats, setAwayStats] = useState(null);
    const [homeStats, setHomeStats] = useState(null);
    const [awayTeam, setAwayTeam] = useState(null);
    const [homeTeam, setHomeTeam] = useState(null);
    const [seasonRecord, setSeasonRecord] = useState({ away: null, home: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewedDrive, setViewedDrive] = useState(null);
    const [chewConfirmOpen, setChewConfirmOpen] = useState(false);
    const scopeRef = useRef(null);

    useSeo({
        title: game ? `${game.away_team} at ${game.home_team} | FCFB` : 'Game Details | FCFB',
        description: game
            ? `Box score, win probability, and play-by-play for ${game.away_team} at ${game.home_team}.`
            : 'Game details in Fake College Football.',
    });

    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        setError('');
        setGame(null);
        setAdminBusy({});
        setAdminMessage(null);
        setViewedDrive(null);
        setChewConfirmOpen(false);
        (async () => {
            try {
                setLoading(true);
                const gameData = await getGameById(gameId);
                if (!scope.active) {
                    return;
                }
                setGame(gameData);
                const scheduleChain =
                    gameData.season != null
                        ? Promise.all([
                              getScheduleBySeasonAndTeam(gameData.season, gameData.away_team).catch(() => []),
                              getScheduleBySeasonAndTeam(gameData.season, gameData.home_team).catch(() => []),
                          ])
                        : null;
                const [playsRes, awayStatsRes, homeStatsRes, awayTeamData, homeTeamData, liveSeason] =
                    await Promise.all([
                        getAllPlaysByGameId(gameId).catch(() => []),
                        getGameStatsByIdAndTeam(gameId, gameData.away_team).catch(() => null),
                        getGameStatsByIdAndTeam(gameId, gameData.home_team).catch(() => null),
                        getTeamByName(gameData.away_team).catch(() => null),
                        getTeamByName(gameData.home_team).catch(() => null),
                        getCurrentSeasonOrLatest().catch(() => null),
                    ]);
                if (!scope.active) {
                    return;
                }
                const playList = playsRes?.data ?? playsRes;
                setPlays(Array.isArray(playList) ? playList : []);
                setAwayStats(unwrap(awayStatsRes));
                setHomeStats(unwrap(homeStatsRes));
                setAwayTeam(awayTeamData);
                setHomeTeam(homeTeamData);

                if (gameData.season != null && gameData.season === liveSeason) {
                    setSeasonRecord({
                        away: { wins: awayTeamData?.current_wins || 0, losses: awayTeamData?.current_losses || 0 },
                        home: { wins: homeTeamData?.current_wins || 0, losses: homeTeamData?.current_losses || 0 },
                    });
                } else if (gameData.season != null) {
                    const [awaySchedule, homeSchedule] = await scheduleChain;
                    if (!scope.active) {
                        return;
                    }
                    setSeasonRecord({
                        away: computeTeamSeasonRecord(awaySchedule, gameData.away_team),
                        home: computeTeamSeasonRecord(homeSchedule, gameData.home_team),
                    });
                } else {
                    setSeasonRecord({ away: null, home: null });
                }
            } catch {
                if (scope.active) {
                    setError('Failed to load game details. Please try again.');
                }
            } finally {
                if (scope.active) {
                    setLoading(false);
                }
            }
        })();
        return () => {
            scope.active = false;
        };
    }, [gameId]);

    const awayMark = useMemo(
        () => (game ? markFrom(teamsMap, game.away_team, awayTeam) : null),
        [game, teamsMap, awayTeam]
    );
    const homeMark = useMemo(
        () => (game ? markFrom(teamsMap, game.home_team, homeTeam) : null),
        [game, teamsMap, homeTeam]
    );

    if (loading) {
        return (
            <PageWrap>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            </PageWrap>
        );
    }
    if (error || !game) {
        return (
            <PageWrap>
                <Alert severity="error">{error || 'Game not found.'}</Alert>
            </PageWrap>
        );
    }

    const scoreboard = buildScoreboardProps({
        game,
        awayMark,
        homeMark,
        homeTeam,
        awayStats,
        homeStats,
        venuesMap,
        mode,
    });
    const { awayColor, homeColor, subtitle: headerTitle } = scoreboard;
    const isFinal = game.game_status === 'FINAL';
    const homeWin = game.home_score > game.away_score;
    const orderedPlays = [...plays].sort(
        (a, b) =>
            (a.play_number ?? 0) - (b.play_number ?? 0) ||
            (a.quarter ?? 0) - (b.quarter ?? 0) ||
            (b.clock ?? 0) - (a.clock ?? 0) ||
            (a.play_id ?? 0) - (b.play_id ?? 0)
    );
    const drives = buildDrives(orderedPlays);
    const currentDrive = drives[drives.length - 1] || null;
    const isChewing = game?.game_mode === 'CHEW';

    const ADMIN_SUCCESS_MESSAGES = {
        chew: 'Chew mode set.',
        unchew: 'Chew mode turned off.',
        stats: 'Game stats regenerated.',
        end: 'Game ended.',
    };

    const runAdmin = async (key, action) => {
        const scope = scopeRef.current;
        setAdminBusy((current) => ({ ...current, [key]: true }));
        setAdminMessage(null);
        try {
            await action();
            if (!scope.active) {
                return;
            }
            setAdminMessage({ severity: 'success', text: ADMIN_SUCCESS_MESSAGES[key] });
            if (key === 'end' || key === 'chew' || key === 'unchew') {
                const request = {};
                scope.gameRequest = request;
                const refreshed = await getGameById(gameId).catch(() => null);
                if (scope.active && scope.gameRequest === request && refreshed) {
                    setGame(refreshed);
                }
            }
        } catch (actionError) {
            if (scope.active) {
                setAdminMessage({ severity: 'error', text: actionError.message });
            }
        } finally {
            if (scope.active) {
                setAdminBusy((current) => ({ ...current, [key]: false }));
            }
        }
    };

    const infoRows = [
        {
            label: 'Conference',
            away: <ConferenceMark conference={awayTeam?.conference} size={20} />,
            home: <ConferenceMark conference={homeTeam?.conference} size={20} />,
        },
        {
            label: 'Record',
            away: seasonRecord.away
                ? `${seasonRecord.away.wins}-${seasonRecord.away.losses}`
                : `${game.away_wins || 0}-${game.away_losses || 0}`,
            home: seasonRecord.home
                ? `${seasonRecord.home.wins}-${seasonRecord.home.losses}`
                : `${game.home_wins || 0}-${game.home_losses || 0}`,
        },
        { label: 'Ranking', away: rankLabel(game.away_team_rank), home: rankLabel(game.home_team_rank) },
        {
            label: 'ELO',
            away: awayTeam?.current_elo != null ? Math.round(awayTeam.current_elo) : '-',
            home: homeTeam?.current_elo != null ? Math.round(homeTeam.current_elo) : '-',
        },
        {
            label: 'Offense',
            away: formatOffensivePlaybook(game.away_offensive_playbook),
            home: formatOffensivePlaybook(game.home_offensive_playbook),
        },
        {
            label: 'Defense',
            away: formatDefensivePlaybook(game.away_defensive_playbook),
            home: formatDefensivePlaybook(game.home_defensive_playbook),
        },
        {
            label: 'Coach',
            away: <UserLink username={game.away_coaches?.[0]} />,
            home: <UserLink username={game.home_coaches?.[0]} />,
        },
    ];

    const coinWinner =
        game.coin_toss_winner === 'HOME'
            ? homeMark?.abbreviation
            : game.coin_toss_winner === 'AWAY'
              ? awayMark?.abbreviation
              : null;
    const detailRows = [
        [
            'Coin toss',
            coinWinner
                ? `${coinWinner}${game.coin_toss_choice ? `, ${String(game.coin_toss_choice).replace(/_/g, ' ').toLowerCase()}` : ''}`
                : '-',
        ],
        ['TV', game.tv_channel || '-'],
        ['Vegas spread', scoreboard.spreadText || '-'],
        ['Plays', game.num_plays || '-'],
        ['Game type', gameTypeName(game.game_type)],
        ...(game.game_mode === 'CHEW'
            ? [['Chew mode', game.game_mode_set_by ? `Set by ${game.game_mode_set_by}` : 'On']]
            : []),
        ['Game ID', game.game_id],
    ];

    const wpSeries = buildWinProbSeries(orderedPlays);
    const scoreSeries = buildScoreSeries(orderedPlays);
    if (isFinal && wpSeries.length > 0) {
        const last = wpSeries[wpSeries.length - 1];
        const terminal = homeWin ? 100 : 0;
        if (last.homeWinProb !== terminal) {
            wpSeries.push({
                ...last,
                index: last.index + 1,
                homeWinProb: terminal,
                clock: '0:00',
                awayScore: game.away_score,
                homeScore: game.home_score,
            });
        }
    }
    const wpMarks = quarterBoundaries(wpSeries);
    const teamHeader = (mark, name) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
            <TeamMark team={mark} size={22} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {mark?.name || name}
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                {mark?.abbreviation || name}
            </Box>
        </Box>
    );

    const tabOptions = [
        { value: 'overview', label: 'Overview' },
        ...(!isFinal && currentDrive ? [{ value: 'drive', label: 'Current drive' }] : []),
        ...(wpSeries.length > 1 || scoreSeries.length > 1 ? [{ value: 'charts', label: 'Charts' }] : []),
        ...(awayStats && homeStats ? [{ value: 'stats', label: 'Stats' }] : []),
        ...(drives.length > 0 ? [{ value: 'drives', label: `Drives (${drives.length})` }] : []),
        ...(plays.length > 0 ? [{ value: 'plays', label: `Plays (${plays.length})` }] : []),
    ];
    const shownTab = tabOptions.some((option) => option.value === searchParams.get('tab'))
        ? searchParams.get('tab')
        : 'overview';
    const setTab = (next) => {
        const params = new URLSearchParams(searchParams);
        if (next === 'overview') {
            params.delete('tab');
        } else {
            params.set('tab', next);
        }
        setSearchParams(params, { replace: true });
    };

    return (
        <PageWrap>
            <Box component="h1" sx={visuallyHidden}>
                Game detail, {headerTitle}
            </Box>
            <GameScorebug {...scoreboard} />

            {isAdmin && adminMessage && (
                <Alert severity={adminMessage.severity} sx={{ mt: '12px' }} onClose={() => setAdminMessage(null)}>
                    {adminMessage.text}
                </Alert>
            )}
            {isAdmin && (
                <ChewConfirmDialog
                    open={chewConfirmOpen}
                    chewing={isChewing}
                    awayTeam={game.away_team}
                    homeTeam={game.home_team}
                    processing={adminBusy.chew || adminBusy.unchew}
                    onCancel={() => setChewConfirmOpen(false)}
                    onConfirm={() => {
                        setChewConfirmOpen(false);
                        if (isChewing) {
                            runAdmin('unchew', () => unchewGameByGameId(game.game_id));
                        } else {
                            runAdmin('chew', () => chewGameByGameId(game.game_id));
                        }
                    }}
                />
            )}

            <Box sx={{ mt: '12px' }}>
                <PageTabs
                    value={shownTab}
                    onChange={setTab}
                    options={tabOptions}
                    ariaLabel="Game sections"
                    trailing={
                        <>
                            {isAdmin && (
                                <>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Assessment />}
                                        disabled={adminBusy.stats}
                                        onClick={() => runAdmin('stats', () => generateGameStats(game.game_id))}
                                    >
                                        Generate game stats
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Palette />}
                                        onClick={() => navigate(`/game-details/${game.game_id}/appearance`)}
                                    >
                                        Edit appearance
                                    </Button>
                                    {!isFinal && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="warning"
                                            startIcon={<RestaurantMenu />}
                                            disabled={adminBusy.chew || adminBusy.unchew}
                                            onClick={() => setChewConfirmOpen(true)}
                                        >
                                            {isChewing ? 'Take out of chew mode' : 'Chew game'}
                                        </Button>
                                    )}
                                    {!isFinal && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            startIcon={<Stop />}
                                            disabled={adminBusy.end}
                                            onClick={() => runAdmin('end', () => endGameByGameId(game.game_id))}
                                        >
                                            End game
                                        </Button>
                                    )}
                                </>
                            )}
                        </>
                    }
                />
            </Box>

            {shownTab === 'overview' && (
                <>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gap: '16px',
                            mt: '16px',
                            alignItems: 'stretch',
                        }}
                    >
                        <Panel header="Game information">
                            <ComparisonTable
                                awayHeader={teamHeader(awayMark, game.away_team)}
                                homeHeader={teamHeader(homeMark, game.home_team)}
                                sections={[{ rows: infoRows }]}
                                dense
                            />
                        </Panel>
                        <Panel header="Game details">
                            <DetailRows rows={detailRows} />
                        </Panel>
                    </Box>
                </>
            )}
            {shownTab === 'drive' && currentDrive && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 420px) minmax(0, 1fr)' },
                        gap: '16px',
                        mt: '16px',
                        alignItems: 'start',
                    }}
                >
                    <Panel header="Current drive" more={`${currentDrive.team}, ${currentDrive.playCount} plays`}>
                        <Box sx={{ p: 2 }}>
                            <DriveFieldChart
                                drive={currentDrive}
                                homeMark={homeMark}
                                awayMark={awayMark}
                                homeColor={homeColor}
                                awayColor={awayColor}
                            />
                        </Box>
                    </Panel>
                    <PlaysPanel
                        header="Plays this drive"
                        toolbar={false}
                        plays={currentDrive.plays}
                        homeAbbr={homeMark?.abbreviation}
                        awayAbbr={awayMark?.abbreviation}
                        homeName={game.home_team}
                        awayName={game.away_team}
                    />
                </Box>
            )}
            {shownTab === 'charts' && (
                <>
                    {(wpSeries.length > 1 || scoreSeries.length > 1) && (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                gap: '16px',
                                mt: '16px',
                                alignItems: 'stretch',
                            }}
                        >
                            {wpSeries.length > 1 ? (
                                <Panel header="Win probability" sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <WinProbChart
                                            series={wpSeries}
                                            homeColor={homeColor}
                                            awayColor={awayColor}
                                            homeMark={homeMark}
                                            awayMark={awayMark}
                                            quarterMarks={wpMarks}
                                        />
                                    </Box>
                                </Panel>
                            ) : (
                                <span />
                            )}
                            {scoreSeries.length > 1 ? (
                                <Panel header="Score" sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <ScoreChart
                                            series={scoreSeries}
                                            homeColor={homeColor}
                                            awayColor={awayColor}
                                            homeAbbr={homeMark?.abbreviation}
                                            awayAbbr={awayMark?.abbreviation}
                                        />
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                gap: 2,
                                                mt: 1,
                                                fontSize: '0.72rem',
                                                color: 'var(--text-muted)',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <Box
                                                    sx={{
                                                        width: 11,
                                                        height: 3,
                                                        borderRadius: '2px',
                                                        background: awayColor,
                                                    }}
                                                />
                                                {awayMark?.name || game.away_team}
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <Box
                                                    sx={{
                                                        width: 11,
                                                        height: 3,
                                                        borderRadius: '2px',
                                                        background: homeColor,
                                                    }}
                                                />
                                                {homeMark?.name || game.home_team}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Panel>
                            ) : (
                                <span />
                            )}
                        </Box>
                    )}
                </>
            )}

            {shownTab === 'stats' && (
                <>
                    {awayStats && homeStats && (
                        <>
                            <GameStatComparison
                                awayStats={awayStats}
                                homeStats={homeStats}
                                awayMark={awayMark}
                                homeMark={homeMark}
                            />
                        </>
                    )}
                </>
            )}

            {shownTab === 'drives' && (
                <>
                    {drives.length > 0 && (
                        <DrivesTable
                            drives={drives}
                            homeTeam={game.home_team}
                            homeMark={homeMark}
                            awayMark={awayMark}
                            onViewDrive={setViewedDrive}
                            initialSort={{ key: 'index', dir: 'desc' }}
                        />
                    )}
                </>
            )}

            {shownTab === 'plays' && (
                <>
                    {plays.length > 0 && (
                        <Box sx={{ mt: '16px' }}>
                            <PlaysPanel
                                plays={plays}
                                homeAbbr={homeMark?.abbreviation}
                                awayAbbr={awayMark?.abbreviation}
                                homeName={game.home_team}
                                awayName={game.away_team}
                            />
                        </Box>
                    )}
                </>
            )}

            <Dialog open={Boolean(viewedDrive)} onClose={() => setViewedDrive(null)} maxWidth="md" fullWidth>
                <DialogTitle
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontFamily: 'var(--cond)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.01em',
                    }}
                >
                    {viewedDrive ? `${viewedDrive.team} drive, Q${viewedDrive.quarter}` : 'Drive'}
                    <IconButton size="small" onClick={() => setViewedDrive(null)} aria-label="Close">
                        <Close fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {viewedDrive && (
                        <DriveFieldChart
                            drive={viewedDrive}
                            homeMark={homeMark}
                            awayMark={awayMark}
                            homeColor={homeColor}
                            awayColor={awayColor}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </PageWrap>
    );
};

GameDetails.propTypes = {
    isAdmin: PropTypes.bool,
};

export default GameDetails;
