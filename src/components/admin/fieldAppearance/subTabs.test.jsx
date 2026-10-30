/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import FieldSettingsEditor from './FieldSettingsEditor';
jest.mock('../../team/appearance/FontControl', () => ({ __esModule: true, default: () => null }));
jest.mock('../../../api/fieldAppearanceApi', () => ({ renderPostseasonPreview: jest.fn() }));
jest.mock('../../../api/uploadApi', () => ({ uploadLogo: jest.fn() }));
jest.mock('../../../utils/logoUrl', () => ({ resolveLogoUrl: (logo) => logo }));
jest.mock('../../ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));

const sections = [
    { title: 'Field', fields: [{ key: 'turf_color_text', label: 'Turf', type: 'text' }] },
    { title: 'Wall', fields: [{ key: 'wall_text', label: 'Wall text', type: 'text' }] },
];

test('each settings card is its own sub-tab and saving from one keeps the others', async () => {
    const onSave = jest.fn(async (payload) => payload);
    render(
        <FieldSettingsEditor
            title="Bowl"
            sections={sections}
            source={{ turf_color_text: 'green', wall_text: 'ROSE BOWL' }}
            onSave={onSave}
        />
    );

    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    fireEvent.click(screen.getByRole('tab', { name: 'Wall' }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'GRANDADDY' } });
    await act(async () => fireEvent.click(screen.getByText('Save')));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ turf_color_text: 'green', wall_text: 'GRANDADDY' }));
});
