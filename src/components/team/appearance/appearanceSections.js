import { readGeneric, writeGeneric } from './appearanceForm';

export { isVisible } from './appearanceForm';
const WALL_DESIGNS = [
    { value: 'TEXT_WITH_LOGOS', label: 'Text with logos' },
    { value: 'TEXT_ONLY', label: 'Text only' },
    { value: 'REPEATING_LOGOS', label: 'Repeating logos' },
    { value: 'BLANK', label: 'Blank' },
];
const GOAL_POST_STYLES = [
    { value: 'Y', label: 'Y (single stem)' },
    { value: 'H', label: 'H (two stems)' },
];
const STADIUM_BACKDROPS = [
    { value: 'CROWD', label: 'Crowd' },
    { value: 'BUILDING', label: 'City and town' },
    { value: 'CAMPUS', label: 'Campus buildings' },
    { value: 'FOREST', label: 'Forest' },
    { value: 'FIELD', label: 'Farm fields' },
    { value: 'LAKE', label: 'Lake' },
    { value: 'MOUNTAINS', label: 'Mountains' },
    { value: 'HILL', label: 'Grass berm with scoreboard' },
    { value: 'FACILITY', label: 'Facility building' },
    { value: 'NONE', label: 'None (open sky)' },
];
const STADIUM_BACKDROPS_RIGHT = [{ value: '', label: 'Match left' }, ...STADIUM_BACKDROPS];
const BACKDROP_STYLES = {
    BUILDING: [
        { value: 'BUILDING_CITY', label: 'City skyline' },
        { value: 'BUILDING_TOWN', label: 'Small town main street' },
        { value: 'BUILDING_NEIGHBORHOOD', label: 'Neighborhood' },
    ],
    CAMPUS: [
        { value: 'CAMPUS_GEORGIAN', label: 'Georgian brick' },
        { value: 'CAMPUS_GOTHIC', label: 'Gothic stone' },
        { value: 'CAMPUS_MISSION', label: 'Spanish mission' },
        { value: 'CAMPUS_MODERN', label: 'Modern glass' },
        { value: 'CAMPUS_ATHLETIC', label: 'Athletic center (one building)' },
        { value: 'CAMPUS_ADMIN', label: 'Administration hall (one building)' },
        { value: 'CAMPUS_FIELDHOUSE', label: 'Fieldhouse (one building)' },
    ],
    MOUNTAINS: [
        { value: 'MOUNTAINS_ALPINE', label: 'Alpine peaks' },
        { value: 'MOUNTAINS_DESERT', label: 'Desert mesas' },
        { value: 'MOUNTAINS_SMOKY', label: 'Smoky ridges' },
        { value: 'MOUNTAINS_VOLCANO', label: 'Lone volcano' },
        { value: 'MOUNTAINS_HILLS', label: 'Rolling hills' },
        { value: 'MOUNTAINS_JAGGED', label: 'Jagged peaks' },
    ],
    FIELD: [
        { value: 'FIELD_CROPS', label: 'Crop rows' },
        { value: 'FIELD_PASTURE', label: 'Cattle pasture' },
        { value: 'FIELD_HAY', label: 'Hay bales' },
        { value: 'FIELD_ORCHARD', label: 'Orchard' },
    ],
    LAKE: [
        { value: 'LAKE_HILLS', label: 'Hills and treeline' },
        { value: 'LAKE_OPEN', label: 'Open horizon' },
        { value: 'LAKE_PINES', label: 'Pine shore' },
        { value: 'LAKE_MOUNTAINS', label: 'Mountain lake' },
        { value: 'LAKE_FLAT', label: 'Flat far shore' },
    ],
    FACILITY: [
        { value: 'FACILITY_BRICK', label: 'Brick building (fills the view)' },
        { value: 'FACILITY_CONCRETE', label: 'Concrete press box (fills the view)' },
        { value: 'FACILITY_TOWER', label: 'Center tower, brick with clock' },
        { value: 'FACILITY_TOWER_STONE', label: 'Center tower, Gothic stone' },
        { value: 'FACILITY_TOWER_MODERN', label: 'Modern concrete building' },
        { value: 'FACILITY_NARROW_GEORGIAN', label: 'Low building, Georgian' },
        { value: 'FACILITY_NARROW_MODERN', label: 'Low building, modern' },
        { value: 'FACILITY_NARROW_COLLEGIATE', label: 'Low building, collegiate brick' },
    ],
};
const PYLON_STYLES = [
    { value: 'STEEL', label: 'Steel posts' },
    { value: 'TRUSS', label: 'Steel truss' },
    { value: 'BRICK', label: 'Brick pillars' },
    { value: 'CONCRETE', label: 'Concrete columns' },
];
const PYLON_STYLES_RIGHT = [{ value: '', label: 'Match left' }, ...PYLON_STYLES];
const BUILT_IN_SCOREBOARD = ['HILL'];
const SCOREBOARD_LOGOS = [
    { value: 'NONE', label: 'No logo' },
    { value: 'PRIMARY', label: 'Primary logo' },
    { value: 'SECONDARY', label: 'Secondary logo' },
];
const SCOREBOARD_LOGOS_RIGHT = [{ value: '', label: 'Match left' }, ...SCOREBOARD_LOGOS];
const SKYLINE_BACKDROPS = [
    { value: 'NONE', label: 'Open sky' },
    { value: 'FOREST', label: 'Forest' },
    ...['MOUNTAINS', 'BUILDING', 'CAMPUS', 'FIELD', 'LAKE'].flatMap((backdrop) => BACKDROP_STYLES[backdrop]),
];
const SKYLINE_BACKDROPS_RIGHT = [{ value: '', label: 'Match left' }, ...SKYLINE_BACKDROPS];
const SCOREBOARD_SHAPES = [
    { value: 'RECTANGLE', label: 'Rectangle' },
    { value: 'ROUNDED', label: 'Rounded corners' },
    { value: 'CHAMFERED', label: 'Cut corners' },
    { value: 'ARCHED', label: 'Arched topper' },
    { value: 'MARQUEE', label: 'Marquee sign' },
];
const SCOREBOARD_SHAPES_RIGHT = [{ value: '', label: 'Match left' }, ...SCOREBOARD_SHAPES];
const SCOREBOARD_STYLES = [
    { value: 'CLASSIC', label: 'Classic bulbs' },
    { value: 'VIDEO', label: 'Modern video board' },
    { value: 'VINTAGE', label: 'Vintage hand-turned' },
    { value: 'SEGMENT', label: 'Red seven-segment' },
];
const SCOREBOARD_STYLES_RIGHT = [{ value: '', label: 'Match left' }, ...SCOREBOARD_STYLES];
const leftBackdrop = (f) => f.stadium_backdrop || 'CROWD';
const rightBackdrop = (f) => f.right_stadium_backdrop || leftBackdrop(f);
const leftStadiumSize = (f) => Number(f.stadium_size) || 1;
const rightStadiumSize = (f) => Number(f.right_stadium_size) || leftStadiumSize(f);
const jumbotronAllowed = (backdrop, size) =>
    !BUILT_IN_SCOREBOARD.includes(backdrop) && !(backdrop === 'CROWD' && size >= 1);
const leftJumbotronAllowed = (f) => jumbotronAllowed(leftBackdrop(f), leftStadiumSize(f));
const rightJumbotronAllowed = (f) => jumbotronAllowed(rightBackdrop(f), rightStadiumSize(f));
const NARROW_FACILITIES = ['FACILITY_NARROW_GEORGIAN', 'FACILITY_NARROW_MODERN', 'FACILITY_NARROW_COLLEGIATE'];
const leftStyle = (f) => f.backdrop_style || '';
const rightStyle = (f) => (f.right_stadium_backdrop ? f.right_backdrop_style || '' : leftStyle(f));
const SMALL_FACILITIES = ['FACILITY_TOWER', 'FACILITY_TOWER_STONE', 'FACILITY_TOWER_MODERN', ...NARROW_FACILITIES];
const isNarrowFacility = (backdrop, style) => backdrop === 'FACILITY' && NARROW_FACILITIES.includes(style);
const isFullFacility = (backdrop, style) => backdrop === 'FACILITY' && !SMALL_FACILITIES.includes(style);
const onPylons = (backdrop, style, pylons) => {
    if (backdrop === 'CROWD') {
        return Boolean(pylons);
    }
    return !isFullFacility(backdrop, style);
};
const isSmallFacility = (backdrop, style) => backdrop === 'FACILITY' && SMALL_FACILITIES.includes(style);
const standsLikeNormalBoard = (backdrop, style, over) =>
    backdrop !== 'FACILITY' || (isSmallFacility(backdrop, style) && !over);
const canRaise = (backdrop, style, pylons, over) =>
    onPylons(backdrop, style, pylons) && standsLikeNormalBoard(backdrop, style, over);
const TOPPER_SHAPES = ['ARCHED', 'MARQUEE'];
const spansFullWidth = (backdrop, style, fullWidth) => isNarrowFacility(backdrop, style) && Boolean(fullWidth);
const boardOverBuilding = (backdrop, style, fullWidth, over) =>
    isSmallFacility(backdrop, style) && !spansFullWidth(backdrop, style, fullWidth) && Boolean(over);
const leftBoardOver = (f) =>
    boardOverBuilding(leftBackdrop(f), leftStyle(f), f.facility_full_width, f.jumbotron_over_building);
const rightBoardOver = (f) =>
    boardOverBuilding(rightBackdrop(f), rightStyle(f), f.right_facility_full_width, f.right_jumbotron_over_building);
const leftShape = (f) => f.jumbotron_shape || 'RECTANGLE';
const rightShape = (f) => f.right_jumbotron_shape || leftShape(f);
const leftOnPylons = (f) => onPylons(leftBackdrop(f), leftStyle(f), f.jumbotron_pylon_mount);
const rightOnPylons = (f) => onPylons(rightBackdrop(f), rightStyle(f), f.right_jumbotron_pylon_mount);
const showsSkyline = (backdrop, style, size) =>
    backdrop !== 'NONE' && !(backdrop === 'CROWD' && size >= 1) && !isFullFacility(backdrop, style);
const pylonsCanMoveOutside = (backdrop, style, onPylonsNow, over) =>
    onPylonsNow && standsLikeNormalBoard(backdrop, style, over);
const leftHasScoreboard = (f) =>
    BUILT_IN_SCOREBOARD.includes(leftBackdrop(f)) || (leftJumbotronAllowed(f) && Boolean(f.jumbotron_enabled));
const rightHasScoreboard = (f) =>
    BUILT_IN_SCOREBOARD.includes(rightBackdrop(f)) || (rightJumbotronAllowed(f) && Boolean(f.right_jumbotron_enabled));
const GRAPHIC_OPTIONS = [
    { value: 'PRIMARY', label: 'Primary logo' },
    { value: 'SECONDARY', label: 'Secondary logo' },
    { value: 'UPLOADED', label: 'Custom logo' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'NONE', label: 'None' },
];
const STRIPE_STYLES = [
    { value: 'NONE', label: 'None' },
    { value: 'SINGLE', label: 'Single' },
    { value: 'TRIPLE', label: 'Triple (gap)' },
    { value: 'TRIPLE_FLUSH', label: 'Triple (flush)' },
];
const TRIPLE_STYLES = ['TRIPLE', 'TRIPLE_FLUSH'];
const ARROW_ALIGNS = [
    { value: 'CENTER', label: 'Centered' },
    { value: 'TOP', label: 'Top aligned' },
    { value: 'BOTTOM', label: 'Bottom aligned' },
];
const FIELD_LOGO_SOURCES = [
    { value: 'CUSTOM', label: 'Custom URL' },
    { value: 'PRIMARY', label: 'Primary logo' },
    { value: 'SECONDARY', label: 'Secondary logo' },
];
const QUARTER_LOGO_SOURCES = [...FIELD_LOGO_SOURCES, { value: 'NONE', label: 'None (off)' }];
const WALL_LOGO_SOURCES = [
    { value: 'NONE', label: 'Use midfield logo' },
    { value: 'BLANK', label: 'No logo' },
    ...FIELD_LOGO_SOURCES,
];
const WALL_LOGO_SOURCES_RIGHT = [{ value: '', label: 'Match left' }, ...WALL_LOGO_SOURCES];

export const UNIFORM_SECTIONS = [
    {
        title: 'Helmet',
        fields: [
            { key: 'helmet_color', label: 'Shell color', type: 'color', defaultColor: 'primary' },
            { key: 'facemask_color', label: 'Facemask', type: 'color', defaultColor: '#FFFFFF' },
            {
                key: 'bumper_color',
                label: 'Chin strap bumper',
                type: 'color',
                defaultColor: '#DDDDDD',
                help: 'Visible on the small field-goal figure only, not the detailed helmet preview.',
            },
            { key: 'helmet_graphic', label: 'Graphic', type: 'graphic', options: GRAPHIC_OPTIONS },
            {
                key: 'helmet_number_color',
                label: 'Helmet number color',
                type: 'color',
                defaultColor: '#FFFFFF',
                showIf: (f) => f.helmet_graphic === 'NUMBER',
            },
            {
                key: 'helmet_number_font',
                label: 'Helmet number font',
                type: 'font',
                allowDefault: true,
                showIf: (f) => f.helmet_graphic === 'NUMBER',
            },
            { key: 'stripe_style', label: 'Center stripe', type: 'stripe', options: STRIPE_STYLES },
            {
                key: 'stripe_color',
                label: 'Stripe color',
                type: 'optionalColor',
                defaultColor: 'secondary',
                showIf: (f) => f.stripe_style !== 'NONE',
            },
            {
                key: 'secondary_stripe_color',
                label: 'Outer stripe color',
                type: 'optionalColor',
                defaultColor: 'tertiary',
                showIf: (f) => TRIPLE_STYLES.includes(f.stripe_style),
            },
            { key: 'logo_url', label: 'Custom logo URL', type: 'logo', showIf: (f) => f.helmet_graphic === 'UPLOADED' },
            { key: 'logo_size', label: 'Logo size', type: 'scale', min: 0.5, max: 2, step: 0.05, fallback: 1 },
            { key: 'logo_x', label: 'Logo horizontal', type: 'scale', min: -0.2, max: 0.2, step: 0.01, fallback: 0 },
            { key: 'logo_y', label: 'Logo vertical', type: 'scale', min: -0.2, max: 0.2, step: 0.01, fallback: 0 },
            {
                key: 'logo_rotation',
                label: 'Logo rotation',
                type: 'scale',
                min: -180,
                max: 180,
                step: 1,
                fallback: 0,
                unit: '°',
                decimals: 0,
            },
        ],
    },
    {
        title: 'Jersey',
        fields: [
            { key: 'jersey_number_font', label: 'Number font', type: 'font', allowDefault: true },
            { key: '_home_jersey_heading', label: 'Home', type: 'subheading' },
            { key: 'jersey_color', label: 'Jersey color', type: 'color', defaultColor: 'primary' },
            { key: 'number_color', label: 'Number color', type: 'color', defaultColor: '#FFFFFF' },
            {
                key: 'number_outline_enabled',
                label: 'Number outline',
                type: 'toggle',
                transient: true,
                derivedFrom: 'number_outline_color',
            },
            {
                key: 'number_outline_color',
                label: 'Outline color',
                type: 'color',
                defaultColor: 'secondary',
                showIf: (f) => f.number_outline_enabled,
            },
            {
                key: 'number_top_text',
                label: 'Text above number',
                type: 'text',
                placeholder: 'Optional',
                maxLength: 32,
            },
            { key: 'pants_color', label: 'Pants color', type: 'color', defaultColor: 'primary' },
            { key: '_away_jersey_heading', label: 'Away', type: 'subheading' },
            {
                key: 'away_number_color',
                label: 'Number color',
                type: 'optionalColor',
                defaultColor: 'primary',
                help: 'On the white road jersey.',
            },
            {
                key: 'away_number_outline_enabled',
                label: 'Number outline',
                type: 'toggle',
                transient: true,
                derivedFrom: 'away_number_outline_color',
            },
            {
                key: 'away_number_outline_color',
                label: 'Outline color',
                type: 'color',
                defaultColor: 'primary',
                showIf: (f) => f.away_number_outline_enabled,
            },
            {
                key: 'away_number_top_text',
                label: 'Text above number',
                type: 'text',
                placeholder: 'Optional',
                maxLength: 32,
                fallbackKey: 'number_top_text',
                preserveEmpty: true,
                help: 'Blank hides text on the away jersey.',
            },
            {
                key: 'away_pants_color',
                label: 'Pants color',
                type: 'optionalColor',
                defaultColor: 'primary',
                help: 'Blank matches home.',
            },
        ],
    },
    {
        title: 'Secondary helmet',
        help: 'Worn by the away team when both shells clash. Blank fields copy the primary helmet.',
        copyMap: {
            alt_facemask_color: 'facemask_color',
            alt_helmet_graphic: 'helmet_graphic',
            alt_helmet_number_color: 'helmet_number_color',
            alt_stripe_style: 'stripe_style',
            alt_stripe_color: 'stripe_color',
            alt_secondary_stripe_color: 'secondary_stripe_color',
            alt_logo_url: 'logo_url',
            alt_logo_size: 'logo_size',
            alt_logo_x: 'logo_x',
            alt_logo_y: 'logo_y',
            alt_logo_rotation: 'logo_rotation',
        },
        fields: [
            { key: 'secondary_helmet_color', label: 'Shell color', type: 'optionalColor', defaultColor: 'secondary' },
            { key: 'alt_facemask_color', label: 'Facemask', type: 'color', defaultColor: '#FFFFFF' },
            {
                key: 'alt_helmet_graphic',
                label: 'Graphic',
                type: 'graphic',
                options: GRAPHIC_OPTIONS,
                modeKey: 'alt_helmet_logo_mode',
                sourceKey: 'alt_helmet_logo_source',
                hasKey: 'alt_has_logo',
            },
            {
                key: 'alt_helmet_number_color',
                label: 'Helmet number color',
                type: 'color',
                defaultColor: '#FFFFFF',
                showIf: (f) => f.alt_helmet_graphic === 'NUMBER',
            },
            {
                key: 'alt_stripe_style',
                label: 'Center stripe',
                type: 'stripe',
                options: STRIPE_STYLES,
                hasKey: 'alt_has_stripe',
                typeKey: 'alt_stripe_type',
            },
            {
                key: 'alt_stripe_color',
                label: 'Stripe color',
                type: 'optionalColor',
                defaultColor: 'secondary',
                showIf: (f) => f.alt_stripe_style !== 'NONE',
            },
            {
                key: 'alt_secondary_stripe_color',
                label: 'Outer stripe color',
                type: 'optionalColor',
                defaultColor: 'tertiary',
                showIf: (f) => TRIPLE_STYLES.includes(f.alt_stripe_style),
            },
            {
                key: 'alt_logo_url',
                label: 'Custom logo URL',
                type: 'logo',
                showIf: (f) => f.alt_helmet_graphic === 'UPLOADED',
            },
            { key: 'alt_logo_size', label: 'Logo size', type: 'scale', min: 0.5, max: 2, step: 0.05, fallback: 1 },
            {
                key: 'alt_logo_x',
                label: 'Logo horizontal',
                type: 'scale',
                min: -0.2,
                max: 0.2,
                step: 0.01,
                fallback: 0,
            },
            { key: 'alt_logo_y', label: 'Logo vertical', type: 'scale', min: -0.2, max: 0.2, step: 0.01, fallback: 0 },
            {
                key: 'alt_logo_rotation',
                label: 'Logo rotation',
                type: 'scale',
                min: -180,
                max: 180,
                step: 1,
                fallback: 0,
                unit: '°',
                decimals: 0,
            },
        ],
    },
];

export const TEAM_FIELD_SECTIONS = [
    {
        title: 'Field',
        fields: [
            { key: 'turf_color', label: 'Turf color', type: 'color' },
            { key: 'midfield_logo_source', label: 'Midfield logo source', type: 'select', options: FIELD_LOGO_SOURCES },
            {
                key: 'midfield_logo_url',
                label: 'Custom logo URL',
                type: 'logo',
                showIf: (f) => f.midfield_logo_source === 'CUSTOM',
            },
            {
                key: 'midfield_logo_size',
                label: 'Midfield logo size',
                type: 'scale',
                min: 0.4,
                max: 2,
                step: 0.05,
                fallback: 1,
            },
            { key: 'quarter_logo_source', label: '25-yard logo source', type: 'select', options: QUARTER_LOGO_SOURCES },
            {
                key: 'quarter_logo_url',
                label: 'Custom logo URL',
                type: 'logo',
                showIf: (f) => f.quarter_logo_source === 'CUSTOM',
            },
            {
                key: 'conference_logo_size',
                label: 'Conference logo size (25)',
                type: 'scale',
                min: 0.4,
                max: 2,
                step: 0.05,
                fallback: 1,
            },
            {
                key: 'conference_logo_color_map',
                label: 'Conference logo colors',
                type: 'conferenceColors',
                help: 'Recolor parts of your conference logo to your team colors. Unmapped parts keep their original color.',
            },
        ],
    },
    {
        title: 'End zones',
        fields: [
            {
                key: 'end_zone_color',
                label: 'End zone fill',
                type: 'optionalColor',
                fullWidth: true,
                help: 'Blank leaves the end zone as bare turf (no fill).',
            },
            {
                key: 'end_zone_font',
                label: 'End zone font',
                type: 'font',
                fullWidth: true,
                help: 'Used on both end zones.',
            },
            {
                key: 'end_zone_text_color',
                label: 'End zone text color',
                type: 'optionalColor',
                defaultColor: '#FFFFFF',
            },
            { key: 'end_zone_outline_enabled', label: 'Show text outline', type: 'toggle' },
            {
                key: 'end_zone_outline_color',
                label: 'Text outline color',
                type: 'optionalColor',
                help: 'Blank picks a readable outline automatically.',
                showIf: (f) => f.end_zone_outline_enabled,
            },
            {
                key: 'end_zone_outline_width',
                label: 'Text outline width',
                type: 'scale',
                min: 0.5,
                max: 3,
                step: 0.25,
                fallback: 1,
                showIf: (f) => f.end_zone_outline_enabled,
            },
            { key: '_ez_logo_heading', label: 'Logo', type: 'subheading' },
            {
                key: 'end_zone_logo_enabled',
                label: 'Show end zone logo',
                type: 'toggle',
                help: 'Draws a logo beside the end zone text.',
            },
            {
                key: 'end_zone_logo_source',
                label: 'Logo source',
                type: 'select',
                options: FIELD_LOGO_SOURCES,
                showIf: (f) => f.end_zone_logo_enabled,
            },
            {
                key: 'end_zone_logo_url',
                label: 'Custom logo URL',
                type: 'logo',
                showIf: (f) => f.end_zone_logo_enabled && f.end_zone_logo_source === 'CUSTOM',
            },
            {
                key: 'end_zone_logo_size',
                label: 'Logo size',
                type: 'scale',
                min: 0.4,
                max: 1,
                step: 0.05,
                fallback: 0.85,
                showIf: (f) => f.end_zone_logo_enabled,
            },
            { key: '_left_ez_heading', label: 'Left end zone', type: 'subheading' },
            {
                key: 'end_zone_text_left',
                label: 'Text',
                type: 'text',
                placeholder: 'Team name',
                help: 'Blank uses the team name.',
            },
            { key: '_right_ez_heading', label: 'Right end zone', type: 'subheading' },
            { key: 'end_zone_text_right', label: 'Text', type: 'text', placeholder: 'Team name' },
        ],
    },
    {
        title: 'Markings',
        fields: [
            {
                key: 'field_number_outline_enabled',
                label: 'Yard number outline',
                type: 'toggle',
                transient: true,
                derivedFrom: 'field_number_outline_color',
            },
            {
                key: 'field_number_outline_color',
                label: 'Yard number outline color',
                type: 'color',
                defaultColor: 'secondary',
                showIf: (f) => f.field_number_outline_enabled,
                rowSpan: 2,
            },
            { key: 'yard_number_font', label: 'Yard number font', type: 'font', rowSpan: 2 },
            {
                key: 'yard_number_arrow_align',
                label: 'Direction arrow',
                type: 'select',
                options: ARROW_ALIGNS,
                default: 'TOP',
            },
            {
                key: 'yard_number_outline_width',
                label: 'Yard number outline width',
                type: 'scale',
                min: 0.5,
                max: 3,
                step: 0.25,
                fallback: 1,
                showIf: (f) => f.field_number_outline_enabled,
            },
            { key: '_red_zone_divider', type: 'divider' },
            {
                key: 'red_zone_border_enabled',
                label: 'Red zone border',
                type: 'toggle',
                transient: true,
                derivedFrom: 'red_zone_border_color',
            },
            {
                key: 'red_zone_border_color',
                label: 'Red zone border color',
                type: 'color',
                defaultColor: 'secondary',
                showIf: (f) => f.red_zone_border_enabled,
            },
            { key: '_midfield_divider', type: 'divider' },
            {
                key: 'midfield_border_enabled',
                label: 'Midfield (50) border',
                type: 'toggle',
                transient: true,
                derivedFrom: 'midfield_border_color',
            },
            {
                key: 'midfield_border_color',
                label: 'Midfield border color',
                type: 'color',
                defaultColor: 'secondary',
                showIf: (f) => f.midfield_border_enabled,
            },
            { key: '_sideline_divider', type: 'divider' },
            {
                key: 'sideline_accent_enabled',
                label: 'Sideline accent',
                type: 'toggle',
                transient: true,
                derivedFrom: 'oob_line_color',
            },
            {
                key: 'oob_line_color',
                label: 'Sideline accent color',
                type: 'color',
                defaultColor: 'secondary',
                showIf: (f) => f.sideline_accent_enabled,
            },
        ],
    },
    {
        title: 'Wall',
        help: 'A Crowd backdrop always has a wall; other backdrops show it only when Show wall is on in the Stadium section. Each end can be styled independently; blank right-wall fields match the left.',
        fields: [
            { key: 'wall_text_font', label: 'Wall text font', type: 'font', fullWidth: true },
            { key: '_left_wall_heading', label: 'Left wall', type: 'subheading' },
            {
                key: 'wall_color',
                label: 'Color',
                type: 'optionalColor',
                help: 'White is not allowed. Blank uses the built-in look.',
            },
            { key: 'wall_design', label: 'Design', type: 'select', options: WALL_DESIGNS },
            { key: 'wall_text', label: 'Text', type: 'text', placeholder: 'Blank uses the built-in text' },
            {
                key: 'wall_text_outline_enabled',
                label: 'Text outline',
                type: 'toggle',
                transient: true,
                derivedFrom: 'wall_text_outline_color',
            },
            {
                key: 'wall_text_outline_color',
                label: 'Outline color',
                type: 'color',
                defaultColor: 'secondary',
                showIf: (f) => f.wall_text_outline_enabled,
            },
            {
                key: 'wall_text_outline_width',
                label: 'Outline width',
                type: 'scale',
                min: 0.5,
                max: 3,
                step: 0.25,
                fallback: 1,
                showIf: (f) => f.wall_text_outline_enabled,
            },
            { key: 'wall_logo_source', label: 'Logo', type: 'select', options: WALL_LOGO_SOURCES },
            {
                key: 'wall_logo_url',
                label: 'Custom logo URL',
                type: 'logo',
                showIf: (f) => f.wall_logo_source === 'CUSTOM',
            },
            { key: '_right_wall_heading', label: 'Right wall', type: 'subheading' },
            { key: 'right_wall_color', label: 'Color', type: 'optionalColor', help: 'Blank matches the left wall.' },
            { key: 'right_wall_design', label: 'Design', type: 'select', options: WALL_DESIGNS },
            { key: 'right_wall_text', label: 'Text', type: 'text', placeholder: 'Same as left' },
            {
                key: 'right_wall_text_outline_enabled',
                label: 'Text outline',
                type: 'toggle',
                transient: true,
                derivedFrom: 'right_wall_text_outline_color',
            },
            {
                key: 'right_wall_text_outline_color',
                label: 'Outline color',
                type: 'color',
                defaultColor: 'secondary',
                showIf: (f) => f.right_wall_text_outline_enabled,
            },
            { key: 'right_wall_logo_source', label: 'Logo', type: 'select', options: WALL_LOGO_SOURCES_RIGHT },
            {
                key: 'right_wall_logo_url',
                label: 'Custom logo URL',
                type: 'logo',
                showIf: (f) => f.right_wall_logo_source === 'CUSTOM',
            },
        ],
    },
    {
        title: 'Goal post',
        fields: [
            { key: 'goal_post_color', label: 'Goal post color', type: 'color', resetColor: '#FFCD00' },
            { key: 'goal_post_style', label: 'Goal post style', type: 'select', options: GOAL_POST_STYLES },
        ],
    },
];

const resolveDefault = (definition, teamColors) => {
    if (definition.default !== undefined) {
        return definition.default;
    }
    const key = definition.defaultColor;
    if (!key) {
        return '';
    }
    if (key === 'primary') {
        return teamColors?.primary_color || '';
    }
    if (key === 'secondary') {
        return teamColors?.secondary_color || '';
    }
    if (key === 'tertiary') {
        return teamColors?.tertiary_color || '';
    }
    return key;
};

const graphicFrom = (source, definition) => {
    const modeKey = definition.modeKey || 'helmet_logo_mode';
    const sourceKey = definition.sourceKey || 'helmet_logo_source';
    const hasKey = definition.hasKey || 'has_logo';
    if (source[hasKey] === false) {
        return 'NONE';
    }
    const mode = source[modeKey];
    if (mode === 'NUMBERS') {
        return 'NUMBER';
    }
    if (mode === 'UPLOAD') {
        return 'UPLOADED';
    }
    return source[sourceKey] === 'SECONDARY' ? 'SECONDARY' : 'PRIMARY';
};

const stripeFrom = (source, definition) => {
    const hasKey = definition.hasKey || 'has_stripe';
    const typeKey = definition.typeKey || 'stripe_type';
    if (source[hasKey] === false) {
        return 'NONE';
    }
    return TRIPLE_STYLES.includes(source[typeKey]) ? source[typeKey] : 'SINGLE';
};

const emptyValue = (definition, source, teamColors) => {
    const stored = source[definition.key];
    if (definition.transient && definition.derivedFrom) {
        const derived = source[definition.derivedFrom];
        return derived !== null && derived !== undefined && derived !== '';
    }
    if (definition.type === 'graphic') {
        return graphicFrom(source, definition);
    }
    if (definition.type === 'stripe') {
        return stripeFrom(source, definition);
    }
    if (definition.type === 'font') {
        return stored ?? (definition.allowDefault ? '' : 'CLASSIC');
    }
    return readGeneric(definition, stored ?? source[definition.fallbackKey], resolveDefault(definition, teamColors));
};

export const STADIUM_SECTIONS = [
    {
        title: 'Stadium',
        help: 'Each side can be styled independently; blank right-side fields match the left.',
        fields: [
            { key: '_left_stadium_heading', label: 'Left side', type: 'subheading' },
            { key: 'stadium_backdrop', label: 'Backdrop', type: 'select', options: STADIUM_BACKDROPS },
            {
                key: 'stadium_size',
                label: 'Stadium size',
                type: 'scale',
                min: 0.2,
                max: 1,
                step: 0.05,
                fallback: 1,
                showIf: (f) => leftBackdrop(f) !== 'NONE',
                help: 'A jumbotron over the crowd needs a size below 1.0.',
            },
            {
                key: 'backdrop_style',
                label: 'Style',
                type: 'select',
                optionsFor: (f) => BACKDROP_STYLES[leftBackdrop(f)] || [],
                showIf: (f) => Boolean(BACKDROP_STYLES[leftBackdrop(f)]),
            },
            {
                key: 'skyline_backdrop',
                label: 'Distant scenery',
                type: 'select',
                options: SKYLINE_BACKDROPS,
                showIf: (f) => showsSkyline(leftBackdrop(f), leftStyle(f), leftStadiumSize(f)),
                help: 'Scenery further back that shows wherever sky is visible over the backdrop.',
            },
            {
                key: 'wall_enabled',
                label: 'Show wall',
                type: 'toggle',
                showIf: (f) => !['CROWD', 'FACILITY'].includes(leftBackdrop(f)),
                help: 'Off runs the backdrop straight down to the end zone.',
            },
            { key: 'jumbotron_enabled', label: 'Jumbotron', type: 'toggle', showIf: leftJumbotronAllowed },
            {
                key: 'jumbotron_pylon_mount',
                label: 'Mount on pylons',
                type: 'toggle',
                showIf: (f) => leftJumbotronAllowed(f) && f.jumbotron_enabled && leftBackdrop(f) === 'CROWD',
                help: 'Only applies over a Crowd backdrop — other backdrops always use pylons.',
            },
            {
                key: 'facility_full_width',
                label: 'Span the full width',
                type: 'toggle',
                showIf: (f) => isNarrowFacility(leftBackdrop(f), leftStyle(f)),
                help: 'Runs the low building across the whole background. The board then stands in front of it.',
            },
            {
                key: 'jumbotron_over_building',
                label: 'Board over the building',
                type: 'toggle',
                showIf: (f) =>
                    leftHasScoreboard(f) &&
                    isSmallFacility(leftBackdrop(f), leftStyle(f)) &&
                    !spansFullWidth(leftBackdrop(f), leftStyle(f), f.facility_full_width),
                help: 'On spans the building on tall pylons; off stands a normal jumbotron in front of it.',
            },
            {
                key: 'jumbotron_style',
                label: 'Scoreboard style',
                type: 'select',
                options: SCOREBOARD_STYLES,
                showIf: leftHasScoreboard,
            },
            {
                key: 'scoreboard_logo',
                label: 'Scoreboard logo',
                type: 'select',
                options: SCOREBOARD_LOGOS,
                showIf: (f) => leftHasScoreboard(f) && TOPPER_SHAPES.includes(leftShape(f)),
                help: 'Shows in the arched or marquee topper.',
            },
            {
                key: 'jumbotron_shape',
                label: 'Scoreboard shape',
                type: 'select',
                options: SCOREBOARD_SHAPES,
                showIf: leftHasScoreboard,
            },
            {
                key: 'jumbotron_color',
                label: 'Jumbotron color',
                type: 'optionalColor',
                showIf: leftHasScoreboard,
                help: "Adds a frame in this color around the board. Blank keeps the design's own frame.",
            },
            {
                key: 'topper_color',
                label: 'Topper color',
                type: 'optionalColor',
                showIf: (f) => leftHasScoreboard(f) && TOPPER_SHAPES.includes(leftShape(f)),
                help: 'Background of the arched topper or marquee sign.',
            },
            {
                key: 'jumbotron_pylon_style',
                label: 'Pylon design',
                type: 'select',
                options: PYLON_STYLES,
                showIf: (f) => leftHasScoreboard(f) && leftOnPylons(f),
            },
            {
                key: 'jumbotron_pylons_outside',
                label: 'Posts on the outside',
                type: 'toggle',
                showIf: (f) =>
                    leftHasScoreboard(f) &&
                    pylonsCanMoveOutside(leftBackdrop(f), leftStyle(f), leftOnPylons(f), leftBoardOver(f)),
                help: 'Moves the posts to the outer edges of the board.',
            },
            {
                key: 'jumbotron_elevation',
                label: 'Height above ground',
                type: 'scale',
                min: 0,
                max: 1,
                step: 0.05,
                fallback: 0,
                showIf: (f) =>
                    leftHasScoreboard(f) &&
                    canRaise(leftBackdrop(f), leftStyle(f), f.jumbotron_pylon_mount, leftBoardOver(f)),
                help: 'Raises it on taller pylons; over a crowd, turn on Mount on pylons first.',
            },
            {
                key: 'jumbotron_width',
                label: 'Scoreboard width',
                type: 'scale',
                min: 1,
                max: 2,
                step: 0.05,
                fallback: 1,
                showIf: (f) =>
                    leftHasScoreboard(f) && !(isNarrowFacility(leftBackdrop(f), leftStyle(f)) && leftBoardOver(f)),
                help: 'Wider boards add timeouts and possession beside each score.',
            },
            {
                key: 'jumbotron_size',
                label: 'Scoreboard size',
                type: 'scale',
                min: 0.7,
                max: 1.4,
                step: 0.05,
                fallback: 1,
                showIf: leftHasScoreboard,
            },
            { key: '_right_stadium_heading', label: 'Right side', type: 'subheading' },
            { key: 'right_stadium_backdrop', label: 'Backdrop', type: 'select', options: STADIUM_BACKDROPS_RIGHT },
            {
                key: 'right_stadium_size',
                label: 'Stadium size',
                type: 'scale',
                min: 0.2,
                max: 1,
                step: 0.05,
                fallback: 1,
                showIf: (f) => rightBackdrop(f) !== 'NONE',
                help: 'A jumbotron over the crowd needs a size below 1.0.',
            },
            {
                key: 'right_backdrop_style',
                label: 'Style',
                type: 'select',
                optionsFor: (f) => BACKDROP_STYLES[rightBackdrop(f)] || [],
                showIf: (f) => Boolean(f.right_stadium_backdrop && BACKDROP_STYLES[f.right_stadium_backdrop]),
                help: 'Matches the left style when the right backdrop is set to Match left.',
            },
            {
                key: 'right_skyline_backdrop',
                label: 'Distant scenery',
                type: 'select',
                options: SKYLINE_BACKDROPS_RIGHT,
                showIf: (f) => showsSkyline(rightBackdrop(f), rightStyle(f), rightStadiumSize(f)),
                help: 'Scenery further back that shows wherever sky is visible over the backdrop.',
            },
            {
                key: 'right_wall_enabled',
                label: 'Show wall',
                type: 'toggle',
                showIf: (f) => !['CROWD', 'FACILITY'].includes(rightBackdrop(f)),
                help: 'Off runs the backdrop straight down to the end zone.',
            },
            { key: 'right_jumbotron_enabled', label: 'Jumbotron', type: 'toggle', showIf: rightJumbotronAllowed },
            {
                key: 'right_jumbotron_pylon_mount',
                label: 'Mount on pylons',
                type: 'toggle',
                showIf: (f) => rightJumbotronAllowed(f) && f.right_jumbotron_enabled && rightBackdrop(f) === 'CROWD',
                help: 'Only applies over a Crowd backdrop — other backdrops always use pylons.',
            },
            {
                key: 'right_facility_full_width',
                label: 'Span the full width',
                type: 'toggle',
                showIf: (f) => isNarrowFacility(rightBackdrop(f), rightStyle(f)),
                help: 'Runs the low building across the whole background. The board then stands in front of it.',
            },
            {
                key: 'right_jumbotron_over_building',
                label: 'Board over the building',
                type: 'toggle',
                showIf: (f) =>
                    rightHasScoreboard(f) &&
                    isSmallFacility(rightBackdrop(f), rightStyle(f)) &&
                    !spansFullWidth(rightBackdrop(f), rightStyle(f), f.right_facility_full_width),
                help: 'On spans the building on tall pylons; off stands a normal jumbotron in front of it.',
            },
            {
                key: 'right_jumbotron_style',
                label: 'Scoreboard style',
                type: 'select',
                options: SCOREBOARD_STYLES_RIGHT,
                showIf: rightHasScoreboard,
            },
            {
                key: 'right_scoreboard_logo',
                label: 'Scoreboard logo',
                type: 'select',
                options: SCOREBOARD_LOGOS_RIGHT,
                showIf: (f) => rightHasScoreboard(f) && TOPPER_SHAPES.includes(rightShape(f)),
                help: 'Shows in the arched or marquee topper.',
            },
            {
                key: 'right_jumbotron_shape',
                label: 'Scoreboard shape',
                type: 'select',
                options: SCOREBOARD_SHAPES_RIGHT,
                showIf: rightHasScoreboard,
            },
            {
                key: 'right_jumbotron_color',
                label: 'Jumbotron color',
                type: 'optionalColor',
                showIf: rightHasScoreboard,
                help: 'Blank matches the left board.',
            },
            {
                key: 'right_topper_color',
                label: 'Topper color',
                type: 'optionalColor',
                showIf: (f) => rightHasScoreboard(f) && TOPPER_SHAPES.includes(rightShape(f)),
                help: 'Background of the arched topper or marquee sign.',
            },
            {
                key: 'right_jumbotron_pylon_style',
                label: 'Pylon design',
                type: 'select',
                options: PYLON_STYLES_RIGHT,
                showIf: (f) => rightHasScoreboard(f) && rightOnPylons(f),
            },
            {
                key: 'right_jumbotron_pylons_outside',
                label: 'Posts on the outside',
                type: 'toggle',
                showIf: (f) =>
                    rightHasScoreboard(f) &&
                    pylonsCanMoveOutside(
                        rightBackdrop(f),
                        rightStyle(f),
                        rightOnPylons(f),
                        f.right_jumbotron_over_building
                    ),
                help: 'Moves the posts to the outer edges of the board.',
            },
            {
                key: 'right_jumbotron_elevation',
                label: 'Height above ground',
                type: 'scale',
                min: 0,
                max: 1,
                step: 0.05,
                fallback: 0,
                showIf: (f) =>
                    rightHasScoreboard(f) &&
                    canRaise(
                        rightBackdrop(f),
                        rightStyle(f),
                        f.right_jumbotron_pylon_mount,
                        f.right_jumbotron_over_building
                    ),
                help: 'Raises it on taller pylons; over a crowd, turn on Mount on pylons first.',
            },
            {
                key: 'right_jumbotron_width',
                label: 'Scoreboard width',
                type: 'scale',
                min: 1,
                max: 2,
                step: 0.05,
                fallback: 1,
                showIf: (f) =>
                    rightHasScoreboard(f) && !(isNarrowFacility(rightBackdrop(f), rightStyle(f)) && rightBoardOver(f)),
                help: 'Wider boards add timeouts and possession beside each score.',
            },
            {
                key: 'right_jumbotron_size',
                label: 'Scoreboard size',
                type: 'scale',
                min: 0.7,
                max: 1.4,
                step: 0.05,
                fallback: 1,
                showIf: rightHasScoreboard,
            },
        ],
    },
];

export const formFrom = (sections, source, teamColors) => {
    const form = {};
    sections.forEach((section) =>
        section.fields.forEach((definition) => {
            if (definition.type === 'subheading' || definition.type === 'divider') {
                return;
            }
            form[definition.key] = emptyValue(definition, source, teamColors);
        })
    );
    return form;
};

export const payloadFrom = (sections, form) => {
    const payload = {};
    sections.forEach((section) =>
        section.fields.forEach((definition) => {
            if (definition.transient || definition.type === 'subheading' || definition.type === 'divider') {
                return;
            }
            const value = form[definition.key];
            if (definition.type === 'graphic') {
                const modeKey = definition.modeKey || 'helmet_logo_mode';
                const sourceKey = definition.sourceKey || 'helmet_logo_source';
                const hasKey = definition.hasKey || 'has_logo';
                payload[hasKey] = value !== 'NONE';
                if (value === 'NUMBER') {
                    payload[modeKey] = 'NUMBERS';
                } else if (value === 'UPLOADED') {
                    payload[modeKey] = 'UPLOAD';
                } else {
                    payload[modeKey] = 'MAIN';
                    payload[sourceKey] = value === 'SECONDARY' ? 'SECONDARY' : 'PRIMARY';
                }
                return;
            }
            if (definition.type === 'stripe') {
                const hasKey = definition.hasKey || 'has_stripe';
                const typeKey = definition.typeKey || 'stripe_type';
                payload[hasKey] = value !== 'NONE';
                if (value !== 'NONE') {
                    payload[typeKey] = value;
                }
                return;
            }
            writeGeneric(payload, definition, form);
        })
    );
    return payload;
};
