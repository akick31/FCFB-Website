/** @jest-environment jsdom */
import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import FieldSettingsEditor from './FieldSettingsEditor';
import BowlMetaEditor from './BowlMetaEditor';
import { updateBowlMeta } from '../../../api/fieldAppearanceApi';
jest.mock('../../team/appearance/FontControl', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../api/fieldAppearanceApi', () => ({ updateBowlMeta: jest.fn(), renderPostseasonPreview: jest.fn() }));
jest.mock('../../ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../LogoUrlField', () => ({
    __esModule: true,
    default: ({ value, onChange }) => <input aria-label="Logo" value={value} onChange={onChange} />,
}));
const sections = [{ title: 'Settings', fields: [{ key: 'wall_text', label: 'Wall text', type: 'text' }] }];
const FieldHost = ({ write }) => {
    const [source, setSource] = useState({ wall_text: 'original' });
    return (
        <FieldSettingsEditor
            title="Field"
            sections={sections}
            source={source}
            onSave={async (payload) => {
                const persisted = await write(payload);
                setSource(persisted);
                return persisted;
            }}
        />
    );
};

test('postseason save preserves edits made after submission', async () => {
    let finish;
    const write = jest.fn(
        () =>
            new Promise((resolve) => {
                finish = resolve;
            })
    );
    render(<FieldHost write={write} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'submitted' } });
    fireEvent.click(screen.getByText('Save'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'newer' } });
    await act(async () => finish({ wall_text: 'submitted' }));
    expect(screen.getByRole('textbox').value).toBe('newer');
    expect(screen.queryByText('Saved')).toBeNull();
    expect(write).toHaveBeenCalledWith({ wall_text: 'submitted' });
});

test('postseason save accepts normalization without newer edits', async () => {
    render(<FieldHost write={jest.fn().mockResolvedValue({ wall_text: 'normalized' })} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'submitted' } });
    await act(async () => fireEvent.click(screen.getByText('Save')));
    expect(screen.getByRole('textbox').value).toBe('normalized');
    expect(screen.getByText('Saved')).toBeTruthy();
});

test('postseason failed save retains the newer draft and existing error feedback', async () => {
    let reject;
    render(
        <FieldHost
            write={() =>
                new Promise((resolve, fail) => {
                    reject = fail;
                })
            }
        />
    );
    fireEvent.click(screen.getByText('Save'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'newer' } });
    await act(async () => reject(new Error('save unavailable')));
    expect(screen.getByRole('textbox').value).toBe('newer');
    expect(screen.getByText('save unavailable')).toBeTruthy();
    expect(screen.getByText('Save').disabled).toBe(false);
});

beforeEach(() => {
    updateBowlMeta.mockReset();
});

test('an older bowl rename cannot publish or redirect the current bowl', async () => {
    let finish;
    updateBowlMeta.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    const onSaved = jest.fn();
    const { rerender } = render(<BowlMetaEditor bowl="Alpha" onSaved={onSaved} />);
    fireEvent.click(screen.getByText('Save bowl details'));
    rerender(<BowlMetaEditor bowl="Beta" onSaved={onSaved} />);
    await act(async () => finish({ bowl: 'Renamed' }));
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.getAllByRole('textbox')[0].value).toBe('Beta');
    expect(screen.queryByText('Saved')).toBeNull();
    expect(screen.getByText('Save bowl details').disabled).toBe(false);
});

test('a bowl metadata failure after unmount does not report completion', async () => {
    let reject;
    updateBowlMeta.mockReturnValueOnce(
        new Promise((resolve, fail) => {
            reject = fail;
        })
    );
    const onSaved = jest.fn();
    const { unmount } = render(<BowlMetaEditor bowl="Alpha" onSaved={onSaved} />);
    fireEvent.click(screen.getByText('Save bowl details'));
    unmount();
    await act(async () => reject(new Error('obsolete')));
    expect(onSaved).not.toHaveBeenCalled();
});

test('current bowl metadata writes preserve trimming and blank-logo semantics', async () => {
    updateBowlMeta.mockResolvedValueOnce({ bowl: 'Renamed' });
    const onSaved = jest.fn();
    render(<BowlMetaEditor bowl="Alpha" onSaved={onSaved} />);
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: ' Renamed ' } });
    await act(async () => fireEvent.click(screen.getByText('Save bowl details')));
    expect(updateBowlMeta).toHaveBeenCalledWith('Alpha', { name: 'Renamed', logo: null });
    expect(onSaved).toHaveBeenCalledWith('Renamed');
    expect(screen.getByText('Saved')).toBeTruthy();
});

test('an old metadata failure cannot finish the new bowl’s pending save', async () => {
    let reject;
    updateBowlMeta
        .mockReturnValueOnce(
            new Promise((resolve, fail) => {
                reject = fail;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    const onSaved = jest.fn();
    const { rerender } = render(<BowlMetaEditor bowl="Alpha" onSaved={onSaved} />);
    fireEvent.click(screen.getByText('Save bowl details'));
    rerender(<BowlMetaEditor bowl="Beta" onSaved={onSaved} />);
    fireEvent.click(screen.getByText('Save bowl details'));
    await act(async () => reject(new Error('obsolete')));
    expect(screen.getByText('Saving...').disabled).toBe(true);
    expect(screen.queryByText('obsolete')).toBeNull();
});

test.each([
    ['name', 'Later name', { name: 'Later name', logo: '' }],
    ['logo', 'later.png', { name: 'Renamed', logo: 'later.png' }],
])('a pending rename transfers the newer %s draft', async (field, value, draft) => {
    let finish;
    updateBowlMeta.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    const onSaved = jest.fn();
    render(<BowlMetaEditor bowl="Alpha" onSaved={onSaved} />);
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Renamed' } });
    fireEvent.change(screen.getByLabelText('Logo'), { target: { value: 'submitted.png' } });
    fireEvent.click(screen.getByText('Save bowl details'));
    fireEvent.change(field === 'name' ? screen.getAllByRole('textbox')[0] : screen.getByLabelText('Logo'), {
        target: { value },
    });
    await act(async () => finish({ bowl: 'Renamed' }));
    expect(onSaved).toHaveBeenCalledWith('Renamed', draft);
    expect(screen.queryByText('Saved')).toBeNull();
    expect(updateBowlMeta).toHaveBeenCalledWith('Alpha', { name: 'Renamed', logo: 'submitted.png' });
});

test('transferred metadata drafts are used on the renamed bowl', async () => {
    updateBowlMeta.mockResolvedValueOnce({ bowl: 'Later name' });
    render(
        <BowlMetaEditor bowl="Renamed" initialDraft={{ name: 'Later name', logo: 'later.png' }} onSaved={jest.fn()} />
    );
    expect(screen.getAllByRole('textbox')[0].value).toBe('Later name');
    expect(screen.getByLabelText('Logo').value).toBe('later.png');
    await act(async () => fireEvent.click(screen.getByText('Save bowl details')));
    expect(updateBowlMeta).toHaveBeenCalledWith('Renamed', { name: 'Later name', logo: 'later.png' });
});
