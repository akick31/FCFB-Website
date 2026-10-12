import React, { useMemo } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import Panel from '../../components/ui/Panel';
import SectionTitle from '../../components/ui/SectionTitle';
import SearchableSelect from '../../components/ui/SearchableSelect';
import SelectPill from '../../components/ui/SelectPill';
import TeamMark from '../../components/ui/TeamMark';
import { useTeamsMap, toEntry } from '../../hooks/useTeamsMap';
import { useColorMode } from '../../context/ColorModeContext';
import { pickTeamColor } from '../../utils/teamColor';
import {
    matchupCurrentStreak,
    matchupLongestStreak,
    matchupLargestMargin,
    formatWinPercentage,
} from '../../utils/headToHead';
import { useSeo } from '../../hooks/useSeo';
import useHeadToHeadComparison from '../../hooks/useHeadToHeadComparison';
import { inputSx, btnSx, labelSx } from '../../components/headToHead/headToHeadStyles';
import EntityRankGrid from '../../components/headToHead/EntityRankGrid';
import WinPctTrendChart from '../../components/headToHead/WinPctTrendChart';
import MarginBarChart from '../../components/headToHead/MarginBarChart';
const seasonRange = (start, end) => (start === end ? `Season ${start}` : `Season ${start}-Season ${end}`);
const MODE_OPTIONS = [
    { value: 'team', label: 'Team' },
    { value: 'coach', label: 'Coach' },
];

const HeadToHead = () => {
    useSeo({
        title: 'Winsipedia | Fake College Football',
        description: "Compare two teams or coaches' all-time standing and their history against each other.",
    });

    const teamsMap = useTeamsMap();
    const { mode } = useColorMode();
    const {
        teamRankings,
        coachRankings,
        loadingLookups,
        modeA,
        setModeA,
        modeB,
        setModeB,
        labelA,
        setLabelA,
        labelB,
        setLabelB,
        loading,
        error,
        resultA,
        resultB,
        matchups,
        optionsFor,
        resolvedA,
        resolvedB,
        userByDiscordId,
        compare,
    } = useHeadToHeadComparison();
    const markFor = (name) => teamsMap[name] || toEntry({ name });
    const colorFor = (name) => pickTeamColor(markFor(name), mode);

    const entityColor = (entityMode, id) =>
        entityMode === 'coach' ? colorFor(userByDiscordId.get(id)?.team) : colorFor(id);
    const entityDisplayName = (entityMode, id) =>
        entityMode === 'coach' ? userByDiscordId.get(id)?.username || id : id;

    const seriesTotals = useMemo(() => {
        if (!matchups || !resultA || !resultB) {
            return null;
        }
        let winsA = 0;
        let winsB = 0;
        let ties = 0;
        matchups.forEach((matchup) => {
            if (matchup.winner === 'A') {
                winsA += 1;
            } else if (matchup.winner === 'B') {
                winsB += 1;
            } else {
                ties += 1;
            }
        });
        return { winsA, winsB, ties, total: matchups.length };
    }, [matchups, resultA, resultB]);

    const streak = useMemo(() => (matchups ? matchupCurrentStreak(matchups) : null), [matchups]);
    const longestA = useMemo(() => (matchups ? matchupLongestStreak(matchups, 'A') : null), [matchups]);
    const longestB = useMemo(() => (matchups ? matchupLongestStreak(matchups, 'B') : null), [matchups]);
    const marginA = useMemo(() => (matchups ? matchupLargestMargin(matchups, 'A') : null), [matchups]);
    const marginB = useMemo(() => (matchups ? matchupLargestMargin(matchups, 'B') : null), [matchups]);

    const entityHeader = (result) => {
        const name = entityDisplayName(result.mode, result.id);
        if (result.mode === 'coach') {
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                    <Box component="span">@{name}</Box>
                </Box>
            );
        }
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                <TeamMark team={markFor(name)} size={26} />
                <Box component="span">{name}</Box>
            </Box>
        );
    };

    const streakLabel = (side) =>
        side === 'A' ? entityDisplayName(resultA.mode, resultA.id) : entityDisplayName(resultB.mode, resultB.id);
    const streakColor = (side) =>
        side === 'A' ? entityColor(resultA.mode, resultA.id) : entityColor(resultB.mode, resultB.id);

    return (
        <PageWrap>
            <PageHeading eyebrow="Tools" title="Winsipedia" />
            <Box sx={{ fontSize: '0.82rem', color: 'var(--text-muted)', mt: '-10px', mb: '4px' }}>
                Winsipedia-style standings and head-to-head history for teams and coaches.
            </Box>
            <Box sx={{ fontSize: '0.68rem', color: 'var(--text-dim)', mb: '16px' }}>
                Covers the Discord bot era only. Data from the Reddit bot era is not included.
            </Box>

            <Panel sx={{ mb: '16px' }}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <Box
                            sx={{
                                flex: '1 1 260px',
                                minWidth: 220,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={labelSx}>Side A</Box>
                                <SelectPill
                                    value={modeA}
                                    onChange={(next) => {
                                        setModeA(next);
                                        setLabelA('');
                                    }}
                                    options={MODE_OPTIONS}
                                    ariaLabel="Side A type"
                                />
                            </Box>
                            {loadingLookups ? (
                                <Box sx={{ ...inputSx, color: 'var(--text-dim)' }}>Loading…</Box>
                            ) : (
                                <SearchableSelect
                                    id="h2h-a"
                                    value={labelA}
                                    onChange={setLabelA}
                                    options={optionsFor(modeA)}
                                    placeholder={modeA === 'coach' ? 'Search coaches…' : 'Search teams…'}
                                />
                            )}
                        </Box>
                        <Box
                            sx={{
                                flex: '1 1 260px',
                                minWidth: 220,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={labelSx}>Side B</Box>
                                <SelectPill
                                    value={modeB}
                                    onChange={(next) => {
                                        setModeB(next);
                                        setLabelB('');
                                    }}
                                    options={MODE_OPTIONS}
                                    ariaLabel="Side B type"
                                />
                            </Box>
                            {loadingLookups ? (
                                <Box sx={{ ...inputSx, color: 'var(--text-dim)' }}>Loading…</Box>
                            ) : (
                                <SearchableSelect
                                    id="h2h-b"
                                    value={labelB}
                                    onChange={setLabelB}
                                    options={optionsFor(modeB)}
                                    placeholder={modeB === 'coach' ? 'Search coaches…' : 'Search teams…'}
                                />
                            )}
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={() => compare()}
                            disabled={loading || !resolvedA || !resolvedB}
                            sx={btnSx}
                        >
                            {loading ? 'Comparing…' : 'Compare'}
                        </Box>
                    </Box>
                    {error && <Alert severity="error">{error}</Alert>}
                </Box>
            </Panel>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && resultA && resultB && (
                <>
                    <SectionTitle title="Standings" />
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gap: '16px',
                            mb: '16px',
                        }}
                    >
                        <Box>
                            <Box sx={{ mb: '10px' }}>{entityHeader(resultA)}</Box>
                            <EntityRankGrid
                                entityName={entityDisplayName(resultA.mode, resultA.id)}
                                rankings={(resultA.mode === 'coach' ? coachRankings : teamRankings).get(resultA.id)}
                                accent={entityColor(resultA.mode, resultA.id)}
                                rankLabel={resultA.mode === 'coach' ? 'Coach ranks' : 'Team ranks'}
                            />
                        </Box>
                        <Box>
                            <Box sx={{ mb: '10px' }}>{entityHeader(resultB)}</Box>
                            <EntityRankGrid
                                entityName={entityDisplayName(resultB.mode, resultB.id)}
                                rankings={(resultB.mode === 'coach' ? coachRankings : teamRankings).get(resultB.id)}
                                accent={entityColor(resultB.mode, resultB.id)}
                                rankLabel={resultB.mode === 'coach' ? 'Coach ranks' : 'Team ranks'}
                            />
                        </Box>
                    </Box>

                    <SectionTitle title="Record (win %)" />
                    <Panel sx={{ mb: '16px' }}>
                        <Box sx={{ p: 2 }}>
                            <WinPctTrendChart
                                seriesA={resultA.seasonRows}
                                seriesB={resultB.seasonRows}
                                nameA={entityDisplayName(resultA.mode, resultA.id)}
                                nameB={entityDisplayName(resultB.mode, resultB.id)}
                                colorA={entityColor(resultA.mode, resultA.id)}
                                colorB={entityColor(resultB.mode, resultB.id)}
                            />
                        </Box>
                    </Panel>

                    <SectionTitle title="Head-to-head" />
                    <Panel sx={{ mb: '16px' }}>
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {seriesTotals && seriesTotals.total > 0 ? (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                minWidth: 70,
                                            }}
                                        >
                                            {resultA.mode === 'team' && (
                                                <TeamMark team={markFor(resultA.id)} size={32} />
                                            )}
                                            <Box sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{seriesTotals.winsA}</Box>
                                            <Box sx={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>
                                                Wins ({formatWinPercentage(seriesTotals.winsA / seriesTotals.total)})
                                            </Box>
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    height: 26,
                                                    borderRadius: 'var(--r-sm)',
                                                    overflow: 'hidden',
                                                    border: '1px solid var(--line)',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: `${(seriesTotals.winsA / seriesTotals.total) * 100}%`,
                                                        background: entityColor(resultA.mode, resultA.id),
                                                    }}
                                                />
                                                {seriesTotals.ties > 0 && (
                                                    <Box
                                                        sx={{
                                                            width: `${(seriesTotals.ties / seriesTotals.total) * 100}%`,
                                                            background: 'var(--text-dim)',
                                                        }}
                                                    />
                                                )}
                                                <Box
                                                    sx={{
                                                        width: `${(seriesTotals.winsB / seriesTotals.total) * 100}%`,
                                                        background: entityColor(resultB.mode, resultB.id),
                                                    }}
                                                />
                                            </Box>
                                            {seriesTotals.ties > 0 && (
                                                <Box
                                                    sx={{
                                                        textAlign: 'center',
                                                        fontSize: '0.66rem',
                                                        color: 'var(--text-dim)',
                                                        mt: '4px',
                                                    }}
                                                >
                                                    {seriesTotals.ties} tie{seriesTotals.ties !== 1 ? 's' : ''}
                                                </Box>
                                            )}
                                        </Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                minWidth: 70,
                                            }}
                                        >
                                            {resultB.mode === 'team' && (
                                                <TeamMark team={markFor(resultB.id)} size={32} />
                                            )}
                                            <Box sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{seriesTotals.winsB}</Box>
                                            <Box sx={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>
                                                Wins ({formatWinPercentage(seriesTotals.winsB / seriesTotals.total)})
                                            </Box>
                                        </Box>
                                    </Box>

                                    {streak && (
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Box sx={{ ...labelSx, mb: '4px' }}>Current win streak</Box>
                                            <Box
                                                sx={{
                                                    fontFamily: 'var(--cond)',
                                                    fontWeight: 800,
                                                    fontSize: '1.4rem',
                                                    color: streakColor(streak.winner),
                                                }}
                                            >
                                                {streak.length} · {streakLabel(streak.winner)} (
                                                {seasonRange(streak.startSeason, streak.endSeason)})
                                            </Box>
                                        </Box>
                                    )}

                                    <Box>
                                        <Box sx={{ ...labelSx, mb: '8px', textAlign: 'center' }}>
                                            Head-to-head results
                                        </Box>
                                        <MarginBarChart
                                            matchups={matchups}
                                            colorA={entityColor(resultA.mode, resultA.id)}
                                            colorB={entityColor(resultB.mode, resultB.id)}
                                        />
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'center',
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
                                                        height: 11,
                                                        borderRadius: '2px',
                                                        background: entityColor(resultA.mode, resultA.id),
                                                    }}
                                                />
                                                {entityDisplayName(resultA.mode, resultA.id)}
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <Box
                                                    sx={{
                                                        width: 11,
                                                        height: 11,
                                                        borderRadius: '2px',
                                                        background: entityColor(resultB.mode, resultB.id),
                                                    }}
                                                />
                                                {entityDisplayName(resultB.mode, resultB.id)}
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                                            gap: '12px',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Box>
                                            <Box sx={{ ...labelSx, mb: '4px' }}>
                                                Largest margin ({streakLabel('A')})
                                            </Box>
                                            {marginA ? (
                                                <Box
                                                    component={Link}
                                                    to={`/game-details/${marginA.gameId}`}
                                                    sx={{
                                                        color: entityColor(resultA.mode, resultA.id),
                                                        textDecoration: 'none',
                                                        fontFamily: 'var(--cond)',
                                                        fontWeight: 800,
                                                        fontSize: '1.6rem',
                                                        display: 'block',
                                                    }}
                                                >
                                                    {marginA.margin}
                                                    <Box
                                                        sx={{
                                                            fontSize: '0.66rem',
                                                            color: 'var(--text-dim)',
                                                            fontFamily: 'inherit',
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Season {marginA.season}, Wk {marginA.week}
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Box sx={{ color: 'var(--text-dim)' }}>-</Box>
                                            )}
                                        </Box>
                                        <Box>
                                            <Box sx={{ ...labelSx, mb: '4px' }}>
                                                Longest streak ({streakLabel('A')})
                                            </Box>
                                            <Box
                                                sx={{
                                                    fontFamily: 'var(--cond)',
                                                    fontWeight: 800,
                                                    fontSize: '1.6rem',
                                                    color: entityColor(resultA.mode, resultA.id),
                                                }}
                                            >
                                                {longestA?.length || 0}
                                            </Box>
                                            {longestA?.length > 0 && (
                                                <Box sx={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>
                                                    {seasonRange(longestA.startSeason, longestA.endSeason)}
                                                </Box>
                                            )}
                                        </Box>
                                        <Box>
                                            <Box sx={{ ...labelSx, mb: '4px' }}>
                                                Largest margin ({streakLabel('B')})
                                            </Box>
                                            {marginB ? (
                                                <Box
                                                    component={Link}
                                                    to={`/game-details/${marginB.gameId}`}
                                                    sx={{
                                                        color: entityColor(resultB.mode, resultB.id),
                                                        textDecoration: 'none',
                                                        fontFamily: 'var(--cond)',
                                                        fontWeight: 800,
                                                        fontSize: '1.6rem',
                                                        display: 'block',
                                                    }}
                                                >
                                                    {marginB.margin}
                                                    <Box
                                                        sx={{
                                                            fontSize: '0.66rem',
                                                            color: 'var(--text-dim)',
                                                            fontFamily: 'inherit',
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Season {marginB.season}, Wk {marginB.week}
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Box sx={{ color: 'var(--text-dim)' }}>-</Box>
                                            )}
                                        </Box>
                                        <Box>
                                            <Box sx={{ ...labelSx, mb: '4px' }}>
                                                Longest streak ({streakLabel('B')})
                                            </Box>
                                            <Box
                                                sx={{
                                                    fontFamily: 'var(--cond)',
                                                    fontWeight: 800,
                                                    fontSize: '1.6rem',
                                                    color: entityColor(resultB.mode, resultB.id),
                                                }}
                                            >
                                                {longestB?.length || 0}
                                            </Box>
                                            {longestB?.length > 0 && (
                                                <Box sx={{ fontSize: '0.66rem', color: 'var(--text-dim)' }}>
                                                    {seasonRange(longestB.startSeason, longestB.endSeason)}
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ p: 2, textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No meetings on record between these two.
                                </Box>
                            )}
                        </Box>
                    </Panel>
                </>
            )}
        </PageWrap>
    );
};

export default HeadToHead;
