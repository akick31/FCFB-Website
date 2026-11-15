/** @jest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import DriveFieldChart from './DriveFieldChart';

jest.mock('../../../hooks/useGameField', () => ({
    useGameField: () => ({ url: 'blob:field', width: 1000, height: 440, margin: 80 }),
}));

const play = { play_id: 1, ball_location: 25, yards: 10, down: 1, yards_to_go: 10, clock: 600 };
const drive = (possession) => ({ possession, outcome: 'Punt', plays: [play] });
const marks = {
    homeMark: { name: 'Wyoming', primaryColor: '#492f24', secondaryColor: '#ffc425' },
    awayMark: { name: 'Utah', primaryColor: '#c8102e', secondaryColor: '#ffffff' },
};

const renderChart = (possession) => render(<DriveFieldChart drive={drive(possession)} gameId={7} {...marks} />);

test('the rendered game field is the chart background', () => {
    const { container } = renderChart('HOME');
    expect(container.querySelector('image').getAttribute('href')).toBe('blob:field');
});

test('the drive bar uses the offense color that stands out on the turf', () => {
    expect(renderChart('HOME').container.querySelector('rect[rx]').getAttribute('fill')).toBe('#ffc425');
    expect(renderChart('AWAY').container.querySelector('rect[rx]').getAttribute('fill')).toBe('#ffffff');
});

test('an away drive runs toward the left end zone', () => {
    const barX = (possession) => Number(renderChart(possession).container.querySelector('rect[rx]').getAttribute('x'));
    expect(barX('AWAY')).toBeGreaterThan(barX('HOME'));
});
