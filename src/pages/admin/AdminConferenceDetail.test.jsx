/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import AdminConferenceDetail from './AdminConferenceDetail';
import { getConferences, updateConference, setConferenceActive } from '../../api/conferenceApi';
import { getAllTeams, updateTeam } from '../../api/teamApi';
import { refreshConferences } from '../../hooks/useConferencesMap';

let mockCode;
jest.mock('react-router-dom', () => ({ useParams: () => ({ code: mockCode }), useNavigate: () => jest.fn() }));
jest.mock('../../api/conferenceApi', () => ({
    getConferences: jest.fn(),
    updateConference: jest.fn(),
    setConferenceActive: jest.fn(),
}));
jest.mock('../../api/teamApi', () => ({ getAllTeams: jest.fn(), updateTeam: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({ refreshConferences: jest.fn() }));
jest.mock('../../utils/navigation', () => ({ goBackOr: jest.fn() }));
jest.mock('../../hooks/useConferenceRules', () => ({ __esModule: true, default: () => ({ divisions: [] }) }));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ title, children }) => (
        <div>
            <h1>{title}</h1>
            {children}
        </div>
    ),
}));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/ui/SegTabs', () => ({
    __esModule: true,
    default: ({ onChange }) => <button onClick={() => onChange('teams')}>Teams tab</button>,
}));
jest.mock('../../components/scheduling/ConferenceRulesEditor', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/admin/ConferenceSettingsPanel', () => ({
    __esModule: true,
    default: ({ settingsForm, onSubmit, onToggleActive, settingsError, settingsSuccess, savingSettings }) => (
        <form onSubmit={onSubmit}>
            <span>{settingsForm.label}</span>
            <span>{settingsError}</span>
            <span>{settingsSuccess}</span>
            <button disabled={savingSettings}>Save</button>
            <button type="button" onClick={onToggleActive}>
                Toggle active
            </button>
        </form>
    ),
}));
jest.mock('../../components/admin/ConferenceTeamsPanel', () => ({
    __esModule: true,
    default: ({ teams, onMoveTeam, onUpdateTeamDivision, onRemoveFromConference, onAddTeam }) => (
        <div>
            <button onClick={() => onMoveTeam(teams[0], 'B')}>Move</button>
            <button onClick={() => onUpdateTeamDivision(teams[0], '')}>Division</button>
            <button onClick={() => onRemoveFromConference(teams[0])}>Remove</button>
            <button onClick={() => onAddTeam(teams[0])}>Add</button>
        </div>
    ),
}));

const conferences = [
    { code: 'A', label: 'Alpha', active: true },
    { code: 'B', label: 'Beta', active: false },
];
const team = { name: 'Team', conference: 'A', division: 'East' };

beforeEach(() => {
    jest.clearAllMocks();
    mockCode = 'A';
    getConferences.mockReset().mockResolvedValue(conferences);
    getAllTeams.mockReset().mockResolvedValue([team]);
    updateConference.mockReset().mockResolvedValue(undefined);
    updateTeam.mockReset().mockResolvedValue(undefined);
    setConferenceActive.mockReset().mockResolvedValue(undefined);
});

test('an obsolete route response cannot replace the current conference', async () => {
    let resolveOld;
    getConferences.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    const { rerender } = render(<AdminConferenceDetail />);
    mockCode = 'B';
    await act(async () => rerender(<AdminConferenceDetail />));
    await act(async () => resolveOld([{ code: 'B', label: 'Obsolete' }]));
    expect(screen.getByRole('heading').textContent).toBe('Beta');
    expect(screen.queryByText('Obsolete')).toBeNull();
});

test('obsolete failures cannot end the new route loading state', async () => {
    let rejectOld;
    getConferences
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(<AdminConferenceDetail />);
    mockCode = 'B';
    rerender(<AdminConferenceDetail />);
    await act(async () => rejectOld(new Error('old failure')));
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.queryByText('Failed to load conference data')).toBeNull();
});

test('a successful route load clears the previous route failure', async () => {
    getConferences.mockRejectedValueOnce(new Error('unavailable'));
    const { rerender } = render(<AdminConferenceDetail />);
    await act(async () => {});
    expect(screen.getByText('Failed to load conference data')).toBeTruthy();
    mockCode = 'B';
    await act(async () => rerender(<AdminConferenceDetail />));
    expect(screen.queryByText('Failed to load conference data')).toBeNull();
    expect(screen.getByRole('heading').textContent).toBe('Beta');
});

test('a previous conference save refreshes shared data without changing current feedback', async () => {
    let resolveSave;
    updateConference.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveSave = resolve;
        })
    );
    const { rerender } = render(<AdminConferenceDetail />);
    await act(async () => {});
    fireEvent.click(screen.getByText('Save'));
    expect(updateConference).toHaveBeenCalledWith('A', {
        code: 'A',
        label: 'Alpha',
        abbreviation: null,
        logoUrl: null,
        logoUrlDark: null,
    });
    mockCode = 'B';
    await act(async () => rerender(<AdminConferenceDetail />));
    await act(async () => resolveSave());
    expect(screen.getByRole('heading').textContent).toBe('Beta');
    expect(screen.queryByText('Conference settings saved')).toBeNull();
    expect(screen.getByText('Save').disabled).toBe(false);
    expect(refreshConferences).toHaveBeenCalledTimes(1);
    expect(getConferences).toHaveBeenCalledTimes(2);
});

test('a previous conference mutation failure cannot surface in the current conference', async () => {
    let rejectToggle;
    setConferenceActive.mockReturnValueOnce(
        new Promise((resolve, reject) => {
            rejectToggle = reject;
        })
    );
    const { rerender } = render(<AdminConferenceDetail />);
    await act(async () => {});
    fireEvent.click(screen.getByText('Toggle active'));
    mockCode = 'B';
    await act(async () => rerender(<AdminConferenceDetail />));
    await act(async () => rejectToggle(new Error('old mutation failure')));
    expect(screen.queryByText('old mutation failure')).toBeNull();
    expect(setConferenceActive).toHaveBeenCalledWith('A', false);
});

test.each([
    ['Move', { ...team, conference: 'B' }],
    ['Division', { ...team, division: null }],
    ['Remove', { ...team, conference: null }],
    ['Add', team],
])('%s preserves the team update payload and reloads data', async (label, payload) => {
    render(<AdminConferenceDetail />);
    await act(async () => {});
    fireEvent.click(screen.getByText('Teams tab'));
    await act(async () => fireEvent.click(screen.getByText(label)));
    expect(updateTeam).toHaveBeenCalledWith(payload);
    expect(getConferences).toHaveBeenCalledTimes(2);
});

test('StrictMode cleanup invalidates the first read', async () => {
    let resolveOld;
    getConferences.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    render(
        <StrictMode>
            <AdminConferenceDetail />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => resolveOld([{ code: 'A', label: 'Obsolete' }]));
    expect(screen.getByRole('heading').textContent).toBe('Alpha');
});

test('a team update completed after changing conferences cannot reload the new route', async () => {
    let resolveUpdate;
    updateTeam.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveUpdate = resolve;
        })
    );
    const { rerender } = render(<AdminConferenceDetail />);
    await act(async () => {});
    fireEvent.click(screen.getByText('Teams tab'));
    fireEvent.click(screen.getByText('Remove'));
    mockCode = 'B';
    await act(async () => rerender(<AdminConferenceDetail />));
    await act(async () => resolveUpdate());
    expect(getConferences).toHaveBeenCalledTimes(2);
    expect(updateTeam).toHaveBeenCalledWith({ ...team, conference: null });
    expect(screen.getByRole('heading').textContent).toBe('Beta');
});
