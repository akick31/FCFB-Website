/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import AdminFieldAppearance from './AdminFieldAppearance';
import { getBowlFields, updateBowlMeta } from '../../api/fieldAppearanceApi';
let mockPath;
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useParams: () => ({ '*': mockPath }), useNavigate: () => mockNavigate }));
jest.mock('../../api/conferenceApi', () => ({ getConferences: jest.fn() }));
jest.mock('../../api/fieldAppearanceApi', () => ({
    getBowlFields: jest.fn(),
    getPlayoffFields: jest.fn(),
    getConferenceChampionshipField: jest.fn(),
    updateBowlField: jest.fn(),
    updateBowlMeta: jest.fn(),
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
jest.mock('../../components/admin/LogoUrlField', () => ({
    __esModule: true,
    default: ({ value, onChange }) => <input aria-label="Logo" value={value} onChange={onChange} />,
}));
beforeEach(() => {
    jest.resetAllMocks();
    mockPath = 'bowls/alpha';
    getBowlFields.mockResolvedValueOnce([{ bowl: 'Alpha', marker: 'A' }]).mockResolvedValue([
        { bowl: 'Other', marker: 'O' },
        { bowl: 'Renamed', marker: 'R' },
    ]);
});

test('newer metadata edits survive list reload/navigation and submit against the renamed bowl', async () => {
    let finish;
    updateBowlMeta
        .mockReturnValueOnce(
            new Promise((resolve) => {
                finish = resolve;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(<AdminFieldAppearance />);
    await act(async () => {});
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Renamed' } });
    fireEvent.change(screen.getByLabelText('Logo'), { target: { value: 'submitted.png' } });
    fireEvent.click(screen.getByText('Save bowl details'));
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Later name' } });
    fireEvent.change(screen.getByLabelText('Logo'), { target: { value: 'later.png' } });
    await act(async () => finish({ bowl: 'Renamed' }));
    expect(mockNavigate.mock.calls.every(([path]) => path.endsWith('/renamed'))).toBe(true);
    mockPath = 'bowls/renamed';
    await act(async () => rerender(<AdminFieldAppearance />));
    expect(screen.getAllByRole('textbox')[0].value).toBe('Later name');
    expect(screen.getByLabelText('Logo').value).toBe('later.png');
    expect(screen.queryByText('Saved')).toBeNull();
    fireEvent.click(screen.getByText('Save bowl details'));
    expect(updateBowlMeta.mock.calls).toEqual([
        ['Alpha', { name: 'Renamed', logo: 'submitted.png' }],
        ['Renamed', { name: 'Later name', logo: 'later.png' }],
    ]);
});

test('transferred metadata drafts do not leak to another bowl or return after leaving', async () => {
    let finish;
    updateBowlMeta.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    const { rerender } = render(<AdminFieldAppearance />);
    await act(async () => {});
    fireEvent.click(screen.getByText('Save bowl details'));
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'draft' } });
    await act(async () => finish({ bowl: 'Renamed' }));
    mockPath = 'bowls/renamed';
    await act(async () => rerender(<AdminFieldAppearance />));
    expect(screen.getAllByRole('textbox')[0].value).toBe('draft');
    mockPath = 'bowls/other';
    await act(async () => rerender(<AdminFieldAppearance />));
    expect(screen.getAllByRole('textbox')[0].value).toBe('Other');
    mockPath = 'bowls/renamed';
    await act(async () => rerender(<AdminFieldAppearance />));
    expect(screen.getAllByRole('textbox')[0].value).toBe('Renamed');
});
