import { fireEvent, screen } from '@testing-library/react';

export const pickTeam = async (label, name) => {
    fireEvent.mouseDown(screen.getByLabelText(label));
    fireEvent.click(await screen.findByRole('option', { name }));
};
