/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import RankingMetricsPanel from './RankingMetricsPanel';
import {
    computeRankingMetrics,
    backfillRankingMetrics,
    getRankingMetrics,
    getValidRankingMetricWeeks,
} from '../../api/rankingMetricApi';
import { getAllSeasons } from '../../api/seasonApi';

jest.mock('../../api/rankingMetricApi', () => ({
    computeRankingMetrics: jest.fn(),
    backfillRankingMetrics: jest.fn(),
    getRankingMetrics: jest.fn(),
    getValidRankingMetricWeeks: jest.fn(),
}));
jest.mock('../../api/seasonApi', () => ({ getAllSeasons: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({ conferenceLabel: (code) => code }));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/ui/DataTable', () => ({
    __esModule: true,
    default: ({ children }) => <table>{children}</table>,
}));
const computed = { metricTypesComputed: ['EQUIVALENT_WINS'], teamsProcessed: 2, season: 11 };
const rows = (teamName, value = 3) => [{ teamId: teamName, teamName, value }];
const seasonSelect = () => screen.getAllByRole('combobox')[0];
const weekSelect = () => screen.getAllByRole('combobox')[1];
const metricSelect = () => screen.getAllByRole('combobox')[2];
const computeButton = () => screen.getByRole('button', { name: /Recompute for/ });
const backfillButton = () => screen.getByRole('button', { name: 'Backfill entire season' });
beforeEach(() => {
    jest.resetAllMocks();
    getAllSeasons.mockResolvedValue([{ season_number: 11 }, { season_number: 10 }]);
    getValidRankingMetricWeeks.mockResolvedValue([1, 2, 3]);
    getRankingMetrics.mockResolvedValue(rows('Current'));
    computeRankingMetrics.mockResolvedValue(computed);
    backfillRankingMetrics.mockResolvedValue([{ week: 1 }, { week: 3 }]);
});
const renderPanel = async () => {
    const view = render(<RankingMetricsPanel />);
    await act(async () => {});
    return view;
};

test('overlapping metric previews retain the latest rows', async () => {
    let resolveOld;
    getRankingMetrics.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    await renderPanel();
    fireEvent.change(metricSelect(), { target: { value: 'MARGIN_OF_VICTORY' } });
    await act(async () => fireEvent.change(metricSelect(), { target: { value: 'SCORING_DEFENSE' } }));
    await act(async () => resolveOld(rows('Obsolete')));
    expect(screen.getByText('Current')).toBeTruthy();
    expect(screen.queryByText('Obsolete')).toBeNull();
    expect(getRankingMetrics.mock.calls).toEqual([
        [11, 3, 'MARGIN_OF_VICTORY'],
        [11, 3, 'SCORING_DEFENSE'],
    ]);
});

test('an obsolete preview failure cannot stop a newer preview loading state', async () => {
    let rejectOld;
    getRankingMetrics
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    await renderPanel();
    fireEvent.change(metricSelect(), { target: { value: 'MARGIN_OF_VICTORY' } });
    fireEvent.change(metricSelect(), { target: { value: 'SCORING_DEFENSE' } });
    await act(async () => rejectOld(new Error('Old failure')));
    expect(screen.getByRole('progressbar')).toBeTruthy();
});

test('period changes clear a preview and suppress its pending response', async () => {
    let resolveOld;
    getRankingMetrics.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    await renderPanel();
    fireEvent.change(metricSelect(), { target: { value: 'MARGIN_OF_VICTORY' } });
    fireEvent.change(weekSelect(), { target: { value: '1' } });
    await act(async () => resolveOld(rows('Obsolete')));
    expect(screen.queryByText('Obsolete')).toBeNull();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(getRankingMetrics).toHaveBeenCalledTimes(1);
});

test('compute completion uses the current preview metric while retaining its numeric period arguments', async () => {
    let resolveCompute;
    computeRankingMetrics.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveCompute = resolve;
        })
    );
    await renderPanel();
    fireEvent.click(computeButton());
    await act(async () => fireEvent.change(metricSelect(), { target: { value: 'SCORING_DEFENSE' } }));
    await act(async () => resolveCompute(computed));
    expect(computeRankingMetrics).toHaveBeenCalledWith(11, 3);
    expect(getRankingMetrics).toHaveBeenLastCalledWith(11, 3, 'SCORING_DEFENSE');
    expect(screen.getByText(/Computed 1 metrics for 2 teams/)).toBeTruthy();
    expect(computeButton().disabled).toBe(false);
});

test('a previous-period compute failure cannot clear a current compute or report an error', async () => {
    let rejectOld;
    let resolveCurrent;
    computeRankingMetrics
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveCurrent = resolve;
            })
        );
    await renderPanel();
    fireEvent.click(computeButton());
    fireEvent.change(weekSelect(), { target: { value: '1' } });
    fireEvent.click(computeButton());
    await act(async () => rejectOld(new Error('Old compute failed')));
    expect(screen.queryByText('Old compute failed')).toBeNull();
    expect(computeButton().disabled).toBe(true);
    await act(async () => resolveCurrent(computed));
    expect(getRankingMetrics).toHaveBeenLastCalledWith(11, 1, 'EQUIVALENT_WINS');
});

test('a previous-period compute success cannot show mislabeled results or reload its preview', async () => {
    let resolveOld;
    computeRankingMetrics.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    await renderPanel();
    fireEvent.click(computeButton());
    fireEvent.change(weekSelect(), { target: { value: '1' } });
    await act(async () => resolveOld(computed));
    expect(screen.queryByText(/Computed 1 metrics/)).toBeNull();
    expect(getRankingMetrics).not.toHaveBeenCalled();
});

test('current backfill still selects and previews the last returned week', async () => {
    await renderPanel();
    fireEvent.change(weekSelect(), { target: { value: '1' } });
    await act(async () => fireEvent.click(backfillButton()));
    expect(backfillRankingMetrics).toHaveBeenCalledWith(11);
    expect(weekSelect().value).toBe('3');
    expect(screen.getByText('Current')).toBeTruthy();
    expect(screen.getByText(/Backfilled 2 weeks for Season 11/)).toBeTruthy();
    expect(getRankingMetrics).toHaveBeenCalledWith(11, 3, 'EQUIVALENT_WINS');
    expect(backfillButton().disabled).toBe(false);
});

test('a week chosen during a season backfill is retained while its season result is reported', async () => {
    let resolveBackfill;
    backfillRankingMetrics.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveBackfill = resolve;
        })
    );
    await renderPanel();
    fireEvent.click(backfillButton());
    fireEvent.change(weekSelect(), { target: { value: '1' } });
    await act(async () => resolveBackfill([{ week: 1 }, { week: 2 }]));
    expect(weekSelect().value).toBe('1');
    expect(screen.getByText(/Backfilled 2 weeks for Season 11/)).toBeTruthy();
    expect(getRankingMetrics).not.toHaveBeenCalled();
});

test('an old-season backfill cannot replace a new season or its current pending backfill', async () => {
    let resolveOld;
    let resolveCurrent;
    backfillRankingMetrics
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveCurrent = resolve;
            })
        );
    await renderPanel();
    fireEvent.click(backfillButton());
    await act(async () => fireEvent.change(seasonSelect(), { target: { value: '10' } }));
    fireEvent.click(backfillButton());
    await act(async () => resolveOld([{ week: 1 }]));
    expect(screen.queryByText(/Backfilled/)).toBeNull();
    expect(backfillButton().disabled).toBe(true);
    await act(async () => resolveCurrent([{ week: 3 }]));
    expect(screen.getByText(/Backfilled 1 week for Season 10/)).toBeTruthy();
});

test('current compute and backfill failures retain their existing messages', async () => {
    computeRankingMetrics.mockRejectedValueOnce(new Error('Compute failed'));
    backfillRankingMetrics.mockRejectedValueOnce(new Error('Backfill failed'));
    await renderPanel();
    await act(async () => fireEvent.click(computeButton()));
    await act(async () => fireEvent.click(backfillButton()));
    expect(screen.getByText('Compute failed')).toBeTruthy();
    expect(screen.getByText('Backfill failed')).toBeTruthy();
    expect(computeButton().disabled).toBe(false);
    expect(backfillButton().disabled).toBe(false);
});

test('preview ordering retains descending offense and ascending defense metrics', async () => {
    getRankingMetrics.mockResolvedValue([
        { teamId: 1, teamName: 'Lower', value: 1 },
        { teamId: 2, teamName: 'Higher', value: 10 },
    ]);
    await renderPanel();
    await act(async () => fireEvent.change(metricSelect(), { target: { value: 'SCORING_OFFENSE' } }));
    expect(screen.getAllByRole('row')[1].textContent).toContain('Higher');
    await act(async () => fireEvent.change(metricSelect(), { target: { value: 'SCORING_DEFENSE' } }));
    expect(screen.getAllByRole('row')[1].textContent).toContain('Lower');
});

test('compute completion after unmount cannot request a follow-up preview', async () => {
    let resolveCompute;
    computeRankingMetrics.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveCompute = resolve;
        })
    );
    const { unmount } = await renderPanel();
    fireEvent.click(computeButton());
    unmount();
    await act(async () => resolveCompute(computed));
    expect(getRankingMetrics).not.toHaveBeenCalled();
});
