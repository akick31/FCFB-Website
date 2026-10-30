import {
    MATCH_LEFT,
    STADIUM_SECTIONS,
    TEAM_FIELD_SECTIONS,
    formFrom,
    isEnabled,
    isVisible,
    payloadFrom,
} from './appearanceSections';

const stadiumField = (key) => STADIUM_SECTIONS.flatMap((section) => section.fields).find((field) => field.key === key);

const visible = (key, form) => isVisible(stadiumField(key), form);

const available = (key, form) => visible(key, form) && isEnabled(stadiumField(key), form);

test('a full-size crowd cannot take a jumbotron but a smaller one can', () => {
    expect(available('jumbotron_enabled', { stadium_backdrop: 'CROWD', stadium_size: 1 })).toBe(false);
    expect(available('jumbotron_enabled', { stadium_backdrop: 'CROWD', stadium_size: 0.6 })).toBe(true);
    expect(available('jumbotron_enabled', {})).toBe(false);
});

test('city skyline and lake can take a jumbotron at any size', () => {
    expect(available('jumbotron_enabled', { stadium_backdrop: 'BUILDING', stadium_size: 1 })).toBe(true);
    expect(available('jumbotron_enabled', { stadium_backdrop: 'LAKE', stadium_size: 1 })).toBe(true);
});

test('the wall can only be removed from backdrops other than the crowd', () => {
    expect(available('wall_enabled', { stadium_backdrop: 'CROWD' })).toBe(false);
    expect(available('wall_enabled', { stadium_backdrop: 'FOREST' })).toBe(true);
});

test('the berm always has a scoreboard to size, without a separate jumbotron toggle', () => {
    expect(available('jumbotron_enabled', { stadium_backdrop: 'HILL' })).toBe(false);
    expect(visible('jumbotron_size', { stadium_backdrop: 'HILL' })).toBe(true);
    expect(visible('jumbotron_size', { stadium_backdrop: 'LAKE', jumbotron_enabled: false })).toBe(false);
    expect(visible('jumbotron_size', { stadium_backdrop: 'LAKE', jumbotron_enabled: true })).toBe(true);
});

test('the right side follows its own backdrop and falls back to the left one', () => {
    const form = { stadium_backdrop: 'CROWD', stadium_size: 1, right_stadium_backdrop: 'LAKE' };
    expect(available('jumbotron_enabled', form)).toBe(false);
    expect(available('right_jumbotron_enabled', form)).toBe(true);
    expect(available('right_wall_enabled', form)).toBe(true);
    expect(available('right_wall_enabled', { stadium_backdrop: 'CROWD' })).toBe(false);
});

test('each backdrop with styles offers only its own, and backdrops without styles hide the picker', () => {
    const style = stadiumField('backdrop_style');
    expect(style.optionsFor({ stadium_backdrop: 'CAMPUS' }).map((option) => option.value)).toEqual([
        'CAMPUS_GEORGIAN',
        'CAMPUS_GOTHIC',
        'CAMPUS_MISSION',
        'CAMPUS_MODERN',
        'CAMPUS_ATHLETIC',
        'CAMPUS_ADMIN',
        'CAMPUS_FIELDHOUSE',
    ]);
    expect(style.optionsFor({ stadium_backdrop: 'LAKE' }).every((option) => option.value.startsWith('LAKE_'))).toBe(
        true
    );
    expect(visible('backdrop_style', { stadium_backdrop: 'FOREST' })).toBe(false);
    expect(visible('backdrop_style', { stadium_backdrop: 'MOUNTAINS' })).toBe(true);
});

test('the right style picker only appears once the right side has its own backdrop', () => {
    expect(visible('right_backdrop_style', { stadium_backdrop: 'CAMPUS' })).toBe(false);
    expect(visible('right_backdrop_style', { stadium_backdrop: 'CAMPUS', right_stadium_backdrop: 'LAKE' })).toBe(true);
    expect(
        stadiumField('right_backdrop_style')
            .optionsFor({ stadium_backdrop: 'CAMPUS', right_stadium_backdrop: 'LAKE' })
            .map((option) => option.value)[0]
    ).toBe('LAKE_HILLS');
});

test('the scoreboard style picker follows the scoreboard', () => {
    expect(visible('jumbotron_style', { stadium_backdrop: 'HILL' })).toBe(true);
    expect(visible('jumbotron_style', { stadium_backdrop: 'LAKE', jumbotron_enabled: false })).toBe(false);
    expect(visible('jumbotron_style', { stadium_backdrop: 'LAKE', jumbotron_enabled: true })).toBe(true);
});

test('the board can be raised anywhere except flush on the crowd', () => {
    expect(visible('jumbotron_elevation', { stadium_backdrop: 'LAKE', jumbotron_enabled: true })).toBe(true);
    expect(visible('jumbotron_elevation', { stadium_backdrop: 'HILL' })).toBe(true);
    const crowd = { stadium_backdrop: 'CROWD', stadium_size: 0.6, jumbotron_enabled: true };
    expect(visible('jumbotron_elevation', crowd)).toBe(false);
    expect(visible('jumbotron_elevation', { ...crowd, jumbotron_pylon_mount: true })).toBe(true);
});

test('facility boards go on the full building face, or in front of or over the smaller buildings, never behind a wall', () => {
    const tower = { stadium_backdrop: 'FACILITY', backdrop_style: 'FACILITY_TOWER', jumbotron_enabled: true };
    const narrow = { stadium_backdrop: 'FACILITY', backdrop_style: 'FACILITY_NARROW_MODERN', jumbotron_enabled: true };
    const full = { stadium_backdrop: 'FACILITY', backdrop_style: 'FACILITY_BRICK', jumbotron_enabled: true };
    expect(available('jumbotron_enabled', { stadium_backdrop: 'FACILITY' })).toBe(true);
    expect(available('wall_enabled', full)).toBe(false);
    expect(available('wall_enabled', narrow)).toBe(false);
    expect(visible('jumbotron_pylon_style', full)).toBe(false);
    expect(visible('jumbotron_pylon_style', tower)).toBe(true);
    expect(visible('jumbotron_pylon_style', narrow)).toBe(true);
    expect(visible('jumbotron_over_building', tower)).toBe(true);
    expect(visible('jumbotron_over_building', full)).toBe(false);
    expect(visible('jumbotron_elevation', tower)).toBe(true);
    expect(visible('jumbotron_elevation', { ...tower, jumbotron_over_building: true })).toBe(false);
    expect(visible('jumbotron_width', narrow)).toBe(true);
    expect(visible('jumbotron_width', { ...narrow, jumbotron_over_building: true })).toBe(false);
    expect(visible('jumbotron_pylons_outside', narrow)).toBe(true);
    expect(visible('jumbotron_pylons_outside', { ...narrow, jumbotron_over_building: true })).toBe(false);
    expect(visible('jumbotron_width', full)).toBe(true);
    expect(visible('jumbotron_size', full)).toBe(true);
});

test('scenery behind the stadium appears wherever sky can show over the backdrop', () => {
    expect(available('skyline_backdrop', { stadium_backdrop: 'CROWD', stadium_size: 0.9 })).toBe(true);
    expect(available('skyline_backdrop', { stadium_backdrop: 'CROWD', stadium_size: 1 })).toBe(false);
    expect(available('skyline_backdrop', { stadium_backdrop: 'HILL' })).toBe(true);
    expect(available('skyline_backdrop', { stadium_backdrop: 'FOREST' })).toBe(true);
    expect(available('skyline_backdrop', { stadium_backdrop: 'FACILITY', backdrop_style: 'FACILITY_TOWER' })).toBe(
        true
    );
    expect(available('skyline_backdrop', { stadium_backdrop: 'FACILITY', backdrop_style: 'FACILITY_BRICK' })).toBe(
        false
    );
    expect(available('skyline_backdrop', { stadium_backdrop: 'NONE' })).toBe(false);
});

test('pylon designs only appear where the board stands on pylons', () => {
    const crowd = { stadium_backdrop: 'CROWD', stadium_size: 0.6, jumbotron_enabled: true };
    expect(visible('jumbotron_pylon_style', crowd)).toBe(false);
    expect(visible('jumbotron_pylon_style', { ...crowd, jumbotron_pylon_mount: true })).toBe(true);
    expect(visible('jumbotron_pylon_style', { stadium_backdrop: 'LAKE', jumbotron_enabled: true })).toBe(true);
    expect(visible('jumbotron_pylon_style', { stadium_backdrop: 'HILL' })).toBe(true);
});

test('width, shape and outside posts follow the scoreboard', () => {
    const lake = { stadium_backdrop: 'LAKE', jumbotron_enabled: true };
    expect(visible('jumbotron_width', lake)).toBe(true);
    expect(visible('jumbotron_shape', lake)).toBe(true);
    expect(visible('jumbotron_pylons_outside', lake)).toBe(true);
    expect(visible('jumbotron_width', { stadium_backdrop: 'LAKE' })).toBe(false);
    expect(visible('jumbotron_shape', { stadium_backdrop: 'HILL' })).toBe(true);
});

test('scoreboard logos only appear with a topper', () => {
    const lake = { stadium_backdrop: 'LAKE', jumbotron_enabled: true };
    expect(visible('scoreboard_logo', lake)).toBe(false);
    expect(visible('scoreboard_logo', { ...lake, jumbotron_shape: 'ROUNDED' })).toBe(false);
    expect(visible('scoreboard_logo', { ...lake, jumbotron_shape: 'ARCHED' })).toBe(true);
    expect(
        visible('right_scoreboard_logo', {
            ...lake,
            right_stadium_backdrop: 'LAKE',
            right_jumbotron_enabled: true,
            jumbotron_shape: 'MARQUEE',
        })
    ).toBe(true);
});

test('a right end set to match left hides its own controls', () => {
    const rightEnd = STADIUM_SECTIONS.find((section) => section.title === 'Right end').fields;
    const matching = {
        stadium_backdrop: 'LAKE',
        right_stadium_backdrop: MATCH_LEFT,
        jumbotron_enabled: true,
        right_jumbotron_enabled: true,
    };
    expect(rightEnd.filter((field) => isVisible(field, matching)).map((field) => field.key)).toEqual([
        'right_stadium_backdrop',
    ]);
    expect(available('right_jumbotron_enabled', { ...matching, right_stadium_backdrop: 'LAKE' })).toBe(true);
});

test('board colors follow the scoreboard and the topper color needs a topper', () => {
    const lake = { stadium_backdrop: 'LAKE', jumbotron_enabled: true };
    expect(visible('jumbotron_color', lake)).toBe(true);
    expect(visible('jumbotron_color', { stadium_backdrop: 'LAKE' })).toBe(false);
    expect(visible('topper_color', lake)).toBe(false);
    expect(visible('topper_color', { ...lake, jumbotron_shape: 'MARQUEE' })).toBe(true);
});

test('a full-width low building only takes the board in front of it', () => {
    const low = { stadium_backdrop: 'FACILITY', backdrop_style: 'FACILITY_NARROW_MODERN', jumbotron_enabled: true };
    const tower = { stadium_backdrop: 'FACILITY', backdrop_style: 'FACILITY_TOWER', jumbotron_enabled: true };
    expect(visible('facility_full_width', low)).toBe(true);
    expect(visible('facility_full_width', tower)).toBe(false);
    expect(visible('jumbotron_over_building', low)).toBe(true);
    expect(visible('jumbotron_over_building', { ...low, facility_full_width: true })).toBe(false);
    expect(visible('jumbotron_width', { ...low, facility_full_width: true, jumbotron_over_building: true })).toBe(true);
    expect(visible('jumbotron_elevation', { ...low, facility_full_width: true, jumbotron_over_building: true })).toBe(
        true
    );
});

test('an unset right end is its own full crowd rather than a copy of the left end', () => {
    const scenic = { stadium_backdrop: 'MOUNTAINS', stadium_size: 0.5 };
    expect(available('right_stadium_size', scenic)).toBe(true);
    expect(available('right_jumbotron_enabled', scenic)).toBe(false);
    expect(available('right_wall_enabled', scenic)).toBe(false);
    expect(stadiumField('right_stadium_backdrop').default).toBe('CROWD');
});

test('the jumbotron toggle keeps its place and explains why it is unavailable', () => {
    const fullCrowd = { stadium_backdrop: 'CROWD', stadium_size: 1 };
    expect(visible('jumbotron_enabled', fullCrowd)).toBe(true);
    expect(isEnabled(stadiumField('jumbotron_enabled'), fullCrowd)).toBe(false);
    expect(stadiumField('jumbotron_enabled').disabledHelp(fullCrowd)).toMatch(/below 1.0/);
    expect(stadiumField('jumbotron_enabled').disabledHelp({ stadium_backdrop: 'HILL' })).toMatch(/own scoreboard/);
    const leftEnd = STADIUM_SECTIONS.find((section) => section.title === 'Left end').fields.map((field) => field.key);
    expect(leftEnd.indexOf('jumbotron_enabled')).toBe(leftEnd.indexOf('scoreboard_heading') + 1);
});

const teamField = (key) => TEAM_FIELD_SECTIONS.flatMap((section) => section.fields).find((field) => field.key === key);

test('only grass team fields take a mowing pattern', () => {
    const mowing = teamField('mowing_pattern');
    expect(isVisible(mowing, {}) && isEnabled(mowing, { surface: 'GRASS' })).toBe(true);
    expect(isEnabled(mowing, { surface: 'TURF' })).toBe(false);
});

test('a team field without a saved surface opens as turf with stripes ready', () => {
    const form = formFrom(TEAM_FIELD_SECTIONS, {});
    expect([form.surface, form.mowing_pattern]).toEqual(['TURF', 'STRIPES']);
});

test('the stadium design editor reads the roof but never saves it', () => {
    expect(payloadFrom(STADIUM_SECTIONS, formFrom(STADIUM_SECTIONS, { dome_style: 'SUITES' }))).not.toHaveProperty(
        'dome_style'
    );
});

test('a closed dome hides distant scenery but a windowed one shows it', () => {
    const open = { stadium_backdrop: 'CROWD', stadium_size: 0.6 };
    expect(available('skyline_backdrop', { ...open, dome_style: 'SUITES' })).toBe(false);
    expect(available('skyline_backdrop', { ...open, dome_style: 'WINDOWED' })).toBe(true);
    expect(available('skyline_backdrop', { ...open, dome_style: 'NONE' })).toBe(true);
    expect(formFrom(STADIUM_SECTIONS, {}).dome_style).toBe('NONE');
});
