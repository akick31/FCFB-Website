import { readGeneric, writeGeneric } from '../../team/appearance/appearanceForm';

export { isVisible } from '../../team/appearance/appearanceForm';
const END_ZONE_LOGO_SOURCES = [
    { value: 'PRIMARY', label: 'Team logo' },
    { value: 'SECONDARY', label: 'Team secondary logo' },
    { value: 'CUSTOM', label: 'Custom URL' },
];
const ARROW_ALIGNS = [
    { value: 'CENTER', label: 'Centered' },
    { value: 'TOP', label: 'Top aligned' },
    { value: 'BOTTOM', label: 'Bottom aligned' },
];
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
const MODE_OPTIONS = [
    { value: 'NONE', label: 'None' },
    { value: 'BOTH', label: 'Both sides' },
    { value: 'DIFFERENT', label: 'Different per side' },
];
const TEAM_SLOT_OPTIONS = [
    { value: 'PRIMARY', label: 'Primary' },
    { value: 'SECONDARY', label: 'Secondary' },
    { value: 'TERTIARY', label: 'Tertiary' },
];
const redZoneModeOf = (source) => {
    if (source.left_red_zone_color || source.right_red_zone_color) return 'DIFFERENT';
    if (source.red_zone_border_color) return 'BOTH';
    return 'NONE';
};
const sidelineModeOf = (source) => {
    if (source.left_sideline_color || source.right_sideline_color) return 'DIFFERENT';
    if (source.sideline_accent_color) return 'BOTH';
    return 'NONE';
};

const turf = { key: 'turf_color', label: 'Turf color', type: 'color' };
const endZoneFont = { key: 'end_zone_font', label: 'End zone font', type: 'font' };
const wallDesign = { key: 'wall_design', label: 'Wall design', type: 'select', options: WALL_DESIGNS };
const wallColor = { key: 'wall_color', label: 'Wall color', type: 'optionalColor', help: 'White is not allowed. Blank uses the built-in look.' };
const wallText = { key: 'wall_text', label: 'Wall text', type: 'text', placeholder: 'Blank uses the built-in text' };
const wallTextOutline = { key: 'wall_text_outline_color', label: 'Wall text outline', type: 'optionalColor' };
const wallTextFont = { key: 'wall_text_font', label: 'Wall text font', type: 'font' };
const goalPostColor = { key: 'goal_post_color', label: 'Goal post color', type: 'color', resetColor: '#FFCD00' };
const goalPostStyle = { key: 'goal_post_style', label: 'Goal post style', type: 'select', options: GOAL_POST_STYLES };
const yardNumberOutline = { key: 'yard_number_outline_color', label: 'Yard number outline', type: 'optionalColor' };
const yardNumberOutlineWidth = { key: 'yard_number_outline_width', label: 'Yard number outline width', type: 'scale', min: 0.5, max: 3, step: 0.25, fallback: 1 };
const endZoneOutlineWidth = { key: 'end_zone_outline_width', label: 'End zone outline width', type: 'scale', min: 0.5, max: 3, step: 0.25, fallback: 1 };
const wallTextOutlineWidth = { key: 'wall_text_outline_width', label: 'Wall text outline width', type: 'scale', min: 0.5, max: 3, step: 0.25, fallback: 1 };
const yardNumberFont = { key: 'yard_number_font', label: 'Yard number font', type: 'font' };
const yardNumberArrowAlign = { key: 'yard_number_arrow_align', label: 'Direction arrow', type: 'select', options: ARROW_ALIGNS, default: 'TOP' };
const homeEndZoneFont = { key: 'left_end_zone_font', label: 'Home end zone font', type: 'font', allowDefault: true };
const awayEndZoneFont = { key: 'right_end_zone_font', label: 'Away end zone font', type: 'font', allowDefault: true };
const redZoneBorder = { key: 'red_zone_border_color', label: 'Red zone border', type: 'optionalColor' };

export const BOWL_SECTIONS = [
    {
        title: 'Field',
        fields: [
            turf,
            endZoneFont,
            endZoneOutlineWidth,
            {
                key: 'end_zone_fill',
                label: 'End zone fill',
                type: 'select',
                options: [
                    { value: 'PRIMARY', label: "Team's primary color" },
                    { value: 'SECONDARY', label: "Team's secondary color" },
                    { value: 'NONE', label: 'Bare turf' },
                ],
            },
            { key: 'show_conference_logos', label: 'Show conference logos', type: 'toggle' },
            { key: 'conference_logo_size', label: 'Conference logo size (25)', type: 'scale', min: 0.4, max: 2, step: 0.05, fallback: 1, showIf: (f) => f.show_conference_logos },
            { key: '_bowl_home_ez', label: 'Home end zone', type: 'subheading' },
            { key: 'left_end_zone_text', label: 'Text', type: 'text', placeholder: 'Team name' },
            { key: 'left_end_zone_logo_source', label: 'Logo', type: 'select', options: END_ZONE_LOGO_SOURCES },
            { key: 'left_end_zone_logo_url', label: 'Custom logo URL', type: 'logo', showIf: (f) => f.left_end_zone_logo_source === 'CUSTOM' },
            { key: 'home_ez_font_override', label: 'Override end zone font', type: 'toggle', transient: true, derivedFrom: 'left_end_zone_font' },
            { ...homeEndZoneFont, label: 'Font', showIf: (f) => f.home_ez_font_override },
            { key: '_bowl_away_ez', label: 'Away end zone', type: 'subheading' },
            { key: 'right_end_zone_text', label: 'Text', type: 'text', placeholder: 'Team name' },
            { key: 'right_end_zone_logo_source', label: 'Logo', type: 'select', options: END_ZONE_LOGO_SOURCES },
            { key: 'right_end_zone_logo_url', label: 'Custom logo URL', type: 'logo', showIf: (f) => f.right_end_zone_logo_source === 'CUSTOM' },
            { key: 'away_ez_font_override', label: 'Override end zone font', type: 'toggle', transient: true, derivedFrom: 'right_end_zone_font' },
            { ...awayEndZoneFont, label: 'Font', showIf: (f) => f.away_ez_font_override },
        ],
    },
    {
        title: 'Markings',
        fields: [
            {
                key: 'yard_number_source',
                label: 'Yard number outline source',
                type: 'select',
                options: [
                    { value: 'TEAM_PER_SIDE', label: 'Team defending each half' },
                    { value: 'FIXED', label: 'One fixed color' },
                ],
            },
            { key: 'yard_number_team_slot', label: 'Defending team color', type: 'select', options: TEAM_SLOT_OPTIONS, showIf: (f) => f.yard_number_source === 'TEAM_PER_SIDE' },
            { key: 'yard_number_outline_enabled', label: 'Yard number outline', type: 'toggle', transient: true, derivedFrom: 'yard_number_outline_color', showIf: (f) => f.yard_number_source === 'FIXED' },
            { key: 'yard_number_outline_color', label: 'Yard number outline color', type: 'colorToken', showIf: (f) => f.yard_number_source === 'FIXED' && f.yard_number_outline_enabled },
            yardNumberFont,
            yardNumberArrowAlign,
            yardNumberOutlineWidth,
            { key: 'left_oob_line_color', label: 'Home sideline accent', type: 'colorToken' },
            { key: 'right_oob_line_color', label: 'Away sideline accent', type: 'colorToken' },
            { key: 'red_zone_enabled', label: 'Red zone markers', type: 'toggle' },
            { key: 'red_zone_border_color', label: 'Red zone border', type: 'colorToken', help: 'Blank uses each defending team color.' },
            { key: 'midfield_border_enabled', label: 'Midfield (50) border', type: 'toggle', transient: true, derivedFrom: 'midfield_border_color' },
            { key: 'midfield_border_color', label: 'Midfield border color', type: 'colorToken', showIf: (f) => f.midfield_border_enabled },
        ],
    },
    {
        title: 'Wall',
        help: 'The wall color is the same on both ends; design and text can differ home vs away.',
        fields: [
            wallTextFont,
            wallColor,
            wallTextOutline,
            wallTextOutlineWidth,
            { ...wallDesign, label: 'Home wall design' },
            { ...wallText, label: 'Home wall text' },
            { key: 'right_wall_design', label: 'Away wall design', type: 'select', options: WALL_DESIGNS },
            { key: 'right_wall_text', label: 'Away wall text', type: 'text', placeholder: 'Same as home' },
        ],
    },
    { title: 'Goal post', fields: [goalPostColor, goalPostStyle] },
];

const postseasonField = {
    title: 'Field',
    fields: [
        turf,
        endZoneFont,
        endZoneOutlineWidth,
        { key: 'center_logo_url', label: 'Midfield logo', type: 'logo', help: 'Blank uses the built-in logo.' },
    ],
};
const postseasonMarkings = {
    title: 'Markings',
    fields: [
        {
            key: 'yard_number_source',
            label: 'Yard number outline',
            type: 'select',
            options: [
                { value: 'FIXED', label: 'One fixed color' },
                { value: 'TEAM_PER_SIDE', label: 'Each defending team' },
            ],
        },
        { key: 'yard_number_team_slot', label: 'Defending team color', type: 'select', options: TEAM_SLOT_OPTIONS, showIf: (f) => f.yard_number_source === 'TEAM_PER_SIDE' },
        { key: 'yard_number_outline_enabled', label: 'Yard number outline', type: 'toggle', transient: true, derivedFrom: 'yard_number_outline_color', showIf: (f) => f.yard_number_source !== 'TEAM_PER_SIDE' },
        { ...yardNumberOutline, label: 'Yard number outline color', showIf: (f) => f.yard_number_source !== 'TEAM_PER_SIDE' && f.yard_number_outline_enabled },
        yardNumberFont,
        yardNumberArrowAlign,
        yardNumberOutlineWidth,
        { key: 'red_zone_mode', label: 'Red zone', type: 'mode', options: MODE_OPTIONS, derive: redZoneModeOf, perSide: ['left_red_zone_color', 'right_red_zone_color'] },
        { ...redZoneBorder, label: 'Red zone color', showIf: (f) => f.red_zone_mode === 'BOTH' },
        { key: 'left_red_zone_color', label: 'Home red zone', type: 'colorToken', showIf: (f) => f.red_zone_mode === 'DIFFERENT' },
        { key: 'right_red_zone_color', label: 'Away red zone', type: 'colorToken', showIf: (f) => f.red_zone_mode === 'DIFFERENT' },
        { key: 'midfield_border_enabled', label: 'Midfield (50) border', type: 'toggle', transient: true, derivedFrom: 'midfield_border_color' },
        { key: 'midfield_border_color', label: 'Midfield border color', type: 'colorToken', showIf: (f) => f.midfield_border_enabled },
        { key: 'sideline_mode', label: 'Sideline accent', type: 'mode', options: MODE_OPTIONS, derive: sidelineModeOf, perSide: ['left_sideline_color', 'right_sideline_color'] },
        { key: 'sideline_accent_color', label: 'Sideline color', type: 'optionalColor', showIf: (f) => f.sideline_mode === 'BOTH' },
        { key: 'left_sideline_color', label: 'Home sideline', type: 'colorToken', showIf: (f) => f.sideline_mode === 'DIFFERENT' },
        { key: 'right_sideline_color', label: 'Away sideline', type: 'colorToken', showIf: (f) => f.sideline_mode === 'DIFFERENT' },
    ],
};
const postseasonWallAndPosts = [
    {
        title: 'Wall',
        help: 'The wall color is the same on both ends; design and text can differ home vs away.',
        fields: [
            wallTextFont,
            wallColor,
            wallTextOutline,
            wallTextOutlineWidth,
            { ...wallDesign, label: 'Home wall design' },
            { ...wallText, label: 'Home wall text' },
            { key: 'right_wall_design', label: 'Away wall design', type: 'select', options: WALL_DESIGNS },
            { key: 'right_wall_text', label: 'Away wall text', type: 'text', placeholder: 'Same as home' },
        ],
    },
    { title: 'Goal post', fields: [goalPostColor, goalPostStyle] },
];
const endZoneTextOnly = {
    title: 'End zones',
    help: 'Home is the left end zone, away is the right.',
    fields: [
        { key: '_home_ez', label: 'Home end zone', type: 'subheading' },
        { key: 'left_end_zone_text', label: 'Text', type: 'text', placeholder: 'Team name' },
        { key: 'home_ez_font_override', label: 'Override end zone font', type: 'toggle', transient: true, derivedFrom: 'left_end_zone_font' },
        { ...homeEndZoneFont, label: 'Font', showIf: (f) => f.home_ez_font_override },
        { key: '_away_ez', label: 'Away end zone', type: 'subheading' },
        { key: 'right_end_zone_text', label: 'Text', type: 'text', placeholder: 'Team name' },
        { key: 'away_ez_font_override', label: 'Override end zone font', type: 'toggle', transient: true, derivedFrom: 'right_end_zone_font' },
        { ...awayEndZoneFont, label: 'Font', showIf: (f) => f.away_ez_font_override },
    ],
};
const endZoneTextAndLogos = {
    title: 'End zones',
    help: 'Home is the left end zone, away is the right.',
    fields: [
        { key: '_home_ez', label: 'Home end zone', type: 'subheading' },
        { key: 'left_end_zone_text', label: 'Text', type: 'text', placeholder: 'Team name' },
        { key: 'left_end_zone_logo_source', label: 'Logo', type: 'select', options: END_ZONE_LOGO_SOURCES },
        { key: 'left_end_zone_logo_url', label: 'Custom logo URL', type: 'logo', showIf: (f) => f.left_end_zone_logo_source === 'CUSTOM' },
        { key: 'home_ez_font_override', label: 'Override end zone font', type: 'toggle', transient: true, derivedFrom: 'left_end_zone_font' },
        { ...homeEndZoneFont, label: 'Font', showIf: (f) => f.home_ez_font_override },
        { key: '_away_ez', label: 'Away end zone', type: 'subheading' },
        { key: 'right_end_zone_text', label: 'Text', type: 'text', placeholder: 'Team name' },
        { key: 'right_end_zone_logo_source', label: 'Logo', type: 'select', options: END_ZONE_LOGO_SOURCES },
        { key: 'right_end_zone_logo_url', label: 'Custom logo URL', type: 'logo', showIf: (f) => f.right_end_zone_logo_source === 'CUSTOM' },
        { key: 'away_ez_font_override', label: 'Override end zone font', type: 'toggle', transient: true, derivedFrom: 'right_end_zone_font' },
        { ...awayEndZoneFont, label: 'Font', showIf: (f) => f.away_ez_font_override },
    ],
};

// Conference championships: end-zone text + per-team logo choice.
export const CCG_SECTIONS = [postseasonField, endZoneTextAndLogos, postseasonMarkings, ...postseasonWallAndPosts];
// Playoff rounds: end-zone text only (the round logo fills the end zone automatically).
export const PLAYOFF_SECTIONS = [postseasonField, endZoneTextOnly, postseasonMarkings, ...postseasonWallAndPosts];
// National Championship: end-zone text is always the team name, so no end-zone section at all.
export const NC_SECTIONS = [postseasonField, postseasonMarkings, ...postseasonWallAndPosts];

const emptyValue = (definition, source) => {
    const stored = source[definition.key];
    if (definition.transient && definition.derivedFrom) {
        const derived = source[definition.derivedFrom];
        return derived !== null && derived !== undefined && derived !== '';
    }
    if (definition.type === 'mode') return definition.derive(source);
    if (definition.type === 'font') return stored ?? (definition.allowDefault ? '' : 'CLASSIC');
    return readGeneric(definition, stored, definition.default ?? '');
};

export const formFrom = (sections, source) => {
    const form = {};
    sections.forEach((section) => section.fields.forEach((definition) => {
        if (definition.type === 'subheading') return;
        form[definition.key] = emptyValue(definition, source);
    }));
    return form;
};

export const payloadFrom = (sections, form) => {
    const payload = {};
    sections.forEach((section) => section.fields.forEach((definition) => {
        if (definition.transient || definition.type === 'mode' || definition.type === 'subheading') return;
        writeGeneric(payload, definition, form);
    }));
    return payload;
};
