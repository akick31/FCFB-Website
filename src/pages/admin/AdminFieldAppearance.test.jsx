/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import AdminFieldAppearance from './AdminFieldAppearance';
import { getConferences } from '../../api/conferenceApi';
import {
    getBowlFields,
    getPlayoffFields,
    getConferenceChampionshipField,
    updateBowlField,
} from '../../api/fieldAppearanceApi';
let mockPath;
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useParams: () => ({ '*': mockPath }), useNavigate: () => mockNavigate }));
jest.mock('../../api/conferenceApi', () => ({ getConferences: jest.fn() }));
jest.mock('../../api/fieldAppearanceApi', () => ({
    getBowlFields: jest.fn(),
    getPlayoffFields: jest.fn(),
    getConferenceChampionshipField: jest.fn(),
    updateBowlField: jest.fn(),
    updatePlayoffField: jest.fn(),
    updateConferenceChampionshipField: jest.fn(),
}));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/BackButton', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/ui/SegTabs', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/admin/fieldAppearance/PostseasonFieldThumb', () => ({
    __esModule: true,
    default: () => null,
}));
jest.mock('../../components/admin/fieldAppearance/FieldSettingsEditor', () => ({
    __esModule: true,
    default: ({ source, onSave }) => <button onClick={() => onSave({ grass: 'new' })}>Field {source.marker}</button>,
}));
jest.mock('../../components/admin/fieldAppearance/BowlMetaEditor', () => ({
    __esModule: true,
    default: ({ bowl, onSaved }) => <button onClick={() => onSaved('Renamed')}>Rename {bowl}</button>,
}));
beforeEach(() => {
    jest.resetAllMocks();
    mockPath = 'bowls/alpha';
    getBowlFields.mockResolvedValue([
        { bowl: 'Alpha', marker: 'A' },
        { bowl: 'Beta', marker: 'B' },
    ]);
    getPlayoffFields.mockResolvedValue([{ round: 'National Championship', marker: 'NC' }]);
    getConferences.mockResolvedValue([
        { code: 'A', label: 'Alpha', active: true },
        { code: 'B', label: 'Beta', active: true },
    ]);
    getConferenceChampionshipField.mockImplementation(async (id) => ({ marker: id }));
});

test('switching category cannot publish an older list or redirect using its items', async () => {
    let finish;
    getBowlFields.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    const { rerender } = render(<AdminFieldAppearance />);
    mockPath = 'playoff-rounds/national-championship';
    await act(async () => rerender(<AdminFieldAppearance />));
    await act(async () => finish([{ bowl: 'Old', marker: 'obsolete' }]));
    expect(screen.getByText('Field NC')).toBeTruthy();
    expect(screen.queryByText('Field obsolete')).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
});

test('changing category hides the previous editor while the new list loads', async () => {
    getPlayoffFields.mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(<AdminFieldAppearance />);
    await act(async () => {});
    mockPath = 'playoff-rounds';
    rerender(<AdminFieldAppearance />);
    expect(screen.queryByText('Field A')).toBeNull();
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
});

test('late conference field reads cannot populate the newer selection', async () => {
    let finish;
    mockPath = 'conference-championships/a';
    getConferenceChampionshipField.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    const { rerender } = render(<AdminFieldAppearance />);
    await act(async () => {});
    mockPath = 'conference-championships/b';
    await act(async () => rerender(<AdminFieldAppearance />));
    await act(async () => finish({ marker: 'obsolete' }));
    expect(screen.getByText('Field B')).toBeTruthy();
    expect(screen.queryByText('Field obsolete')).toBeNull();
});

test('a field load failure clears when selecting a valid field', async () => {
    mockPath = 'conference-championships/a';
    getConferenceChampionshipField.mockRejectedValueOnce(new Error('unavailable'));
    const { rerender } = render(<AdminFieldAppearance />);
    await act(async () => {});
    expect(screen.getByText('unavailable')).toBeTruthy();
    mockPath = 'conference-championships/b';
    await act(async () => rerender(<AdminFieldAppearance />));
    expect(screen.getByText('Field B')).toBeTruthy();
    expect(screen.queryByText('unavailable')).toBeNull();
});

test('a save for another field cannot overwrite the current source', async () => {
    let finish;
    updateBowlField.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    const { rerender } = render(<AdminFieldAppearance />);
    await act(async () => {});
    fireEvent.click(screen.getByText('Field A'));
    mockPath = 'bowls/beta';
    await act(async () => rerender(<AdminFieldAppearance />));
    await act(async () => finish({ bowl: 'Alpha', marker: 'obsolete' }));
    expect(screen.getByText('Field B')).toBeTruthy();
    expect(updateBowlField).toHaveBeenCalledWith('Alpha', { grass: 'new' });
});

test('a rename reload cannot navigate after switching categories', async () => {
    let finish;
    const { rerender } = render(<AdminFieldAppearance />);
    await act(async () => {});
    getBowlFields.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    fireEvent.click(screen.getByText('Rename Alpha'));
    mockPath = 'playoff-rounds/national-championship';
    await act(async () => rerender(<AdminFieldAppearance />));
    await act(async () => finish([{ bowl: 'Renamed', marker: 'obsolete' }]));
    expect(screen.getByText('Field NC')).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
});

test('a current rename still refreshes its list and selects the returned bowl', async () => {
    render(<AdminFieldAppearance />);
    await act(async () => {});
    getBowlFields.mockResolvedValueOnce([{ bowl: 'Renamed', marker: 'new' }]);
    await act(async () => fireEvent.click(screen.getByText('Rename Alpha')));
    expect(mockNavigate).toHaveBeenLastCalledWith('/admin/postseason-appearance/bowls/renamed', { replace: true });
});

test('obsolete StrictMode failures cannot replace the current list', async () => {
    let reject;
    getBowlFields.mockReturnValueOnce(
        new Promise((resolve, fail) => {
            reject = fail;
        })
    );
    render(
        <StrictMode>
            <AdminFieldAppearance />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => reject(new Error('obsolete')));
    expect(screen.getByText('Field A')).toBeTruthy();
    expect(screen.queryByText('obsolete')).toBeNull();
});

test('a current category failure retains its error', async () => {
    getBowlFields.mockRejectedValueOnce(new Error('list unavailable'));
    render(<AdminFieldAppearance />);
    await act(async () => {});
    expect(screen.getByText('list unavailable')).toBeTruthy();
});

test('an obsolete field failure cannot surface on another selection', async () => {
    let reject;
    mockPath = 'conference-championships/a';
    getConferenceChampionshipField.mockReturnValueOnce(
        new Promise((resolve, fail) => {
            reject = fail;
        })
    );
    const { rerender } = render(<AdminFieldAppearance />);
    await act(async () => {});
    mockPath = 'conference-championships/b';
    await act(async () => rerender(<AdminFieldAppearance />));
    await act(async () => reject(new Error('obsolete field error')));
    expect(screen.getByText('Field B')).toBeTruthy();
    expect(screen.queryByText('obsolete field error')).toBeNull();
});

test('a current field save still publishes the saved response', async () => {
    updateBowlField.mockResolvedValueOnce({ bowl: 'Alpha', marker: 'saved' });
    render(<AdminFieldAppearance />);
    await act(async () => {});
    await act(async () => fireEvent.click(screen.getByText('Field A')));
    expect(screen.getByText('Field saved')).toBeTruthy();
});
