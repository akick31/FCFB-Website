import React, { useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import Panel from '../../components/ui/Panel';
import PageTabs from '../../components/ui/PageTabs';
import PagedFooter from '../../components/ui/PagedFooter';
import EditDialog from '../../components/ui/EditDialog';
import NumberInput from '../../components/ui/NumberInput';
import usePagedRows from '../../hooks/usePagedRows';
import SearchableSelect from '../../components/ui/SearchableSelect';
import {
    PLAY_COLUMNS,
    applyScenarioFilters,
    annotateScoutingFields,
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
import { CONTROL_HEIGHT } from '../../styles/controls';
import { compact, inputSx, labelSx, primaryButtonSx, secondaryButtonSx } from '../../styles/controls';
const PLAYS_PER_PAGE = 25;

const ScoutingReport = () => {
    useSeo({
        title: 'Scouting Report | Fake College Football',
        description: 'Pull every play for a coach and filter by scenario.',
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const [error, setError] = useState('');
    const [columnsOpen, setColumnsOpen] = useState(false);
    const [resultsTab, setResultsTab] = useState('plays');
    const [bucketSize, setBucketSize] = useState(DEFAULT_NUMBER_BUCKET_SIZE);
    const filters = useScoutingFilters();
    const {
        sides,
        downs,
        fieldPositions,
        playTypes,
        tempo,
        previousNumber,
        previousPlayCalls,
        previousResults,
        scoreMargin,
        customFilters,
        filterSummary,
    } = filters;
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

    const annotatedPlays = useMemo(() => annotateScoutingFields(plays, 'coach', reportTarget), [plays, reportTarget]);
    const filteredPlays = useMemo(
        () =>
            applyScenarioFilters(annotatedPlays, {
                mode: 'coach',
                target: reportTarget,
                sides,
                downs,
                fieldPositions,
                playTypes,
                tempo,
                previousNumber,
                previousPlayCalls,
                previousResults,
                scoreMargin,
                customFilters,
            }),
        [
            annotatedPlays,
            reportTarget,
            sides,
            downs,
            fieldPositions,
            playTypes,
            tempo,
            previousNumber,
            previousPlayCalls,
            previousResults,
            scoreMargin,
            customFilters,
        ]
    );

    const { page, pageCount, pageRows, setPage } = usePagedRows(filteredPlays, PLAYS_PER_PAGE, filteredPlays.length);

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
                            <NumberInput
                                value={gameCount}
                                min={1}
                                ariaLabel="Games"
                                disabled={rangeMode === 'season'}
                                onChange={(next) => setGameCount(Math.max(1, Math.floor(Number(next)) || 1))}
                            />
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
                            sx={primaryButtonSx}
                        >
                            {loading ? 'Generating…' : 'Generate report'}
                        </Box>
                    </Box>
                    <Box sx={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {rangeMode === 'season'
                            ? 'Reading every game they have played this season. Uncheck to read a set number of their most recent games instead.'
                            : `Reading their ${gameCount} most recent ${gameCount === 1 ? 'game' : 'games'}, including earlier seasons. Check current season only to read this season instead.`}
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

                    <PageTabs
                        value={resultsTab}
                        onChange={setResultsTab}
                        ariaLabel="Report sections"
                        options={[
                            { value: 'plays', label: `Plays (${filteredPlays.length} of ${plays.length})` },
                            { value: 'numbers', label: 'Numbers' },
                        ]}
                        trailing={
                            <>
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={() => setColumnsOpen(true)}
                                    sx={compact(secondaryButtonSx)}
                                >
                                    Columns ({visibleColumns.length} of {PLAY_COLUMNS.length})
                                </Box>
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={exportCsv}
                                    disabled={filteredPlays.length === 0}
                                    sx={compact(primaryButtonSx)}
                                >
                                    Export CSV
                                </Box>
                            </>
                        }
                    />
                    {resultsTab === 'numbers' && (
                        <>
                            <Box sx={{ fontSize: '0.78rem', color: 'var(--text-dim)', mb: '10px' }}>
                                {numbersFiltered
                                    ? `Matches the filters above (${filterSummary})`
                                    : 'Overall (no filters chosen)'}
                            </Box>
                            <ScoutingNumberSummary
                                favoriteNumbersList={favoriteNumbersList}
                                bucketSize={bucketSize}
                                setBucketSize={setBucketSize}
                                numberBuckets={numberBuckets}
                            />
                        </>
                    )}
                    {resultsTab === 'plays' &&
                        (filteredPlays.length === 0 ? (
                            <Panel>
                                <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No plays match these filters.
                                </Box>
                            </Panel>
                        ) : (
                            <>
                                <ScoutingPlaysTable visibleColumns={visibleColumns} filteredPlays={pageRows} />
                                <PagedFooter
                                    page={page}
                                    pageCount={pageCount}
                                    pageSize={PLAYS_PER_PAGE}
                                    total={filteredPlays.length}
                                    onChange={setPage}
                                    noun="plays"
                                />
                            </>
                        ))}
                    <EditDialog open={columnsOpen} title="Columns" onClose={() => setColumnsOpen(false)} maxWidth="lg">
                        <ScoutingColumnsPanel columns={columns} />
                    </EditDialog>
                </>
            )}
        </PageWrap>
    );
};

export default ScoutingReport;
