import { shownTab, tabNames, tabOf } from './settingsTabs';
import { UNIFORM_SECTIONS } from '../components/team/appearance/appearanceSections';

test('cards can share a sub-tab, so the secondary helmet sits under Helmet', () => {
    expect(tabNames(UNIFORM_SECTIONS)).toEqual(['Helmet', 'Jersey']);
    expect(UNIFORM_SECTIONS.filter((section) => tabOf(section) === 'Helmet').map((section) => section.title)).toEqual([
        'Helmet',
        'Secondary helmet',
    ]);
});

test('an unknown requested tab falls back to the first one', () => {
    expect(shownTab(UNIFORM_SECTIONS, 'Missing')).toBe('Helmet');
});
