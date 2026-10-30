import React, { useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import PageWrap from '../../components/layout/PageWrap';
import PageHeading from '../../components/ui/PageHeading';
import Panel from '../../components/ui/Panel';
import SegTabs from '../../components/ui/SegTabs';
import SelectPill from '../../components/ui/SelectPill';
import StepPager from '../../components/ui/StepPager';
import FitPagedList from '../../components/ui/FitPagedList';
import UpsetLegend from '../../components/history/UpsetLegend';
import HistoryGameHeader from '../../components/history/HistoryGameHeader';
import HistoryGameRow from '../../components/history/HistoryGameRow';
import WeekReviewPanel from '../../components/history/WeekReviewPanel';
import { useHistorySeasons, useHistoryWeek, useHistoryWeeks } from '../../hooks/useWeekHistory';
import { useSeo } from '../../hooks/useSeo';
import { ROUTE_META } from '../../routeMeta';
import { weekLabel } from '../../utils/formatText';
import { filterHistoryGames, sortHistoryGames } from '../../utils/weekHistory';

const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'ranked', label: 'Ranked' },
    { value: 'upsets', label: 'Upsets' },
    { value: 'close', label: 'One score' },
];

const numberParam = (params, key) => (params.get(key) ? Number(params.get(key)) : null);

const Loading = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
    </Box>
);

const History = () => {
    useSeo(ROUTE_META['/history']);
    const [params, setParams] = useSearchParams();
    const [filter, setFilter] = useState('all');
    const { seasons, season } = useHistorySeasons(numberParam(params, 'season'));
    const weeks = useHistoryWeeks(season);
    const requestedWeek = numberParam(params, 'week');
    const week = weeks?.includes(requestedWeek) ? requestedWeek : (weeks?.[weeks.length - 1] ?? null);
    const { loading, data } = useHistoryWeek(season, week);

    const games = useMemo(
        () => (data ? filterHistoryGames(sortHistoryGames(data.games), filter, data.highlights) : []),
        [data, filter]
    );
    const upsetIds = useMemo(() => new Set((data?.highlights.upsets || []).map((upset) => upset.game_id)), [data]);
    const weekIndex = weeks ? weeks.indexOf(week) : -1;

    const select = (nextSeason, nextWeek) => {
        const next = new URLSearchParams(params);
        next.set('season', String(nextSeason));
        if (nextWeek == null) {
            next.delete('week');
        } else {
            next.set('week', String(nextWeek));
        }
        setParams(next, { replace: true });
    };

    return (
        <PageWrap>
            <PageHeading eyebrow="Past seasons" title="History" />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '9px', mb: '14px' }}>
                {seasons.length > 0 && season != null && (
                    <SelectPill
                        label="Season"
                        value={season}
                        onChange={(next) => select(Number(next), null)}
                        options={seasons.map((option) => ({ value: option, label: `Season ${option}` }))}
                    />
                )}
                {weeks?.length > 0 && week != null && (
                    <>
                        <SelectPill
                            label="Week"
                            value={week}
                            onChange={(next) => select(season, Number(next))}
                            options={weeks.map((option) => ({ value: option, label: weekLabel(option) }))}
                        />
                        <StepPager
                            page={weekIndex}
                            pageCount={weeks.length}
                            onChange={(index) => select(season, weeks[index])}
                        />
                    </>
                )}
                <Box sx={{ ml: { md: 'auto' } }}>
                    <SegTabs value={filter} onChange={setFilter} options={FILTERS} ariaLabel="Game filter" />
                </Box>
            </Box>
            {weeks && weeks.length === 0 && (
                <Panel>
                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                        No finished games in Season {season} yet.
                    </Box>
                </Panel>
            )}
            {(loading || !weeks) && weeks?.length !== 0 && <Loading />}
            {data && !loading && (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.7fr) minmax(0, 1fr)' },
                        gap: '16px',
                        alignItems: 'start',
                    }}
                >
                    <Panel header={weekLabel(week)} more={<UpsetLegend />}>
                        {games.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No games match.</Box>
                        ) : (
                            <>
                                <HistoryGameHeader />
                                <FitPagedList
                                    rows={games.map((game) => ({ key: game.game_id, game }))}
                                    rowHeight={38}
                                    noun="games"
                                    resetKey={`${season}|${week}|${filter}`}
                                    renderRow={({ game }) => (
                                        <HistoryGameRow game={game} upset={upsetIds.has(game.game_id)} />
                                    )}
                                />
                            </>
                        )}
                    </Panel>
                    <WeekReviewPanel week={data} />
                </Box>
            )}
        </PageWrap>
    );
};

export default History;
