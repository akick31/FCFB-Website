import { groupsOf, layoutFields } from './settingsLayout';
import {
    STADIUM_SECTIONS,
    TEAM_FIELD_SECTIONS,
    UNIFORM_SECTIONS,
    isVisible,
} from '../../team/appearance/appearanceSections';
import {
    BOWL_SECTIONS,
    CCG_SECTIONS,
    NC_SECTIONS,
    PLAYOFF_SECTIONS,
} from '../../admin/fieldAppearance/fieldDefinitions';

const keysIn = (section, groupKey, form) => layoutFields(section, groupKey, isVisible, form).map((field) => field.key);

const forms = [
    { stadium_backdrop: 'CROWD', stadium_size: 1 },
    { stadium_backdrop: 'CROWD', stadium_size: 0.6, jumbotron_enabled: true },
    { stadium_backdrop: 'CAMPUS', backdrop_style: 'CAMPUS_GOTHIC', jumbotron_enabled: true, jumbotron_shape: 'ARCHED' },
    { stadium_backdrop: 'FACILITY', backdrop_style: 'FACILITY_NARROW_GEORGIAN', jumbotron_enabled: true },
    { stadium_backdrop: 'HILL' },
    { stadium_backdrop: 'NONE' },
];

const everySection = [
    ...STADIUM_SECTIONS,
    ...TEAM_FIELD_SECTIONS,
    ...UNIFORM_SECTIONS,
    ...BOWL_SECTIONS,
    ...CCG_SECTIONS,
    ...PLAYOFF_SECTIONS,
    ...NC_SECTIONS,
].map((section, index) => ({ ...section, title: `${section.title} (${index})` }));

test.each(everySection.map((section) => [section.title, section]))(
    'in %s, controls that are always there keep their place as options come and go',
    (title, section) => {
        groupsOf(section).groups.forEach((group) => {
            const layouts = forms.map((form) => keysIn(section, group.key, form));
            const stablePrefix = layouts[0].filter((key) => layouts.every((layout) => layout.includes(key)));
            layouts.forEach((layout) => expect(layout.slice(0, stablePrefix.length)).toEqual(stablePrefix));
        });
    }
);

test('stadium ends split into a backdrop group and a scoreboard group', () => {
    const left = STADIUM_SECTIONS.find((section) => section.title === 'Left end');
    expect(groupsOf(left).groups.map((group) => group.label)).toEqual(['Backdrop', 'Scoreboard']);
    expect(keysIn(left, '_lead', forms[0]).slice(0, 4)).toEqual([
        'stadium_backdrop',
        'stadium_size',
        'skyline_backdrop',
        'wall_enabled',
    ]);
    expect(keysIn(left, 'scoreboard_heading', forms[0])[0]).toBe('jumbotron_enabled');
});

test('fields before a section’s first subheading are shared by every group', () => {
    const jersey = UNIFORM_SECTIONS.find((section) => section.title === 'Jersey');
    const { shared, groups } = groupsOf(jersey);
    expect(shared.map((field) => field.key)).toEqual(['jersey_number_font']);
    groups.forEach((group) => expect(keysIn(jersey, group.key, {})[0]).toBe('jersey_number_font'));
});
