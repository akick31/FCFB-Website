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
const HELMET_LOGO_MODES = [
    { value: 'MAIN', label: 'Team logo' },
    { value: 'UPLOAD', label: 'Uploaded logo' },
    { value: 'NUMBERS', label: 'Number' },
];

export const UNIFORM_SECTIONS = [
    {
        title: 'Helmet',
        fields: [
            { key: 'helmet_color', label: 'Shell color', type: 'color' },
            { key: 'secondary_helmet_color', label: 'Alternate shell', type: 'optionalColor', help: 'Worn by the away team when both shells clash.' },
            { key: 'facemask_color', label: 'Facemask', type: 'color' },
            { key: 'helmet_logo_mode', label: 'Helmet mark', type: 'select', options: HELMET_LOGO_MODES },
            { key: 'has_logo', label: 'Show a mark', type: 'toggle' },
            { key: 'helmet_number_color', label: 'Helmet number color', type: 'color' },
            { key: 'has_stripe', label: 'Center stripe', type: 'toggle' },
            { key: 'stripe_color', label: 'Stripe color', type: 'optionalColor' },
            { key: 'logo_url', label: 'Uploaded logo', type: 'logo', help: 'Used when the helmet mark is set to Uploaded logo.' },
        ],
    },
    {
        title: 'Jersey',
        fields: [
            { key: 'jersey_color', label: 'Jersey color', type: 'color' },
            { key: 'number_color', label: 'Number color', type: 'color' },
            { key: 'number_outline_color', label: 'Number outline', type: 'optionalColor' },
            { key: 'pants_color', label: 'Pants color', type: 'color' },
            { key: 'tertiary_color', label: 'Tertiary accent', type: 'optionalColor' },
        ],
    },
];

export const TEAM_FIELD_SECTIONS = [
    {
        title: 'Field',
        fields: [
            { key: 'turf_color', label: 'Turf color', type: 'color' },
            { key: 'end_zone_color', label: 'End zone fill', type: 'optionalColor', help: 'Blank uses your primary color.' },
            { key: 'end_zone_font', label: 'End zone font', type: 'select', options: END_ZONE_FONTS },
            { key: 'midfield_logo_url', label: 'Midfield logo', type: 'logo' },
            { key: 'quarter_logo_url', label: '25-yard logo', type: 'logo' },
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
