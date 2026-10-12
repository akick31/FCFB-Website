/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import TeamUniformThumb from './TeamUniformThumb';

jest.mock('../../api/teamAppearanceApi', () => ({
    getTeamAppearanceThumbUrl: (team, view) => `/thumb?team=${team}&view=${view}`,
}));

test('pending lazy thumbnails retain a layout box while the existing spinner is visible', () => {
    render(<TeamUniformThumb team="Test" view="HELMET" height={88} />);
    const image = screen.getByAltText('Test helmet');
    const style = getComputedStyle(image);
    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.getAttribute('decoding')).toBe('async');
    expect(style.display).toBe('block');
    expect(style.width).toBe('100%');
    expect(style.height).toBe('100%');
    expect(style.opacity).toBe('0');
    expect(screen.getByRole('progressbar')).toBeTruthy();
});

test('loaded thumbnails retain intrinsic sizing and dismiss the spinner', () => {
    render(<TeamUniformThumb team="Test" view="HELMET" height={88} />);
    const image = screen.getByAltText('Test helmet');
    fireEvent.load(image);
    const style = getComputedStyle(image);
    expect(style.position).toBe('static');
    expect(style.width).toBe('auto');
    expect(style.height).toBe('auto');
    expect(style.opacity).toBe('1');
    expect(style.objectFit).toBe('contain');
    expect(screen.queryByRole('progressbar')).toBeNull();
});

test('failed thumbnails keep the existing fallback and stop the spinner', () => {
    render(<TeamUniformThumb team="Test" view="HELMET" />);
    fireEvent.error(screen.getByAltText('Test helmet'));
    expect(screen.getByText('No preview')).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByAltText('Test helmet')).toBeNull();
});
