import { similarStadiums } from './similarStadiums';

const stadiums = ['Mosaic Stadium', 'Mercedes-Benz Stadium', 'War Memorial Stadium', 'Citi Field', 'Aviva Stadium'].map(
    (name) => ({ name })
);
const names = (typed) => similarStadiums(typed, stadiums).map((stadium) => stadium.name);

test('a name with the location tacked on still finds the existing stadium', () => {
    expect(names('Mosaic Stadium, Regina Saskatchewan')).toEqual(['Mosaic Stadium']);
    expect(names('Citi Field New York')).toEqual(['Citi Field']);
});

test('spelling and punctuation differences still match', () => {
    expect(names('mercedes benz')).toEqual(['Mercedes-Benz Stadium']);
});

test('generic words alone do not count as a match', () => {
    expect(names('Stadium Field')).toEqual([]);
    expect(names('Allegiant Stadium')).toEqual([]);
});

test('an exact existing name needs no suggestion', () => {
    expect(names('Aviva Stadium')).toEqual([]);
});
