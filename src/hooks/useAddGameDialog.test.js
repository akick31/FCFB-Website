/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useAddGameDialog from './useAddGameDialog';
import { getBowl, createScheduleEntry } from '../api/scheduleApi';
import { uploadPostseasonLogo } from '../api/uploadApi';

jest.mock('../api/scheduleApi', () => ({ getBowl: jest.fn(), createScheduleEntry: jest.fn() }));
jest.mock('../api/uploadApi', () => ({ uploadPostseasonLogo: jest.fn() }));
jest.mock('./useConferencesMap', () => ({ getConference: () => null }));
jest.mock('../utils/logoUrl', () => ({ resolveLogoUrl: (logo) => `resolved:${logo}` }));

const deferred = () => {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
};

let props;
let readers;
let originalFileReader;

beforeEach(() => {
    jest.clearAllMocks();
    getBowl.mockReset().mockResolvedValue(null);
    createScheduleEntry.mockReset().mockResolvedValue({});
    uploadPostseasonLogo.mockReset().mockResolvedValue({ url: 'uploaded.png' });
    props = { season: 12, scheduleLocked: false, teamMap: {}, onSuccess: jest.fn(), showSnackbar: jest.fn() };
    readers = [];
    originalFileReader = global.FileReader;
    global.FileReader = class {
        constructor() {
            this.readyState = 0;
            this.abort = jest.fn(() => {
                this.readyState = 2;
            });
            readers.push(this);
        }
        readAsDataURL(file) {
            this.file = file;
            this.readyState = 1;
        }
    };
});

afterEach(() => {
    global.FileReader = originalFileReader;
});

const open = (result, type = 'BOWL') => act(() => result.current.openForPostseason(type, 14));
const lookup = (result, name) => {
    act(() => result.current.setAddGameBowlName(name));
    act(() => result.current.handleBowlNameBlur());
};
const reopen = (result, type) => {
    act(() => result.current.setAddGameDialogOpen(false));
    open(result, type);
};
const startUpload = (result, file = new File(['logo'], 'logo.png')) => {
    let completion;
    act(() => {
        completion = result.current.handleUploadLogo(file);
    });
    return completion;
};

test('an older bowl lookup cannot overwrite the latest bowl defaults', async () => {
    const older = deferred();
    getBowl
        .mockReturnValueOnce(older.promise)
        .mockResolvedValueOnce({ last_venue: 'Current Venue', logo: 'current.png' });
    const { result } = renderHook(useAddGameDialog, { initialProps: props });
    open(result);
    lookup(result, 'Older Bowl');
    lookup(result, 'Current Bowl');
    await act(async () => {});
    await act(async () => older.resolve({ last_venue: 'Older Venue', logo: 'older.png' }));
    expect(result.current.addGameVenue).toBe('Current Venue');
    expect(result.current.addGameLogo).toBe('current.png');
    expect(result.current.addGameLogoPreview).toBe('resolved:current.png');
    expect(getBowl.mock.calls).toEqual([['Older Bowl'], ['Current Bowl']]);
});

test('changing the bowl name without another blur invalidates a pending lookup', async () => {
    const pending = deferred();
    getBowl.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(useAddGameDialog, { initialProps: props });
    open(result);
    lookup(result, 'Older Bowl');
    act(() => result.current.setAddGameBowlName('New draft'));
    await act(async () => pending.resolve({ last_venue: 'Older Venue', logo: 'older.png' }));
    expect(result.current.addGameVenue).toBe('');
    expect(result.current.addGameLogo).toBeNull();
});

test('bowl defaults retain a venue and logo edited while the lookup is pending', async () => {
    const pending = deferred();
    getBowl.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(useAddGameDialog, { initialProps: props });
    open(result);
    lookup(result, 'Bowl');
    act(() => {
        result.current.setAddGameVenue('Edited Venue');
        result.current.setAddGameLogo('edited.png');
        result.current.setAddGameLogoPreview('edited.png');
    });
    await act(async () => pending.resolve({ last_venue: 'Default Venue', logo: 'default.png' }));
    expect(result.current.addGameVenue).toBe('Edited Venue');
    expect(result.current.addGameLogo).toBe('edited.png');
    expect(result.current.addGameLogoPreview).toBe('edited.png');
});

test('a dismissed bowl lookup cannot populate a reopened dialog', async () => {
    const pending = deferred();
    getBowl.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(useAddGameDialog, { initialProps: props });
    open(result);
    lookup(result, 'Bowl');
    reopen(result, 'BOWL');
    await act(async () => pending.resolve({ last_venue: 'Older Venue', logo: 'older.png' }));
    expect(result.current.addGameVenue).toBe('');
    expect(result.current.addGameLogo).toBeNull();
});

test('current bowl defaults preserve lookup trimming and an existing logo', async () => {
    getBowl.mockResolvedValue({ last_venue: 'Default Venue', logo: 'default.png' });
    const { result } = renderHook(useAddGameDialog, { initialProps: props });
    open(result);
    act(() => result.current.setAddGameLogo('existing.png'));
    lookup(result, ' Bowl ');
    await act(async () => {});
    expect(getBowl).toHaveBeenCalledWith('Bowl');
    expect(result.current.addGameVenue).toBe('Default Venue');
    expect(result.current.addGameLogo).toBe('existing.png');
});

test.each(['success', 'failure'])('an obsolete upload %s cannot finish the reopened dialog upload', async (outcome) => {
    const older = deferred();
    const current = deferred();
    uploadPostseasonLogo.mockReturnValueOnce(older.promise).mockReturnValueOnce(current.promise);
    const { result } = renderHook(useAddGameDialog, { initialProps: props });
    open(result, 'PLAYOFFS');
    const olderCompletion = startUpload(result);
    reopen(result, 'PLAYOFFS');
    expect(result.current.uploadingLogo).toBe(false);
    const currentCompletion = startUpload(result);
    await act(async () => {
        if (outcome === 'success') {
            older.resolve({ url: 'older.png' });
        } else {
            older.reject(new Error('Older failure'));
        }
        await olderCompletion;
    });
    expect(result.current.uploadingLogo).toBe(true);
    expect(result.current.addGameLogo).toBeNull();
    expect(props.showSnackbar).not.toHaveBeenCalled();
    expect(readers).toHaveLength(0);
    await act(async () => {
        current.resolve({ url: 'current.png' });
        await currentCompletion;
    });
    expect(result.current.addGameLogo).toBe('current.png');
});

test('a queued file preview cannot overwrite a later upload', async () => {
    uploadPostseasonLogo.mockResolvedValueOnce({ url: 'first.png' }).mockResolvedValueOnce({ url: 'second.png' });
    const { result } = renderHook(useAddGameDialog, { initialProps: props });
    open(result, 'PLAYOFFS');
    await act(async () => {
        await startUpload(result);
    });
    const queuedPreview = readers[0].onloadend;
    await act(async () => {
        await startUpload(result);
    });
    readers[0].result = 'data:first';
    readers[1].result = 'data:second';
    act(() => readers[1].onloadend());
    act(() => queuedPreview());
    expect(result.current.addGameLogoPreview).toBe('data:second');
    expect(result.current.addGameLogo).toBe('second.png');
    expect(readers[0].abort).toHaveBeenCalledTimes(1);
});

test('dialog cleanup aborts and detaches a pending local preview', async () => {
    const { result } = renderHook(useAddGameDialog, { initialProps: props });
    open(result, 'PLAYOFFS');
    await act(async () => {
        await startUpload(result);
    });
    const queuedPreview = readers[0].onloadend;
    reopen(result, 'PLAYOFFS');
    readers[0].result = 'data:obsolete';
    act(() => queuedPreview());
    expect(result.current.addGameLogoPreview).toBeNull();
    expect(readers[0].onloadend).toBeNull();
    expect(readers[0].abort).toHaveBeenCalledTimes(1);
});

test('an upload resolved after unmount does not start a preview or publish feedback', async () => {
    const pending = deferred();
    uploadPostseasonLogo.mockReturnValueOnce(pending.promise);
    const { result, unmount } = renderHook(useAddGameDialog, { initialProps: props });
    open(result, 'PLAYOFFS');
    const completion = startUpload(result);
    unmount();
    await act(async () => {
        pending.resolve({ url: 'obsolete.png' });
        await completion;
    });
    expect(readers).toHaveLength(0);
    expect(props.showSnackbar).not.toHaveBeenCalled();
});

test('current upload failure keeps existing feedback and allows retry', async () => {
    uploadPostseasonLogo.mockRejectedValueOnce(new Error('Upload unavailable'));
    const { result } = renderHook(useAddGameDialog, { initialProps: props });
    open(result, 'PLAYOFFS');
    await act(async () => {
        await startUpload(result);
    });
    expect(props.showSnackbar).toHaveBeenCalledWith('Failed to upload logo: Upload unavailable', 'error');
    expect(result.current.uploadingLogo).toBe(false);
    await act(async () => {
        await startUpload(result);
    });
    expect(result.current.addGameLogo).toBe('uploaded.png');
});

test.each(['success', 'failure'])('a dismissed creation %s cannot reset a reopened dialog', async (outcome) => {
    const pending = deferred();
    createScheduleEntry.mockReturnValueOnce(pending.promise);
    const { result } = renderHook(useAddGameDialog, { initialProps: props });
    open(result, 'CONFERENCE_GAME');
    act(() => {
        result.current.handleHomeChange({ name: 'Home' });
        result.current.handleAwayChange({ name: 'Away' });
    });
    let completion;
    act(() => {
        completion = result.current.handleAddGame();
    });
    reopen(result, 'BOWL');
    act(() => result.current.setAddGameBowlName('New Bowl'));
    await act(async () => {
        if (outcome === 'success') {
            pending.resolve({});
        } else {
            pending.reject(new Error('Older failure'));
        }
        await completion;
    });
    expect(result.current.addGameDialogOpen).toBe(true);
    expect(result.current.addGameBowlName).toBe('New Bowl');
    expect(props.showSnackbar).not.toHaveBeenCalled();
    expect(props.onSuccess).toHaveBeenCalledTimes(outcome === 'success' ? 1 : 0);
});

test.each(['season', 'type'])('changing %s invalidates pending supplemental reads', async (change) => {
    const bowl = deferred();
    getBowl.mockReturnValueOnce(bowl.promise);
    const { result, rerender } = renderHook(useAddGameDialog, { initialProps: props });
    open(result);
    lookup(result, 'Bowl');
    if (change === 'season') {
        rerender({ ...props, season: 13 });
    } else {
        act(() => result.current.setAddGameType('PLAYOFFS'));
    }
    await act(async () => bowl.resolve({ last_venue: 'Obsolete Venue', logo: 'obsolete.png' }));
    expect(result.current.addGameVenue).toBe('');
    expect(result.current.addGameLogo).toBeNull();
});

test('a completed dismissed creation refreshes through the current callback without clearing new fields', async () => {
    const pending = deferred();
    const refreshCurrentView = jest.fn();
    createScheduleEntry.mockReturnValueOnce(pending.promise);
    const { result, rerender } = renderHook(useAddGameDialog, { initialProps: props });
    open(result, 'CONFERENCE_GAME');
    act(() => {
        result.current.handleHomeChange({ name: 'Home' });
        result.current.handleAwayChange({ name: 'Away' });
    });
    let completion;
    act(() => {
        completion = result.current.handleAddGame();
    });
    reopen(result, 'BOWL');
    act(() => result.current.setAddGameBowlName('New Bowl'));
    rerender({ ...props, onSuccess: refreshCurrentView });
    await act(async () => {
        pending.resolve({});
        await completion;
    });
    expect(refreshCurrentView).toHaveBeenCalledTimes(1);
    expect(props.onSuccess).not.toHaveBeenCalled();
    expect(result.current.addGameBowlName).toBe('New Bowl');
    expect(createScheduleEntry).toHaveBeenCalledTimes(1);
});

test.each(['unmount', 'season change'])(
    'creation completion after %s cannot refresh another context',
    async (change) => {
        const pending = deferred();
        createScheduleEntry.mockReturnValueOnce(pending.promise);
        const { result, rerender, unmount } = renderHook(useAddGameDialog, { initialProps: props });
        open(result, 'CONFERENCE_GAME');
        act(() => {
            result.current.handleHomeChange({ name: 'Home' });
            result.current.handleAwayChange({ name: 'Away' });
        });
        let completion;
        act(() => {
            completion = result.current.handleAddGame();
        });
        if (change === 'unmount') {
            unmount();
        } else {
            rerender({ ...props, season: 13 });
        }
        await act(async () => {
            pending.resolve({});
            await completion;
        });
        expect(props.showSnackbar).not.toHaveBeenCalled();
        expect(props.onSuccess).not.toHaveBeenCalled();
    }
);
