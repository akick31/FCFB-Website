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
const LOGO_SOURCES = [
    { value: 'PRIMARY', label: 'Primary logo' },
    { value: 'SECONDARY', label: 'Secondary logo' },
];
const FIELD_LOGO_SOURCES = [
    { value: 'CUSTOM', label: 'Custom URL' },
    { value: 'PRIMARY', label: 'Primary logo' },
    { value: 'SECONDARY', label: 'Secondary logo' },
];
const HELMET_LOGO_MODES = [
    { value: 'MAIN', label: 'Team logo' },
    { value: 'UPLOAD', label: 'Uploaded logo' },
    { value: 'NUMBERS', label: 'Number' },
];

export const UNIFORM_SECTIONS = [
    {
        title: 'Helmet',
        fields: [
            { key: 'helmet_color', label: 'Shell color', type: 'color', defaultColor: 'primary' },
            { key: 'secondary_helmet_color', label: 'Alternate shell', type: 'optionalColor', help: 'Worn by the away team when both shells clash.' },
            { key: 'facemask_color', label: 'Facemask', type: 'color', defaultColor: '#FFFFFF' },
            { key: 'helmet_logo_mode', label: 'Graphic', type: 'select', options: HELMET_LOGO_MODES },
            { key: 'helmet_logo_source', label: 'Helmet logo', type: 'select', options: LOGO_SOURCES, help: 'Which team logo the helmet uses when the graphic is a logo.' },
            { key: 'has_logo', label: 'Show logo/number', type: 'toggle' },
            { key: 'helmet_number_color', label: 'Helmet number color', type: 'color', defaultColor: '#FFFFFF' },
            { key: 'has_stripe', label: 'Center stripe', type: 'toggle' },
            { key: 'stripe_color', label: 'Stripe color', type: 'optionalColor', defaultColor: 'secondary' },
            { key: 'logo_url', label: 'Uploaded logo', type: 'logo', help: 'Used when the helmet mark is set to Uploaded logo.' },
            { key: 'logo_size', label: 'Logo size', type: 'scale', min: 0.5, max: 1.5, step: 0.05, fallback: 1 },
            { key: 'logo_x', label: 'Logo horizontal', type: 'scale', min: -0.2, max: 0.2, step: 0.01, fallback: 0 },
            { key: 'logo_y', label: 'Logo vertical', type: 'scale', min: -0.2, max: 0.2, step: 0.01, fallback: 0 },
        ],
    },
    {
        title: 'Jersey',
        fields: [
            { key: 'jersey_color', label: 'Jersey color', type: 'color', defaultColor: 'primary' },
            { key: 'number_color', label: 'Number color', type: 'color', defaultColor: '#FFFFFF' },
            { key: 'number_outline_color', label: 'Number outline', type: 'optionalColor' },
            { key: 'pants_color', label: 'Pants color', type: 'color', defaultColor: 'primary' },
        ],
    },
];

export const TEAM_FIELD_SECTIONS = [
    {
        title: 'Field',
        fields: [
            { key: 'turf_color', label: 'Turf color', type: 'color' },
            { key: 'end_zone_color', label: 'End zone fill', type: 'optionalColor', help: 'Blank uses your primary color.' },
            { key: 'end_zone_text_color', label: 'End zone text', type: 'optionalColor', defaultColor: '#FFFFFF' },
            { key: 'end_zone_outline_color', label: 'End zone text outline', type: 'optionalColor' },
            { key: 'end_zone_font', label: 'End zone font', type: 'select', options: END_ZONE_FONTS },
            { key: 'midfield_logo_source', label: 'Midfield logo source', type: 'select', options: FIELD_LOGO_SOURCES },
            { key: 'midfield_logo_url', label: 'Midfield logo (custom URL)', type: 'logo' },
            { key: 'quarter_logo_source', label: '25-yard logo source', type: 'select', options: FIELD_LOGO_SOURCES },
            { key: 'quarter_logo_url', label: '25-yard logo (custom URL)', type: 'logo' },
        ],
    },
    {
        title: 'Markings',
        fields: [
            { key: 'field_number_outline_color', label: 'Yard number outline', type: 'optionalColor' },
            { key: 'red_zone_border_color', label: 'Red zone border', type: 'optionalColor' },
            { key: 'oob_line_color', label: 'Sideline accent', type: 'optionalColor' },
        ],
    },
    {
        title: 'Wall',
        fields: [
            { key: 'wall_design', label: 'Wall design', type: 'select', options: WALL_DESIGNS },
            { key: 'wall_color', label: 'Wall color', type: 'optionalColor', help: 'White is not allowed. Blank uses the built-in look.' },
            { key: 'wall_text', label: 'Wall text', type: 'text', placeholder: 'Blank uses the built-in text' },
            { key: 'wall_text_outline_color', label: 'Wall text outline', type: 'optionalColor' },
        ],
    },
    {
        title: 'Goal post',
        fields: [
            { key: 'goal_post_color', label: 'Goal post color', type: 'color' },
            { key: 'goal_post_style', label: 'Goal post style', type: 'select', options: GOAL_POST_STYLES },
        ],
    },
];

const resolveDefault = (definition, teamColors) => {
    const key = definition.defaultColor;
    if (!key) return '';
    if (key === 'primary') return teamColors?.primary_color || '';
    if (key === 'secondary') return teamColors?.secondary_color || '';
    if (key === 'tertiary') return teamColors?.tertiary_color || '';
    return key;
};

const emptyValue = (definition, source, teamColors) => {
    const stored = source[definition.key];
    if (definition.type === 'toggle') return stored !== false;
    if (definition.type === 'scale') return stored ?? definition.fallback ?? 1;
    if (stored === null || stored === undefined || stored === '') return resolveDefault(definition, teamColors);
    return stored;
};

export const formFrom = (sections, source, teamColors) => {
    const form = {};
    sections.forEach((section) => section.fields.forEach((definition) => {
        form[definition.key] = emptyValue(definition, source, teamColors);
    }));
    return form;
};

export const payloadFrom = (sections, form) => {
    const payload = {};
    sections.forEach((section) => section.fields.forEach((definition) => {
        const value = form[definition.key];
        if (definition.type === 'toggle') payload[definition.key] = value;
        else if (definition.type === 'scale') payload[definition.key] = Number(value);
        else payload[definition.key] = value === '' ? null : value;
    }));
    return payload;
};
