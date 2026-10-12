/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import RankingsManagement from './RankingsManagement';
import { getCurrentSeasonOrLatest, getCurrentWeekOrLatest } from '../../api/seasonApi';
import { uploadRankings } from '../../api/rankingApi';

let mockParams;
const mockSetParams = jest.fn();
jest.mock('react-router-dom', () => ({ useSearchParams: () => [mockParams, mockSetParams] }));
jest.mock('../../api/seasonApi', () => ({ getCurrentSeasonOrLatest: jest.fn(), getCurrentWeekOrLatest: jest.fn() }));
jest.mock('../../api/rankingApi', () => ({ uploadRankings: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({ conferenceLabel: (code) => code }));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/ui/SegTabs', () => ({ __esModule: true, default: () => null }));
jest.mock('./RankingMetricsPanel', () => ({ __esModule: true, default: () => null }));
const originalReader = global.FileReader;
let readers;
beforeEach(() => {
    jest.resetAllMocks();
    mockParams = new URLSearchParams();
    getCurrentSeasonOrLatest.mockResolvedValue(12);
    getCurrentWeekOrLatest.mockResolvedValue(3);
    uploadRankings.mockResolvedValue(['A', 'B']);
    readers = [];
    global.FileReader = class {
        constructor() {
            this.readyState = 0;
            this.onload = null;
            this.result = null;
            this.abort = jest.fn(() => {
                this.readyState = 2;
            });
            readers.push(this);
        }
        readAsText() {
            this.readyState = 1;
        }
    };
    global.FileReader.LOADING = 1;
});
afterEach(() => {
    global.FileReader = originalReader;
});
const seasonInput = () => screen.getByRole('spinbutton');
const weekSelect = () => screen.getAllByRole('combobox')[0];
const namesInput = () => screen.getByRole('textbox');
const renderRankings = async () => {
    const view = render(<RankingsManagement />);
    await act(async () => {});
    return view;
};
const loadCsv = (container, name = 'rankings.csv') =>
    fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [new File([''], name)] } });

test('late defaults do not overwrite manually entered season or week', async () => {
    let resolveSeason;
    getCurrentSeasonOrLatest.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveSeason = resolve;
        })
    );
    render(<RankingsManagement />);
    fireEvent.change(seasonInput(), { target: { value: '10' } });
    fireEvent.change(weekSelect(), { target: { value: '2' } });
    await act(async () => resolveSeason(12));
    expect(seasonInput().value).toBe('10');
    expect(weekSelect().value).toBe('2');
});

test('manually clearing the season prevents a pending default from restoring it', async () => {
    let resolveSeason;
    getCurrentSeasonOrLatest.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveSeason = resolve;
        })
    );
    render(<RankingsManagement />);
    fireEvent.change(seasonInput(), { target: { value: '10' } });
    fireEvent.change(seasonInput(), { target: { value: '' } });
    await act(async () => resolveSeason(12));
    expect(seasonInput().value).toBe('');
});

test('current defaults retain their clamp and merge both URL parameters', async () => {
    getCurrentWeekOrLatest.mockResolvedValueOnce(20);
    await renderRankings();
    expect(seasonInput().value).toBe('12');
    expect(weekSelect().value).toBe('14');
    const lastParams = mockSetParams.mock.calls.at(-1)[0];
    expect(lastParams.get('season')).toBe('12');
    expect(lastParams.get('week')).toBe('14');
});

test('explicit URL defaults are preserved', async () => {
    mockParams = new URLSearchParams('season=10&week=2');
    await renderRankings();
    expect(seasonInput().value).toBe('10');
    expect(weekSelect().value).toBe('2');
    expect(mockSetParams).not.toHaveBeenCalled();
});

test('an older CSV read cannot replace the latest ranked names', async () => {
    const { container } = await renderRankings();
    loadCsv(container, 'old.csv');
    const oldOnload = readers[0].onload;
    loadCsv(container, 'new.csv');
    readers[1].result = 'rank,team\n2,B\n1,A';
    act(() => readers[1].onload());
    readers[0].result = 'rank,team\n1,Obsolete';
    act(() => oldOnload());
    expect(namesInput().value).toBe('A\nB');
    expect(readers[0].abort).toHaveBeenCalledTimes(1);
});

test('pasted names are retained when a previous CSV callback finishes', async () => {
    const { container } = await renderRankings();
    loadCsv(container);
    const oldOnload = readers[0].onload;
    fireEvent.change(namesInput(), { target: { value: 'Pasted team' } });
    readers[0].result = 'rank,team\n1,Obsolete';
    act(() => oldOnload());
    expect(namesInput().value).toBe('Pasted team');
    expect(readers[0].abort).toHaveBeenCalledTimes(1);
});

test('unmount detaches and aborts a pending CSV read', async () => {
    const { container, unmount } = await renderRankings();
    loadCsv(container);
    unmount();
    expect(readers[0].onload).toBeNull();
    expect(readers[0].abort).toHaveBeenCalledTimes(1);
});

test('an old poll upload cannot report success for a newly selected period', async () => {
    let resolveUpload;
    uploadRankings.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveUpload = resolve;
        })
    );
    await renderRankings();
    fireEvent.change(namesInput(), { target: { value: 'A\nB' } });
    fireEvent.click(screen.getByRole('button', { name: /Upload Coaches Poll/ }));
    fireEvent.change(weekSelect(), { target: { value: '2' } });
    await act(async () => resolveUpload(['A', 'B']));
    expect(screen.queryByText(/Uploaded 2 teams/)).toBeNull();
    expect(uploadRankings).toHaveBeenCalledWith({ season: 12, week: 3, pollType: 'COACHES_POLL', teams: ['A', 'B'] });
});

test('current poll upload preserves payload and success feedback', async () => {
    await renderRankings();
    fireEvent.change(namesInput(), { target: { value: ' A \n\nB ' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Upload Coaches Poll/ })));
    expect(uploadRankings).toHaveBeenCalledWith({ season: 12, week: 3, pollType: 'COACHES_POLL', teams: ['A', 'B'] });
    expect(screen.getByText(/Uploaded 2 teams/)).toBeTruthy();
});

test('StrictMode cleanup suppresses the initial obsolete default result', async () => {
    let resolveOld;
    getCurrentSeasonOrLatest.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    render(
        <StrictMode>
            <RankingsManagement />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => resolveOld(9));
    expect(seasonInput().value).toBe('12');
});

test('an old upload failure cannot clear the pending state of a newer-period upload', async () => {
    let rejectOld;
    let resolveCurrent;
    uploadRankings
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
    await renderRankings();
    fireEvent.change(namesInput(), { target: { value: 'A\nB' } });
    fireEvent.click(screen.getByRole('button', { name: /Upload Coaches Poll/ }));
    fireEvent.change(weekSelect(), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /Upload Coaches Poll/ }));
    await act(async () => rejectOld(new Error('Old upload failed')));
    expect(screen.queryByText('Old upload failed')).toBeNull();
    expect(screen.getByRole('button', { name: /Upload Coaches Poll/ }).disabled).toBe(true);
    await act(async () => resolveCurrent(['A', 'B']));
    expect(screen.getByText(/Uploaded 2 teams.*Week 2/)).toBeTruthy();
});

test('default lookup failures retain the existing blank-season and week-one fallbacks', async () => {
    getCurrentSeasonOrLatest.mockRejectedValueOnce(new Error('Unavailable'));
    getCurrentWeekOrLatest.mockRejectedValueOnce(new Error('Unavailable'));
    await renderRankings();
    expect(seasonInput().value).toBe('');
    expect(weekSelect().value).toBe('1');
});
