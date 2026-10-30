/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ConferencePill from './ConferencePill';

jest.mock('./ConferenceMark', () => ({
    __esModule: true,
    default: ({ conference }) => <img alt={`${conference} logo`} />,
}));

const options = [
    { value: 'ALL', label: 'All conferences' },
    { value: 'MW', label: 'Mountain West' },
    { value: 'BIG_SKY', label: 'Big Sky' },
];

test('conference choices show their logos and report the picked code', async () => {
    const onChange = jest.fn();
    render(<ConferencePill value="MW" onChange={onChange} options={options} />);
    expect(screen.getByAltText('MW logo')).toBeTruthy();
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Conference' }));
    expect(screen.queryByAltText('ALL logo')).toBeNull();
    fireEvent.click(await screen.findByRole('option', { name: /Big Sky/ }));
    expect(onChange).toHaveBeenCalledWith('BIG_SKY');
});
