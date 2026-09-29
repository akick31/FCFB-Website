const END_ZONE_FONTS = ['CLASSIC', 'SANS', 'SERIF', 'MONOSPACE'].map((value) => ({ value, label: value }));
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
const goalPostColor = { key: 'goal_post_color', label: 'Goal post color', type: 'color' };
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
            { key: 'left_end_zone_logo_url', label: 'Home end zone wordmark', type: 'logo' },
            { key: 'right_end_zone_logo_url', label: 'Away end zone wordmark', type: 'logo' },
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

export const POSTSEASON_SECTIONS = [
    {
        title: 'Field',
        fields: [
            turf,
            endZoneFont,
            { key: 'center_logo_url', label: 'Midfield logo', type: 'logo', help: 'Blank uses the built-in logo.' },
        ],
    },
    {
        title: 'Markings',
        fields: [
            yardNumberOutline,
            redZoneBorder,
            { key: 'sideline_accent_color', label: 'Sideline accent', type: 'optionalColor' },
        ],
    },
    { title: 'Wall', fields: [wallDesign, wallColor, wallText, wallTextOutline] },
    { title: 'Goal post', fields: [goalPostColor, goalPostStyle] },
];

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
