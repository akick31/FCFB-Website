/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import TeamAppearance from './team/TeamAppearance';
import GameAppearance from './game/GameAppearance';
import AdminTeamAppearance from './admin/AdminTeamAppearance';
import { getTeamById, getAllTeams } from '../api/teamApi';
import { getGameById } from '../api/gameApi';
import {
    getTeamUniform,
    getTeamField,
    getTeamColors,
    getTeamLogos,
    updateTeamUniform,
    updateTeamField,
    updateTeamColors,
    updateTeamLogos,
} from '../api/teamAppearanceApi';
import { getGameField, updateGameField } from '../api/fieldAppearanceApi';

let mockId;
jest.mock('react-router-dom', () => ({
    useParams: () => ({ teamId: mockId, gameId: mockId, tab: 'uniform' }),
    useNavigate: () => jest.fn(),
    Link: ({ children }) => <span>{children}</span>,
}));
jest.mock('../api/teamApi', () => ({ getTeamById: jest.fn(), getAllTeams: jest.fn() }));
jest.mock('../api/gameApi', () => ({ getGameById: jest.fn() }));
jest.mock('../api/teamAppearanceApi', () => ({
    getTeamUniform: jest.fn(),
    getTeamField: jest.fn(),
    getTeamColors: jest.fn(),
    getTeamLogos: jest.fn(),
    updateTeamUniform: jest.fn(),
    updateTeamField: jest.fn(),
    updateTeamColors: jest.fn(),
    updateTeamLogos: jest.fn(),
}));
jest.mock('../api/fieldAppearanceApi', () => ({ getGameField: jest.fn(), updateGameField: jest.fn() }));
jest.mock('../utils/utils', () => ({ checkIfUserIsAdmin: () => true }));
jest.mock('../components/layout/PageWrap', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../components/ui/BackButton', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/ui/PageHeading', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/ui/SegTabs', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/admin/TeamUniformThumb', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/team/appearance/AppearanceEditor', () => ({
    __esModule: true,
    default: ({ source, half, onSave, onDirtyChange }) => (
        <>
            <button onClick={() => onSave({ design: 'new' }).then(() => onDirtyChange?.(false))}>
                {half}: {source.marker}
            </button>
            <button onClick={() => onDirtyChange?.(true)}>Edit {half}</button>
        </>
    ),
}));
jest.mock('../components/team/appearance/ColorsEditor', () => ({
    __esModule: true,
    default: ({ source, onSave }) => (
        <button onClick={() => onSave({ tertiary_color: '#123456' })}>colors: {source.marker}</button>
    ),
}));
jest.mock('../components/team/appearance/LogosEditor', () => ({
    __esModule: true,
    default: ({ source, onSave }) => (
        <button onClick={() => onSave({ logo: 'logo.png' })}>logos: {source.marker}</button>
    ),
}));

beforeEach(() => {
    jest.resetAllMocks();
    mockId = 'A';
    getTeamById.mockImplementation(async (id) => ({ id, name: id }));
    getGameById.mockImplementation(async (id) => ({ id, home_team: id, away_team: 'Away' }));
    [getTeamUniform, getTeamField, getTeamColors, getTeamLogos, getGameField].forEach((read) =>
        read.mockImplementation(async (id) => ({ marker: id }))
    );
});

test.each([
    ['team', TeamAppearance, getTeamById],
    ['game', GameAppearance, getGameById],
])('%s appearance recovers from a previous route load failure', async (label, Page, read) => {
    read.mockRejectedValueOnce(new Error('unavailable'));
    const { rerender } = render(<Page />);
    await act(async () => {});
    expect(screen.getByText('unavailable')).toBeTruthy();
    mockId = 'B';
    await act(async () => rerender(<Page />));
    expect(screen.getByText('field: B')).toBeTruthy();
    expect(screen.queryByText('unavailable')).toBeNull();
});

test.each([
    ['uniform', updateTeamUniform, { design: 'new' }],
    ['field', updateTeamField, { design: 'new' }],
    ['colors', updateTeamColors, { tertiary_color: '#123456' }],
    ['logos', updateTeamLogos, { logo: 'logo.png' }],
])('a pending %s save cannot replace another team’s settings', async (section, write, payload) => {
    let finishSave;
    write.mockReturnValueOnce(
        new Promise((resolve) => {
            finishSave = resolve;
        })
    );
    const { rerender } = render(<TeamAppearance />);
    await act(async () => {});
    fireEvent.click(screen.getByText(`${section}: A`));
    mockId = 'B';
    await act(async () => rerender(<TeamAppearance />));
    await act(async () => finishSave({ marker: 'obsolete' }));
    expect(screen.getByText(`${section}: B`)).toBeTruthy();
    expect(screen.queryByText(`${section}: obsolete`)).toBeNull();
    expect(write).toHaveBeenCalledWith('A', payload);
});

test('a pending field save cannot replace another game’s field', async () => {
    let finishSave;
    updateGameField.mockReturnValueOnce(
        new Promise((resolve) => {
            finishSave = resolve;
        })
    );
    const { rerender } = render(<GameAppearance />);
    await act(async () => {});
    fireEvent.click(screen.getByText('field: A'));
    mockId = 'B';
    await act(async () => rerender(<GameAppearance />));
    await act(async () => finishSave({ marker: 'obsolete' }));
    expect(screen.getByText('field: B')).toBeTruthy();
    expect(updateGameField).toHaveBeenCalledWith('A', { design: 'new' });
});

test('a current game field save still publishes the saved response', async () => {
    updateGameField.mockResolvedValueOnce({ marker: 'saved' });
    render(<GameAppearance />);
    await act(async () => {});
    await act(async () => fireEvent.click(screen.getByText('field: A')));
    expect(screen.getByText('field: saved')).toBeTruthy();
});

test('an old team save cannot clear the new team’s unsaved warning', async () => {
    let finishSave;
    updateTeamUniform.mockReturnValueOnce(
        new Promise((resolve) => {
            finishSave = resolve;
        })
    );
    const { rerender } = render(<TeamAppearance />);
    await act(async () => {});
    fireEvent.click(screen.getByText('Edit uniform'));
    fireEvent.click(screen.getByText('uniform: A'));
    mockId = 'B';
    await act(async () => rerender(<TeamAppearance />));
    const cleanEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);
    fireEvent.click(screen.getByText('Edit uniform'));
    await act(async () => finishSave({ marker: 'obsolete' }));
    const dirtyEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);
});

test('an obsolete admin grid failure cannot replace the current successful load', async () => {
    let rejectOld;
    getAllTeams
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockResolvedValueOnce([{ id: 1, name: 'Current' }]);
    render(
        <StrictMode>
            <AdminTeamAppearance />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => rejectOld(new Error('obsolete failure')));
    expect(screen.getByText('Current')).toBeTruthy();
    expect(screen.queryByText('obsolete failure')).toBeNull();
});
