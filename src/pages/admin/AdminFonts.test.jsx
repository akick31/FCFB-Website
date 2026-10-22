/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import AdminFonts from './AdminFonts';
import { addFont, deleteFont } from '../../api/fontApi';
import { useFonts, registerUploadedFont, removeFont } from '../../components/team/appearance/fontStore';

jest.mock('../../api/fontApi', () => ({ addFont: jest.fn(), deleteFont: jest.fn() }));
jest.mock('../../components/team/appearance/fontStore', () => ({
    useFonts: jest.fn(),
    registerUploadedFont: jest.fn(),
    removeFont: jest.fn(),
}));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/ui/DataTable', () => ({
    __esModule: true,
    default: ({ children }) => <table>{children}</table>,
}));

const builtIn = { value: 'CLASSIC', label: 'Classic' };
const custom = { value: 'CUSTOM_MY_FONT', label: 'My Font' };

beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    useFonts.mockReturnValue([builtIn, custom]);
});

test('lists fonts and only offers removal for custom ones', () => {
    render(<AdminFonts />);
    expect(screen.getByText('Classic')).toBeTruthy();
    expect(screen.getByText('My Font')).toBeTruthy();
    expect(screen.getAllByText('Remove')).toHaveLength(1);
});

test('adding a font registers it and shows a success message', async () => {
    addFont.mockResolvedValue({ value: 'CUSTOM_NEW', label: 'New Font' });
    render(<AdminFonts />);
    const [nameInput, urlInput] = screen.getAllByRole('textbox');
    fireEvent.change(nameInput, { target: { value: 'New Font' } });
    fireEvent.change(urlInput, { target: { value: 'https://example.com/font.ttf' } });
    fireEvent.click(screen.getByRole('checkbox'));
    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Add font/i }));
    });
    expect(addFont).toHaveBeenCalledWith('New Font', 'https://example.com/font.ttf', true);
    expect(registerUploadedFont).toHaveBeenCalledWith({ value: 'CUSTOM_NEW', label: 'New Font' });
    expect(screen.getByText(/Added "New Font"/)).toBeTruthy();
});

test('removing a custom font confirms, then deletes and evicts it from the store', async () => {
    deleteFont.mockResolvedValue();
    render(<AdminFonts />);
    await act(async () => {
        fireEvent.click(screen.getByText('Remove'));
    });
    expect(window.confirm).toHaveBeenCalled();
    expect(deleteFont).toHaveBeenCalledWith('CUSTOM_MY_FONT');
    expect(removeFont).toHaveBeenCalledWith('CUSTOM_MY_FONT');
});

test('declining the confirmation leaves the font untouched', async () => {
    window.confirm.mockReturnValue(false);
    render(<AdminFonts />);
    await act(async () => {
        fireEvent.click(screen.getByText('Remove'));
    });
    expect(deleteFont).not.toHaveBeenCalled();
});

test('a failed removal surfaces an error message', async () => {
    deleteFont.mockRejectedValue(new Error('Font is in use'));
    render(<AdminFonts />);
    await act(async () => {
        fireEvent.click(screen.getByText('Remove'));
    });
    expect(screen.getByText('Font is in use')).toBeTruthy();
});
