/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import EventStadiumTab from './EventStadiumTab';
import { assignEventStadium, getStadium, getStadiums } from '../../../api/stadiumApi';
import { pickStadium } from '../../../testUtils/pickStadium';
import { stadiumFixture } from '../../../testUtils/stadiumFixture';
jest.mock('../../../api/stadiumApi', () => ({
    getStadiums: jest.fn(),
    getStadium: jest.fn(),
    assignEventStadium: jest.fn(),
}));
jest.mock('../../stadium/StadiumPreview', () => ({
    __esModule: true,
    default: ({ title }) => <div>Preview: {title}</div>,
}));
jest.mock('../../stadium/StadiumEditDialog', () => ({
    __esModule: true,
    default: ({ stadium, onClose }) => (
        <div>
            Editing {stadium.name}
            <button type="button" onClick={onClose}>
                Done editing
            </button>
        </div>
    ),
}));
jest.mock('../../stadium/StadiumCreateDialog', () => ({
    __esModule: true,
    default: ({ open, onClose }) =>
        open ? (
            <div>
                <button type="button" onClick={() => onClose('Allegiant Stadium')}>
                    Done designing Allegiant
                </button>
                <button type="button" onClick={() => onClose(null)}>
                    Cancel creating
                </button>
            </div>
        ) : null,
}));

beforeEach(() => {
    getStadiums.mockResolvedValue([stadiumFixture('Rose Bowl'), stadiumFixture('Mercedes-Benz Stadium')]);
    assignEventStadium.mockReset();
    assignEventStadium.mockImplementation(async ({ venue }) => venue);
});

test('picking another stadium previews it and saves only when asked', async () => {
    const onChanged = jest.fn();
    render(<EventStadiumTab category="BOWL" eventKey="Rose Bowl Game" venue="Rose Bowl" onChanged={onChanged} />);
    await act(async () => {});
    expect(screen.getByText('Preview: Rose Bowl')).toBeTruthy();

    await pickStadium('Stadium', 'Mercedes-Benz Stadium');
    expect(screen.getByText('Preview: Mercedes-Benz Stadium')).toBeTruthy();
    expect(assignEventStadium).not.toHaveBeenCalled();

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Use this stadium' })));
    expect(assignEventStadium).toHaveBeenCalledWith({
        category: 'BOWL',
        key: 'Rose Bowl Game',
        venue: 'Mercedes-Benz Stadium',
    });
    expect(onChanged).toHaveBeenCalledWith('Mercedes-Benz Stadium');
});

test('the chosen stadium can be edited without leaving the postseason page', async () => {
    getStadium.mockResolvedValue(stadiumFixture('Rose Bowl'));
    render(<EventStadiumTab category="BOWL" eventKey="Rose Bowl Game" venue="Rose Bowl" onChanged={() => {}} />);
    await act(async () => {});
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Edit stadium' })));
    expect(screen.getByText('Editing Rose Bowl')).toBeTruthy();
    fireEvent.click(screen.getByText('Done editing'));
    expect(screen.queryByText('Editing Rose Bowl')).toBeNull();
});

test('a newly created stadium is designed first and assigned to this game when done', async () => {
    const onChanged = jest.fn();
    render(<EventStadiumTab category="CCG" eventKey="SEC" venue={undefined} onChanged={onChanged} />);
    await act(async () => {});
    expect(screen.queryByRole('button', { name: 'Edit stadium' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Create stadium' }));
    await act(async () => fireEvent.click(screen.getByText('Done designing Allegiant')));

    expect(assignEventStadium).toHaveBeenCalledWith({ category: 'CCG', key: 'SEC', venue: 'Allegiant Stadium' });
    expect(onChanged).toHaveBeenCalledWith('Allegiant Stadium');
    expect(screen.getByText('Preview: Allegiant Stadium')).toBeTruthy();
});

test('cancelling the stadium creator assigns nothing', async () => {
    render(<EventStadiumTab category="CCG" eventKey="SEC" venue={undefined} onChanged={() => {}} />);
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: 'Create stadium' }));
    await act(async () => fireEvent.click(screen.getByText('Cancel creating')));
    expect(assignEventStadium).not.toHaveBeenCalled();
});
