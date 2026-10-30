/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import EventPicker from './EventPicker';

test('events can be found by typing part of the name', () => {
    const onSelect = jest.fn();
    render(
        <EventPicker
            items={[
                { id: 'Rose Bowl Game', label: 'Rose Bowl Game' },
                { id: 'Sugar Bowl', label: 'Sugar Bowl' },
            ]}
            selectedId="Rose Bowl Game"
            onSelect={onSelect}
            label="Bowl"
        />
    );
    const input = screen.getByLabelText('Bowl');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'sug' } });
    fireEvent.click(screen.getByRole('option', { name: 'Sugar Bowl' }));
    expect(onSelect).toHaveBeenCalledWith('Sugar Bowl');
});
