/** @jest-environment jsdom */
import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import SettingsPanel from './SettingsPanel';

const sections = [
    {
        title: 'Left end',
        firstGroup: 'Backdrop',
        fields: [
            { key: 'backdrop', label: 'Backdrop', type: 'text' },
            {
                key: 'size',
                label: 'Stadium size',
                type: 'text',
                help: 'How tall the stands are.',
                disabledIf: (f) => f.backdrop === 'NONE',
                disabledHelp: () => 'Open sky has no stands.',
            },
            { key: 'style', label: 'Style', type: 'text', showIf: (f) => f.backdrop === 'CAMPUS' },
            { key: 'scoreboard_heading', label: 'Scoreboard', type: 'subheading' },
            { key: 'jumbotron', label: 'Jumbotron', type: 'text' },
        ],
    },
    { title: 'Right end', fields: [{ key: 'right_backdrop', label: 'Right backdrop', type: 'text' }] },
];

const Host = ({ initial = {} }) => {
    const [form, setForm] = useState({
        backdrop: '',
        size: '',
        style: '',
        jumbotron: '',
        right_backdrop: '',
        ...initial,
    });
    return (
        <form>
            <SettingsPanel
                sections={sections}
                form={form}
                canEdit
                renderControl={(definition) => (
                    <input
                        aria-label={definition.label}
                        value={form[definition.key]}
                        onChange={(event) =>
                            setForm((current) => ({ ...current, [definition.key]: event.target.value }))
                        }
                    />
                )}
            />
        </form>
    );
};

const fieldOrder = () => [...document.querySelectorAll('[data-field]')].map((node) => node.dataset.field);

test('each group is its own chip and only its controls are shown', () => {
    render(<Host />);
    expect(screen.getByRole('tab', { name: 'Backdrop' })).toBeTruthy();
    expect(fieldOrder()).toEqual(['backdrop', 'size']);
    fireEvent.click(screen.getByRole('tab', { name: 'Scoreboard' }));
    expect(fieldOrder()).toEqual(['jumbotron']);
    fireEvent.click(screen.getByRole('tab', { name: 'Right end' }));
    expect(fieldOrder()).toEqual(['right_backdrop']);
});

test('new options appear after the existing ones without moving them', () => {
    render(<Host />);
    fireEvent.change(screen.getByLabelText('Backdrop'), { target: { value: 'CAMPUS' } });
    expect(fieldOrder()).toEqual(['backdrop', 'size', 'style']);
});

test('an unavailable control keeps its place, is disabled and explains why in its tooltip', () => {
    render(<Host initial={{ backdrop: 'NONE' }} />);
    expect(fieldOrder()).toEqual(['backdrop', 'size']);
    expect(screen.getByLabelText('Stadium size').closest('fieldset').disabled).toBe(true);
    expect(screen.getByText('(unavailable)')).toBeTruthy();
    expect(screen.getByRole('note', { name: 'Stadium size: Open sky has no stands.' })).toBeTruthy();
});

test('save lives in the toolbar', () => {
    render(<Host />);
    expect(screen.getByRole('button', { name: 'Save' }).getAttribute('type')).toBe('submit');
});
