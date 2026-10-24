import { BOWL_SECTIONS, bowlSectionsWithStadiums } from './fieldDefinitions';

test('the bowl editor leads with a stadium picker listing every team', () => {
    const sections = bowlSectionsWithStadiums(['New Mexico', 'Wyoming']);
    const picker = sections[0].fields[0];
    expect(picker.key).toBe('stadium_team');
    expect(picker.options.map((option) => option.value)).toEqual(['', 'New Mexico', 'Wyoming']);
    expect(sections.slice(1)).toEqual(BOWL_SECTIONS);
});
