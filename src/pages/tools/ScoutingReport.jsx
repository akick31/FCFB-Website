import React, { useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import Panel from '../../components/ui/Panel';
import SectionTitle from '../../components/ui/SectionTitle';
import SearchableSelect from '../../components/ui/SearchableSelect';
import {
    PLAY_COLUMNS,
    applyScenarioFilters,
    favoriteNumbers,
    numberBucketCounts,
    DEFAULT_NUMBER_BUCKET_SIZE,
    playsToCsv,
    downloadCsv,
} from '../../utils/scoutingReport';
import { useSeo } from '../../hooks/useSeo';
import ScoutingScenarioFilters from '../../components/scouting/ScoutingScenarioFilters';
import ScoutingNumberSummary from '../../components/scouting/ScoutingNumberSummary';
import ScoutingColumnsPanel from '../../components/scouting/ScoutingColumnsPanel';
import ScoutingPlaysTable from '../../components/scouting/ScoutingPlaysTable';
import useScoutingFilters from '../../hooks/useScoutingFilters';
import useScoutingColumns from '../../hooks/useScoutingColumns';
import useScoutingReportData from '../../hooks/useScoutingReportData';
import useScoutingReportUrl from '../../hooks/useScoutingReportUrl';
import { inputSx, btnSx, stepBtnSx, labelSx, CONTROL_HEIGHT } from '../../components/scouting/scoutingStyles';
const ScoutingReport = () => {
    useSeo({
        title: 'Scouting Report | Fake College Football',
        description: 'Pull every play for a coach and filter by scenario.',
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const [error, setError] = useState('');
    const [columnsOpen, setColumnsOpen] = useState(true);
    const [numbersOpen, setNumbersOpen] = useState(true);
    const [bucketSize, setBucketSize] = useState(DEFAULT_NUMBER_BUCKET_SIZE);
    const filters = useScoutingFilters();
    const { sides, downs, fieldPositions, playTypes, tempo, customFilters, filterSummary } = filters;
    const columns = useScoutingColumns({ setError });
    const { loggedInUserId, loginToken, hiddenColumns, setHiddenColumns } = columns;
    const report = useScoutingReportData({
        searchParams,
        setError,
        onResetFilters: filters.resetFilters,
        loggedInUserId,
        loginToken,
        setHiddenColumns,
    });
    const {
        targetOptions,
        targetLabel,
        setTargetLabel,
        gameCount,
        setGameCount,
        rangeMode,
        setRangeMode,
        loadingLookups,
        loading,
        hasGenerated,
        plays,
        reportTarget,
        resolvedTarget,
        generate,
    } = report;
    useScoutingReportUrl({ searchParams, setSearchParams, report, filters, hiddenColumns });
    const visibleColumns = useMemo(
        () => PLAY_COLUMNS.filter((column) => !hiddenColumns.includes(column)),
        [hiddenColumns]
    );

    const filteredPlays = useMemo(
        () =>
            applyScenarioFilters(plays, {
                mode: 'coach',
                target: reportTarget,
                sides,
                downs,
                fieldPositions,
                playTypes,
                tempo,
                customFilters,
            }),
        [plays, reportTarget, sides, downs, fieldPositions, playTypes, tempo, customFilters]
    );

    const favoriteNumbersList = useMemo(
        () => favoriteNumbers(filteredPlays, reportTarget, 10),
        [filteredPlays, reportTarget]
    );
    const numberBuckets = useMemo(
        () => numberBucketCounts(filteredPlays, reportTarget, bucketSize),
        [filteredPlays, reportTarget, bucketSize]
    );
    const numbersFiltered = filterSummary.length > 0;
    const exportCsv = () =>
        downloadCsv(`scouting-report-${reportTarget || 'report'}.csv`, playsToCsv(filteredPlays, visibleColumns));

    return (
        <PageWrap>
            <PageHeading eyebrow="Tools" title="Scouting Report" />

            <Panel sx={{ mb: '16px' }}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <Box sx={{ flex: '1 1 260px', minWidth: 220 }}>
                            <Box sx={{ ...labelSx, mb: '6px' }}>Coach or team</Box>
                            {loadingLookups ? (
                                <Box sx={{ ...inputSx, color: 'var(--text-dim)' }}>Loading…</Box>
                            ) : (
                                <SearchableSelect
                                    id="scouting-target"
                                    value={targetLabel}
                                    onChange={setTargetLabel}
                                    options={targetOptions}
                                    placeholder="Search by coach username or team…"
                                />
                            )}
                        </Box>
                        <Box sx={{ flex: '0 0 auto' }}>
                            <Box sx={{ ...labelSx, mb: '6px' }}>Games</Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={() => setGameCount((n) => Math.max(1, n - 1))}
                                    disabled={rangeMode === 'season' || gameCount <= 1}
                                    sx={stepBtnSx}
                                >
                                    −
                                </Box>
                                <Box
                                    component="input"
                                    type="number"
                                    min={1}
                                    value={gameCount}
                                    disabled={rangeMode === 'season'}
                                    onChange={(event) =>
                                        setGameCount(Math.max(1, Math.floor(Number(event.target.value)) || 1))
                                    }
                                    sx={{ ...inputSx, width: '64px', textAlign: 'center' }}
                                />
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={() => setGameCount((n) => n + 1)}
                                    disabled={rangeMode === 'season'}
                                    sx={stepBtnSx}
                                >
                                    +
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ flex: '0 0 auto' }}>
                            <Box sx={{ ...labelSx, mb: '6px' }}>&nbsp;</Box>
                            <Box
                                component="label"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    height: CONTROL_HEIGHT,
                                    cursor: 'pointer',
                                }}
                            >
                                <Box
                                    component="input"
                                    type="checkbox"
                                    checked={rangeMode === 'season'}
                                    onChange={(event) => setRangeMode(event.target.checked ? 'season' : 'count')}
                                />
                                <Box component="span" sx={{ fontSize: '0.8rem', color: 'var(--text)' }}>
                                    Current season only
                                </Box>
                            </Box>
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={() => generate()}
                            disabled={loading || !resolvedTarget}
                            sx={btnSx}
                        >
                            {loading ? 'Generating…' : 'Generate report'}
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

            {!loading && hasGenerated && (
                <>
                    <ScoutingScenarioFilters filters={filters} />

                    <SectionTitle
                        title="Numbers"
                        collapsible
                        collapsed={!numbersOpen}
                        onToggle={() => setNumbersOpen((prev) => !prev)}
                        note={
                            numbersFiltered
                                ? `Matches the filters above (${filterSummary})`
                                : 'Overall (no filters chosen)'
                        }
                    />
                    {numbersOpen && (
                        <ScoutingNumberSummary
                            favoriteNumbersList={favoriteNumbersList}
                            bucketSize={bucketSize}
                            setBucketSize={setBucketSize}
                            numberBuckets={numberBuckets}
                        />
                    )}

                    <SectionTitle
                        title="Columns"
                        collapsible
                        collapsed={!columnsOpen}
                        onToggle={() => setColumnsOpen((prev) => !prev)}
                        note={`${visibleColumns.length} of ${PLAY_COLUMNS.length} shown`}
                    />
                    {columnsOpen && <ScoutingColumnsPanel columns={columns} />}

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: '10px',
                            flexWrap: 'wrap',
                            gap: '10px',
                        }}
                    >
                        <Box sx={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Showing {filteredPlays.length} of {plays.length} plays
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={exportCsv}
                            disabled={filteredPlays.length === 0}
                            sx={btnSx}
                        >
                            Export CSV
                        </Box>
                    </Box>

                    {filteredPlays.length === 0 ? (
                        <Panel>
                            <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                                No plays match these filters.
                            </Box>
                        </Panel>
                    ) : (
                        <ScoutingPlaysTable visibleColumns={visibleColumns} filteredPlays={filteredPlays} />
                    )}
                </>
            )}
        </PageWrap>
    );
};

export default ScoutingReport;
