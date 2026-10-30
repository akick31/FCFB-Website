import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { Link, useSearchParams } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import Panel from '../../components/ui/Panel';
import PageTabs from '../../components/ui/PageTabs';
import DrivesTable from '../../components/game/detail/DrivesTable';
import SearchableSelect from '../../components/ui/SearchableSelect';
import WinProbChart from '../../components/game/detail/WinProbChart';
import ScoreChart from '../../components/game/detail/ScoreChart';
import DriveFieldChart from '../../components/game/detail/DriveFieldChart';
import { useTeamsMap, toEntry } from '../../hooks/useTeamsMap';
import { useColorMode } from '../../context/ColorModeContext';
import { pickTeamColor } from '../../utils/teamColor';
import { getFilteredGames, getGameById } from '../../api/gameApi';
import { getAllPlaysByGameId } from '../../api/playApi';
import { buildWinProbSeries, buildScoreSeries, quarterBoundaries, formatClock } from '../../utils/gameDetail';
import { orderPlaysChronologically, buildDrives } from '../../utils/driveChart';
import { describePlay, formatDownDistanceSpot } from '../../utils/formatPlay';
import { useSeo } from '../../hooks/useSeo';
import { inputSx, labelSx } from '../../styles/controls';

const RECENT_GAMES_LIMIT = 200;
const SPEED_OPTIONS = [
    { value: 2000, label: '0.5x' },
    { value: 1000, label: '1x' },
    { value: 500, label: '2x' },
];

const gameLabel = (game) => `S${game.season} Wk${game.week}: ${game.away_team} @ ${game.home_team} (#${game.game_id})`;

const CONTROL_HEIGHT = '34px';
const ctrlBtnSx = {
    height: CONTROL_HEIGHT,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    px: '12px',
    font: 'inherit',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:disabled': { opacity: 0.5, cursor: 'not-allowed' },
};

const DriveChart = () => {
    useSeo({
        title: 'Drive Chart & Replay | Fake College Football',
        description: 'Step through a game play-by-play with drive and win-probability context.',
    });

    const teamsMap = useTeamsMap();
    const { mode } = useColorMode();
    const [searchParams, setSearchParams] = useSearchParams();
    const autoRanRef = useRef(false);
    const mountScopeRef = useRef(null);

    const [games, setGames] = useState([]);
    const [loadingLookups, setLoadingLookups] = useState(true);
    const [gameLabelInput, setGameLabelInput] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderedPlays, setOrderedPlays] = useState([]);
    const [allOrderedPlays, setAllOrderedPlays] = useState([]);
    const [game, setGame] = useState(null);

    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const [viewedDrive, setViewedDrive] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        const scope = {};
        mountScopeRef.current = scope;
        return () => {
            mountScopeRef.current = null;
        };
    }, []);

    useEffect(() => {
        let active = true;
        getFilteredGames({ category: 'PAST', sort: 'NEWEST', page: 0, size: RECENT_GAMES_LIMIT })
            .then((page) => {
                if (active) {
                    setGames(page?.content || []);
                }
            })
            .catch(() => {
                if (active) {
                    setGames([]);
                }
            })
            .finally(() => {
                if (active) {
                    setLoadingLookups(false);
                }
            });
        return () => {
            active = false;
        };
    }, []);

    const gameOptions = useMemo(
        () =>
            games.map((entry) => ({
                value: entry.game_id,
                label: gameLabel(entry),
                teams: [entry.away_team, entry.home_team],
            })),
        [games]
    );
    const resolvedGameId = useMemo(
        () => gameOptions.find((option) => option.label === gameLabelInput)?.value ?? null,
        [gameOptions, gameLabelInput]
    );

    useEffect(() => {
        setPlaying(false);
        setIndex(0);
    }, [orderedPlays]);

    useEffect(() => {
        if (!playing) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            return undefined;
        }
        timerRef.current = setInterval(() => {
            setIndex((prev) => {
                if (prev >= orderedPlays.length - 1) {
                    setPlaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, speed);
        return () => clearInterval(timerRef.current);
    }, [playing, speed, orderedPlays.length]);

    const load = async (overrideGameId = resolvedGameId) => {
        const scope = mountScopeRef.current;
        if (!scope) {
            return;
        }
        if (!overrideGameId) {
            setError('Pick a game first.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const [plays, resolvedGame] = await Promise.all([
                getAllPlaysByGameId(overrideGameId),
                games.find((entry) => entry.game_id === overrideGameId) ||
                    getGameById(overrideGameId).catch(() => null),
            ]);
            if (mountScopeRef.current !== scope) {
                return;
            }
            const fullyOrdered = orderPlaysChronologically(plays);
            const ordered = fullyOrdered.filter(
                (play) => play.actual_result !== 'END_OF_GAME' && play.actual_result !== 'END_OF_HALF'
            );
            setOrderedPlays(ordered);
            setAllOrderedPlays(fullyOrdered);
            setGame(resolvedGame);
            if (resolvedGame && !games.some((entry) => entry.game_id === overrideGameId)) {
                setGames((prev) => [resolvedGame, ...prev]);
                setGameLabelInput(gameLabel(resolvedGame));
            }
            setSearchParams({ game: String(overrideGameId) }, { replace: true });
        } catch (err) {
            if (mountScopeRef.current === scope) {
                setError(err.message);
            }
        } finally {
            if (mountScopeRef.current === scope) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (loadingLookups || autoRanRef.current) {
            return;
        }
        autoRanRef.current = true;
        const urlGameId = searchParams.get('game');
        if (!urlGameId) {
            return;
        }
        const gameId = Number(urlGameId);
        const option = gameOptions.find((entry) => entry.value === gameId);
        if (option) {
            setGameLabelInput(option.label);
        }
        load(gameId);
    }, [loadingLookups]);

    const homeMark = game ? teamsMap[game.home_team] || toEntry({ name: game.home_team }) : null;
    const awayMark = game ? teamsMap[game.away_team] || toEntry({ name: game.away_team }) : null;
    const homeColor = pickTeamColor(homeMark, mode);
    const awayColor = pickTeamColor(awayMark, mode);

    const wpSeries = useMemo(() => buildWinProbSeries(orderedPlays), [orderedPlays]);
    const scoreSeries = useMemo(() => buildScoreSeries(orderedPlays), [orderedPlays]);
    const wpMarks = useMemo(() => quarterBoundaries(wpSeries), [wpSeries]);
    const drives = useMemo(() => buildDrives(allOrderedPlays), [allOrderedPlays]);
    const [tab, setTab] = useState('charts');

    const currentPlay = orderedPlays[index] || null;
    const atEnd = index >= orderedPlays.length - 1;

    return (
        <PageWrap>
            <PageHeading eyebrow="Tools" title="Drive Chart & Replay" />

            <Panel sx={{ mb: '16px' }}>
                <Box sx={{ p: 2, display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <Box sx={{ flex: '1 1 320px', minWidth: 260 }}>
                        <Box sx={{ ...labelSx, mb: '6px' }}>Game</Box>
                        {loadingLookups ? (
                            <Box sx={{ ...inputSx, color: 'var(--text-dim)' }}>Loading…</Box>
                        ) : (
                            <SearchableSelect
                                id="drive-chart-game"
                                value={gameLabelInput}
                                onChange={setGameLabelInput}
                                options={gameOptions}
                                placeholder="Search games…"
                            />
                        )}
                    </Box>
                    <Box
                        component="button"
                        type="button"
                        onClick={() => load()}
                        disabled={loading || !resolvedGameId}
                        sx={{ ...ctrlBtnSx, background: 'var(--brand-deep)', color: '#fff', border: 0 }}
                    >
                        {loading ? 'Loading…' : 'Load game'}
                    </Box>
                </Box>
                {error && (
                    <Box sx={{ px: 2, pb: 2 }}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}
            </Panel>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && game && orderedPlays.length > 1 && (
                <>
                    <PageTabs
                        value={tab}
                        onChange={setTab}
                        ariaLabel="Drive chart sections"
                        options={[
                            { value: 'charts', label: 'Charts & replay' },
                            { value: 'drives', label: `Drives (${drives.length})` },
                        ]}
                        trailing={
                            <Box
                                component={Link}
                                to={`/game-details/${game.game_id}`}
                                sx={{
                                    color: 'var(--brand)',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    textDecoration: 'none',
                                }}
                            >
                                Full game details ›
                            </Box>
                        }
                    />
                    {tab === 'charts' && (
                        <>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3, minmax(0, 1fr))' },
                                    gap: '16px',
                                    alignItems: 'stretch',
                                }}
                            >
                                <Panel header="Win probability">
                                    <Box sx={{ p: 2 }}>
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
                                <Panel header="Score">
                                    <Box sx={{ p: 2 }}>
                                        <ScoreChart
                                            series={scoreSeries}
                                            homeColor={homeColor}
                                            awayColor={awayColor}
                                            homeAbbr={homeMark?.abbreviation}
                                            awayAbbr={awayMark?.abbreviation}
                                        />
                                    </Box>
                                </Panel>

                                <Panel header="Replay">
                                    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                flexWrap: 'wrap',
                                            }}
                                        >
                                            <Box
                                                component="button"
                                                type="button"
                                                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                                                disabled={index === 0}
                                                sx={ctrlBtnSx}
                                            >
                                                ◀ Step
                                            </Box>
                                            <Box
                                                component="button"
                                                type="button"
                                                onClick={() => setPlaying((p) => !p)}
                                                disabled={atEnd && !playing}
                                                sx={ctrlBtnSx}
                                            >
                                                {playing ? 'Pause' : 'Play'}
                                            </Box>
                                            <Box
                                                component="button"
                                                type="button"
                                                onClick={() =>
                                                    setIndex((i) => Math.min(orderedPlays.length - 1, i + 1))
                                                }
                                                disabled={atEnd}
                                                sx={ctrlBtnSx}
                                            >
                                                Step ▶
                                            </Box>
                                            <Box
                                                component="select"
                                                value={speed}
                                                onChange={(event) => setSpeed(Number(event.target.value))}
                                                sx={inputSx}
                                            >
                                                {SPEED_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </Box>
                                            <Box sx={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                                                Play {index + 1} of {orderedPlays.length}
                                            </Box>
                                        </Box>
                                        <Box
                                            component="input"
                                            type="range"
                                            min={0}
                                            max={orderedPlays.length - 1}
                                            value={index}
                                            onChange={(event) => {
                                                setPlaying(false);
                                                setIndex(Number(event.target.value));
                                            }}
                                            sx={{ width: '100%' }}
                                        />
                                        {currentPlay && (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    gap: '16px',
                                                    flexWrap: 'wrap',
                                                    alignItems: 'center',
                                                    p: 1.5,
                                                    background: 'var(--surface-2)',
                                                    borderRadius: 'var(--r-sm)',
                                                    fontSize: '0.86rem',
                                                }}
                                            >
                                                <Box sx={{ fontWeight: 800 }}>
                                                    Q{currentPlay.quarter} {formatClock(currentPlay.clock)}
                                                </Box>
                                                <Box>
                                                    {awayMark?.abbreviation} {currentPlay.away_score} -{' '}
                                                    {currentPlay.home_score} {homeMark?.abbreviation}
                                                </Box>
                                                <Box sx={{ color: 'var(--text-muted)' }}>
                                                    {formatDownDistanceSpot(
                                                        currentPlay,
                                                        homeMark?.abbreviation,
                                                        awayMark?.abbreviation
                                                    )}
                                                </Box>
                                                <Box sx={{ flex: 1, minWidth: 200 }}>
                                                    {describePlay(currentPlay, {
                                                        homeName: game.home_team,
                                                        awayName: game.away_team,
                                                    })}
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                </Panel>
                            </Box>
                        </>
                    )}
                    {tab === 'drives' && (
                        <DrivesTable
                            drives={drives}
                            homeTeam={game.home_team}
                            homeMark={homeMark}
                            awayMark={awayMark}
                            onViewDrive={setViewedDrive}
                        />
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
                    {viewedDrive && game && (
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

export default DriveChart;
