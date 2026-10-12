/** @jest-environment jsdom */
import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import AppearanceEditor from './AppearanceEditor';
import ColorsEditor from './ColorsEditor';
import LogosEditor from './LogosEditor';

jest.mock('./LivePreview', () => ({ __esModule: true, default: () => null }));
jest.mock('./useAppearancePreview', () => ({ useAppearancePreview: () => ({ loading: false }) }));
jest.mock('./AppearanceControl', () => ({
    __esModule: true,
    default: ({ definition, value, onChange }) => (
        <input aria-label={definition.label} value={value} onChange={(e) => onChange(e.target.value)} />
    ),
}));
jest.mock('../../admin/LogoUrlField', () => ({
    __esModule: true,
    default: ({ label, value, onChange }) => <input aria-label={label} value={value} onChange={onChange} />,
}));
jest.mock('../../ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
const sections = [{ title: 'Settings', fields: [{ key: 'wall_text', label: 'Wall text', type: 'text' }] }];
const editors = [
    [
        'appearance',
        AppearanceEditor,
        { sections, half: 'field', canEdit: true },
        { wall_text: 'original' },
        'Wall text',
        'wall_text',
    ],
    [
        'colors',
        ColorsEditor,
        { isAdmin: true, canEditTertiary: true },
        { primary_color: '#111111', secondary_color: '#222222', tertiary_color: '#333333' },
        null,
        'primary_color',
    ],
    ['logos', LogosEditor, { canEdit: true }, { logo: 'original' }, 'Primary logo', 'logo'],
];
const editInput = (label) => (label ? screen.getByRole('textbox', { name: label }) : screen.getAllByRole('textbox')[0]);
const Host = ({ Editor, props, initialSource, write, dirty }) => {
    const [source, setSource] = useState(initialSource);
    return (
        <Editor
            {...props}
            team="A"
            source={source}
            onDirtyChange={dirty}
            onSave={async (payload) => {
                const saved = await write(payload);
                setSource(saved);
                return saved;
            }}
        />
    );
};

test.each(editors)(
    '%s preserves a newer edit and dirty status when an older save succeeds',
    async (name, Editor, props, source, label, key) => {
        let finish;
        const write = jest.fn(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                })
        );
        const dirty = jest.fn();
        render(<Host Editor={Editor} props={props} initialSource={source} write={write} dirty={dirty} />);
        fireEvent.change(editInput(label), { target: { value: 'submitted' } });
        fireEvent.submit(editInput(label).closest('form'));
        fireEvent.change(editInput(label), { target: { value: 'newer' } });
        await act(async () => finish({ ...source, [key]: 'submitted' }));
        expect(editInput(label).value).toBe('newer');
        expect(screen.queryByText('Saved')).toBeNull();
        expect(dirty).toHaveBeenLastCalledWith(true);
        expect(write.mock.calls[0][0][key]).toBe('submitted');
    }
);

test.each(editors)(
    '%s accepts saved normalization when there is no newer edit',
    async (name, Editor, props, source, label, key) => {
        const write = jest.fn().mockResolvedValue({ ...source, [key]: 'normalized' });
        const dirty = jest.fn();
        render(<Host Editor={Editor} props={props} initialSource={source} write={write} dirty={dirty} />);
        fireEvent.change(editInput(label), { target: { value: 'submitted' } });
        await act(async () => fireEvent.submit(editInput(label).closest('form')));
        expect(editInput(label).value).toBe('normalized');
        expect(screen.getByText('Saved')).toBeTruthy();
        expect(dirty).toHaveBeenLastCalledWith(false);
    }
);

test('refreshing inherited colors preserves edited fields and updates untouched defaults', () => {
    const colorSections = [
        {
            title: 'Settings',
            fields: [
                { key: 'wall_text', label: 'Wall text', type: 'text' },
                { key: 'field_color', label: 'Field color', type: 'color', defaultColor: 'primary' },
            ],
        },
    ];
    const source = { wall_text: 'original' };
    const dirty = jest.fn();
    const props = {
        team: 'A',
        half: 'field',
        sections: colorSections,
        source,
        canEdit: true,
        onSave: jest.fn(),
        onDirtyChange: dirty,
    };
    const { rerender } = render(<AppearanceEditor {...props} teamColors={{ primary_color: '#111111' }} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Wall text' }), { target: { value: 'draft' } });
    rerender(<AppearanceEditor {...props} teamColors={{ primary_color: '#222222' }} />);
    expect(screen.getByRole('textbox', { name: 'Wall text' }).value).toBe('draft');
    expect(screen.getByRole('textbox', { name: 'Field color' }).value).toBe('#222222');
    expect(dirty).toHaveBeenLastCalledWith(true);
});

test.each(editors)('%s retains newer edits after a rejected save', async (name, Editor, props, source, label) => {
    let reject;
    const write = jest.fn(
        () =>
            new Promise((resolve, fail) => {
                reject = fail;
            })
    );
    const dirty = jest.fn();
    render(<Host Editor={Editor} props={props} initialSource={source} write={write} dirty={dirty} />);
    fireEvent.change(editInput(label), { target: { value: 'submitted' } });
    fireEvent.submit(editInput(label).closest('form'));
    fireEvent.change(editInput(label), { target: { value: 'newer' } });
    await act(async () => reject(new Error('save unavailable')));
    expect(editInput(label).value).toBe('newer');
    expect(screen.getByText('save unavailable')).toBeTruthy();
    expect(screen.queryByText('Saved')).toBeNull();
    expect(dirty).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole('button', { name: /^Save/ }).disabled).toBe(false);
});

test('a tertiary-only color save still excludes primary and secondary', async () => {
    const source = { primary_color: '#111111', secondary_color: '#222222', tertiary_color: '#333333' };
    const write = jest.fn().mockResolvedValue(source);
    render(
        <Host
            Editor={ColorsEditor}
            props={{ isAdmin: false, canEditTertiary: true }}
            initialSource={source}
            write={write}
        />
    );
    fireEvent.change(screen.getAllByRole('textbox')[2], { target: { value: '#444444' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Save colors' })));
    expect(write).toHaveBeenCalledWith({ tertiary_color: '#444444' });
});

test('empty logos retain the existing null payload mapping', async () => {
    const write = jest.fn().mockResolvedValue({});
    render(<Host Editor={LogosEditor} props={{ canEdit: true }} initialSource={{}} write={write} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Save logos' })));
    expect(write).toHaveBeenCalledWith({ logo: null, logo_dark: null, secondary_logo: null });
});

test('copying settings during a save preserves the newer copied values', async () => {
    const copySections = [
        {
            title: 'Settings',
            copyMap: { secondary: 'primary' },
            fields: [
                { key: 'primary', label: 'Primary', type: 'text' },
                { key: 'secondary', label: 'Secondary', type: 'text' },
            ],
        },
    ];
    let finish;
    const write = jest.fn(
        () =>
            new Promise((resolve) => {
                finish = resolve;
            })
    );
    render(
        <Host
            Editor={AppearanceEditor}
            props={{ sections: copySections, half: 'uniform', canEdit: true }}
            initialSource={{ primary: 'A', secondary: 'B' }}
            write={write}
        />
    );
    fireEvent.submit(screen.getByRole('textbox', { name: 'Primary' }).closest('form'));
    fireEvent.click(screen.getByText('Copy from primary'));
    await act(async () => finish({ primary: 'A', secondary: 'B' }));
    expect(screen.getByRole('textbox', { name: 'Secondary' }).value).toBe('A');
    expect(screen.queryByText('Saved')).toBeNull();
});

test('save completion after unmount does not report the draft as clean', async () => {
    let finish;
    const write = jest.fn(
        () =>
            new Promise((resolve) => {
                finish = resolve;
            })
    );
    const dirty = jest.fn();
    const { unmount } = render(
        <Host
            Editor={LogosEditor}
            props={{ canEdit: true }}
            initialSource={{ logo: 'old' }}
            write={write}
            dirty={dirty}
        />
    );
    fireEvent.change(screen.getByRole('textbox', { name: 'Primary logo' }), { target: { value: 'submitted' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save logos' }));
    unmount();
    dirty.mockClear();
    await act(async () => finish({ logo: 'submitted' }));
    expect(dirty).not.toHaveBeenCalled();
});
