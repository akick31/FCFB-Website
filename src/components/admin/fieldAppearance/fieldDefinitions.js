const END_ZONE_FONTS = [
    { value: 'CLASSIC', label: 'Classic' },
    { value: 'BLOCK', label: 'Block (collegiate)' },
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

const turf = { key: 'turf_color', label: 'Turf color', type: 'color' };
const endZoneFont = { key: 'end_zone_font', label: 'End zone font', type: 'select', options: END_ZONE_FONTS };
const wallDesign = { key: 'wall_design', label: 'Wall design', type: 'select', options: WALL_DESIGNS };
const wallColor = { key: 'wall_color', label: 'Wall color', type: 'optionalColor', help: 'White is not allowed. Blank uses the built-in look.' };
const wallText = { key: 'wall_text', label: 'Wall text', type: 'text', placeholder: 'Blank uses the built-in text' };
const wallTextOutline = { key: 'wall_text_outline_color', label: 'Wall text outline', type: 'optionalColor' };
const goalPostColor = { key: 'goal_post_color', label: 'Goal post color', type: 'color', resetColor: '#FFCD00' };
const goalPostStyle = { key: 'goal_post_style', label: 'Goal post style', type: 'select', options: GOAL_POST_STYLES };
const yardNumberOutline = { key: 'yard_number_outline_color', label: 'Yard number outline', type: 'optionalColor' };
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
            { key: 'left_end_zone_logo_url', label: 'Home endzone logo URL', type: 'logo' },
            { key: 'right_end_zone_text', label: 'Away endzone text', type: 'text', placeholder: 'Team name' },
            { key: 'right_end_zone_logo_source', label: 'Away endzone logo', type: 'select', options: END_ZONE_LOGO_SOURCES },
            { key: 'right_end_zone_logo_url', label: 'Away endzone logo URL', type: 'logo' },
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
            { ...yardNumberOutline, help: 'Used when the source is one fixed color.' },
            { key: 'left_oob_line_color', label: 'Home sideline accent', type: 'optionalColor' },
            { key: 'right_oob_line_color', label: 'Away sideline accent', type: 'optionalColor' },
            { key: 'red_zone_enabled', label: 'Red zone markers', type: 'toggle' },
            { ...redZoneBorder, help: 'Blank uses each defending team color.' },
        ],
    },
    { title: 'Wall', fields: [wallDesign, wallColor, wallText, wallTextOutline] },
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
        yardNumberOutline,
        { ...redZoneBorder, label: 'Red zone (both sides)' },
        { key: 'left_red_zone_color', label: 'Left red zone', type: 'colorToken' },
        { key: 'right_red_zone_color', label: 'Right red zone', type: 'colorToken' },
        { key: 'sideline_accent_color', label: 'Sideline accent (both sides)', type: 'optionalColor' },
        { key: 'left_sideline_color', label: 'Left sideline', type: 'colorToken' },
        { key: 'right_sideline_color', label: 'Right sideline', type: 'colorToken' },
    ],
};
const postseasonWallAndPosts = [
    { title: 'Wall', fields: [wallDesign, wallColor, wallText, wallTextOutline] },
    { title: 'Goal post', fields: [goalPostColor, goalPostStyle] },
];
const endZoneTextOnly = {
    title: 'End zones',
    fields: [
        { key: 'left_end_zone_text', label: 'Left end zone text', type: 'text', placeholder: 'Team name' },
        { key: 'right_end_zone_text', label: 'Right end zone text', type: 'text', placeholder: 'Team name' },
    ],
};
const endZoneTextAndLogos = {
    title: 'End zones',
    fields: [
        { key: 'left_end_zone_text', label: 'Left end zone text', type: 'text', placeholder: 'Team name' },
        { key: 'left_end_zone_logo_source', label: 'Left end zone logo', type: 'select', options: END_ZONE_LOGO_SOURCES },
        { key: 'left_end_zone_logo_url', label: 'Left end zone logo URL', type: 'logo' },
        { key: 'right_end_zone_text', label: 'Right end zone text', type: 'text', placeholder: 'Team name' },
        { key: 'right_end_zone_logo_source', label: 'Right end zone logo', type: 'select', options: END_ZONE_LOGO_SOURCES },
        { key: 'right_end_zone_logo_url', label: 'Right end zone logo URL', type: 'logo' },
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
    if (definition.type === 'toggle') return stored !== false;
    return stored ?? '';
};

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
        const value = form[definition.key];
        payload[definition.key] = definition.type === 'toggle' ? value : (value === '' ? null : value);
    }));
    return payload;
};
