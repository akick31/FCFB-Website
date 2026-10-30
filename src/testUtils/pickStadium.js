import { fireEvent, screen } from '@testing-library/react';

const escaped = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const openStadiumPicker = (label) => {
    const input = screen.getByLabelText(label);
    fireEvent.mouseDown(input);
    return input;
};

export const stadiumOptionNames = (label) => {
    openStadiumPicker(label);
    return screen.queryAllByRole('option').map((option) => option.textContent);
};

export const pickStadium = async (label, name) => {
    openStadiumPicker(label);
    fireEvent.click(await screen.findByRole('option', { name: new RegExp(`^${escaped(name)}`) }));
};
