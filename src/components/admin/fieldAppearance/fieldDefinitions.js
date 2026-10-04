const END_ZONE_FONTS = [
    { value: 'CLASSIC', label: 'Classic' },
    { value: 'BLOCK', label: 'Block' },
    { value: 'SANS', label: 'Sans' },
    { value: 'SERIF', label: 'Serif' },
    { value: 'SLAB', label: 'Slab serif' },
    { value: 'CONDENSED', label: 'Condensed' },
    { value: 'IMPACT', label: 'Impact' },
    { value: 'GEORGIA', label: 'Georgia' },
    { value: 'TYPEWRITER', label: 'Typewriter' },
    { value: 'MONOSPACE', label: 'Monospace' },
];
const END_ZONE_LOGO_SOURCES = [
    { value: 'PRIMARY', label: 'Team logo' },
    { value: 'SECONDARY', label: 'Team secondary logo' },
    { value: 'CUSTOM', label: 'Custom URL' },
];
const END_ZONE_FONTS_WITH_DEFAULT = [{ value: '', label: 'Use default' }, ...END_ZONE_FONTS];
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
const endZoneFont = { key: 'end_zone_font', label: 'End zone font', type: 'select', options: END_ZONE_FONTS };
const wallDesign = { key: 'wall_design', label: 'Wall design', type: 'select', options: WALL_DESIGNS };
const wallColor = { key: 'wall_color', label: 'Wall color', type: 'optionalColor', help: 'White is not allowed. Blank uses the built-in look.' };
const wallText = { key: 'wall_text', label: 'Wall text', type: 'text', placeholder: 'Blank uses the built-in text' };
const wallTextOutline = { key: 'wall_text_outline_color', label: 'Wall text outline', type: 'optionalColor' };
const goalPostColor = { key: 'goal_post_color', label: 'Goal post color', type: 'color', resetColor: '#FFCD00' };
const goalPostStyle = { key: 'goal_post_style', label: 'Goal post style', type: 'select', options: GOAL_POST_STYLES };
const yardNumberOutline = { key: 'yard_number_outline_color', label: 'Yard number outline', type: 'optionalColor' };
const yardNumberFont = { key: 'yard_number_font', label: 'Yard number font', type: 'select', options: END_ZONE_FONTS };
const homeEndZoneFont = { key: 'left_end_zone_font', label: 'Home end zone font', type: 'select', options: END_ZONE_FONTS_WITH_DEFAULT };
const awayEndZoneFont = { key: 'right_end_zone_font', label: 'Away end zone font', type: 'select', options: END_ZONE_FONTS_WITH_DEFAULT };
const redZoneBorder = { key: 'red_zone_border_color', label: 'Red zone border', type: 'optionalColor' };

export const BOWL_SECTIONS = [
    {
        title: 'Field',
        fields: [
            turf,
            endZoneFont,
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
            { key: 'left_end_zone_text', label: 'Home endzone text', type: 'text', placeholder: 'Team name' },
            { key: 'left_end_zone_logo_source', label: 'Home endzone logo', type: 'select', options: END_ZONE_LOGO_SOURCES },
            { key: 'left_end_zone_logo_url', label: 'Home endzone logo URL', type: 'logo', showIf: (f) => f.left_end_zone_logo_source === 'CUSTOM' },
            { ...homeEndZoneFont, label: 'Home endzone font' },
            { key: 'right_end_zone_text', label: 'Away endzone text', type: 'text', placeholder: 'Team name' },
            { key: 'right_end_zone_logo_source', label: 'Away endzone logo', type: 'select', options: END_ZONE_LOGO_SOURCES },
            { key: 'right_end_zone_logo_url', label: 'Away endzone logo URL', type: 'logo', showIf: (f) => f.right_end_zone_logo_source === 'CUSTOM' },
            { ...awayEndZoneFont, label: 'Away endzone font' },
            { key: 'show_conference_logos', label: 'Show conference logos', type: 'toggle' },
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
            { ...yardNumberOutline, label: 'Yard number outline color', showIf: (f) => f.yard_number_source === 'FIXED' },
            yardNumberFont,
            { key: 'left_oob_line_color', label: 'Home sideline accent', type: 'optionalColor' },
            { key: 'right_oob_line_color', label: 'Away sideline accent', type: 'optionalColor' },
            { key: 'red_zone_enabled', label: 'Red zone markers', type: 'toggle' },
            { ...redZoneBorder, help: 'Blank uses each defending team color.' },
        ],
    },
    {
        title: 'Wall',
        help: 'The wall color is the same on both ends; design and text can differ home vs away.',
        fields: [
            wallColor,
            wallTextOutline,
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
        { ...yardNumberOutline, label: 'Yard number outline color', showIf: (f) => f.yard_number_source !== 'TEAM_PER_SIDE' },
        yardNumberFont,
        { key: 'red_zone_mode', label: 'Red zone', type: 'mode', options: MODE_OPTIONS, derive: redZoneModeOf },
        { ...redZoneBorder, label: 'Red zone color', showIf: (f) => f.red_zone_mode === 'BOTH' },
        { key: 'left_red_zone_color', label: 'Home red zone', type: 'colorToken', showIf: (f) => f.red_zone_mode === 'DIFFERENT' },
        { key: 'right_red_zone_color', label: 'Away red zone', type: 'colorToken', showIf: (f) => f.red_zone_mode === 'DIFFERENT' },
        { key: 'sideline_mode', label: 'Sideline accent', type: 'mode', options: MODE_OPTIONS, derive: sidelineModeOf },
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
            wallColor,
            wallTextOutline,
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
        { key: 'left_end_zone_text', label: 'Home end zone text', type: 'text', placeholder: 'Team name' },
        { ...homeEndZoneFont },
        { key: 'right_end_zone_text', label: 'Away end zone text', type: 'text', placeholder: 'Team name' },
        { ...awayEndZoneFont },
    ],
};
const endZoneTextAndLogos = {
    title: 'End zones',
    help: 'Home is the left end zone, away is the right.',
    fields: [
        { key: 'left_end_zone_text', label: 'Home end zone text', type: 'text', placeholder: 'Team name' },
        { key: 'left_end_zone_logo_source', label: 'Home end zone logo', type: 'select', options: END_ZONE_LOGO_SOURCES },
        { key: 'left_end_zone_logo_url', label: 'Home end zone logo URL', type: 'logo', showIf: (f) => f.left_end_zone_logo_source === 'CUSTOM' },
        { ...homeEndZoneFont },
        { key: 'right_end_zone_text', label: 'Away end zone text', type: 'text', placeholder: 'Team name' },
        { key: 'right_end_zone_logo_source', label: 'Away end zone logo', type: 'select', options: END_ZONE_LOGO_SOURCES },
        { key: 'right_end_zone_logo_url', label: 'Away end zone logo URL', type: 'logo', showIf: (f) => f.right_end_zone_logo_source === 'CUSTOM' },
        { ...awayEndZoneFont },
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
    if (definition.type === 'mode') return definition.derive(source);
    if (definition.type === 'toggle') return stored !== false;
    return stored ?? '';
};

export const isVisible = (definition, form) => !definition.showIf || definition.showIf(form);

export const formFrom = (sections, source) => {
    const form = {};
    sections.forEach((section) => section.fields.forEach((definition) => {
        form[definition.key] = emptyValue(definition, source);
    }));
    return form;
};

export const payloadFrom = (sections, form) => {
    const payload = {};
    sections.forEach((section) => section.fields.forEach((definition) => {
        if (definition.type === 'mode') return;
        if (!isVisible(definition, form)) { payload[definition.key] = null; return; }
        const value = form[definition.key];
        payload[definition.key] = definition.type === 'toggle' ? value : (value === '' ? null : value);
    }));
    return payload;
};
