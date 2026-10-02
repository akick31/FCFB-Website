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
const GRAPHIC_OPTIONS = [
    { value: 'PRIMARY', label: 'Primary logo' },
    { value: 'SECONDARY', label: 'Secondary logo' },
    { value: 'UPLOADED', label: 'Uploaded logo' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'NONE', label: 'None' },
];
const FIELD_LOGO_SOURCES = [
    { value: 'CUSTOM', label: 'Custom URL' },
    { value: 'PRIMARY', label: 'Primary logo' },
    { value: 'SECONDARY', label: 'Secondary logo' },
];
const QUARTER_LOGO_SOURCES = [...FIELD_LOGO_SOURCES, { value: 'NONE', label: 'None (off)' }];
const WALL_LOGO_SOURCES = [{ value: 'NONE', label: 'Use midfield logo' }, ...FIELD_LOGO_SOURCES];
const STRIPE_TYPES = [
    { value: 'SINGLE', label: 'Single' },
    { value: 'TRIPLE', label: 'Triple' },
];

export const UNIFORM_SECTIONS = [
    {
        title: 'Helmet',
        fields: [
            { key: 'helmet_color', label: 'Shell color', type: 'color', defaultColor: 'primary' },
            { key: 'facemask_color', label: 'Facemask', type: 'color', defaultColor: '#FFFFFF' },
            { key: 'helmet_graphic', label: 'Graphic', type: 'graphic', options: GRAPHIC_OPTIONS },
            { key: 'helmet_number_color', label: 'Helmet number color', type: 'color', defaultColor: '#FFFFFF' },
            { key: 'has_stripe', label: 'Center stripe', type: 'toggle' },
            { key: 'stripe_type', label: 'Stripe style', type: 'select', options: STRIPE_TYPES },
            { key: 'stripe_color', label: 'Stripe color (inner)', type: 'optionalColor', defaultColor: 'secondary' },
            { key: 'secondary_stripe_color', label: 'Outer stripe color (triple)', type: 'optionalColor', defaultColor: 'tertiary' },
            { key: 'logo_url', label: 'Uploaded logo', type: 'logo', help: 'Used when the helmet mark is set to Uploaded logo.' },
            { key: 'logo_size', label: 'Logo size', type: 'scale', min: 0.5, max: 1.5, step: 0.05, fallback: 1 },
            { key: 'logo_x', label: 'Logo horizontal', type: 'scale', min: -0.2, max: 0.2, step: 0.01, fallback: 0 },
            { key: 'logo_y', label: 'Logo vertical', type: 'scale', min: -0.2, max: 0.2, step: 0.01, fallback: 0 },
            { key: 'logo_rotation', label: 'Logo rotation', type: 'scale', min: -180, max: 180, step: 5, fallback: 0, unit: '°', decimals: 0 },
        ],
    },
    {
        title: 'Jersey',
        fields: [
            { key: 'jersey_color', label: 'Jersey color', type: 'color', defaultColor: 'primary' },
            { key: 'number_color', label: 'Number color', type: 'color', defaultColor: '#FFFFFF' },
            { key: 'number_outline_color', label: 'Number outline', type: 'optionalColor' },
            { key: 'away_number_color', label: 'Away number color', type: 'optionalColor', defaultColor: 'primary', help: 'On the white road jersey.' },
            { key: 'away_number_outline_color', label: 'Away number outline', type: 'optionalColor' },
            { key: 'pants_color', label: 'Pants color', type: 'color', defaultColor: 'primary' },
        ],
    },
    {
        title: 'Secondary helmet',
        help: 'Worn by the away team when both shells clash. Blank fields copy the primary helmet.',
        fields: [
            { key: 'secondary_helmet_color', label: 'Shell color', type: 'optionalColor', defaultColor: 'secondary' },
            { key: 'alt_facemask_color', label: 'Facemask', type: 'optionalColor', help: 'Blank copies the primary facemask.' },
            { key: 'alt_helmet_graphic', label: 'Graphic', type: 'graphic', options: GRAPHIC_OPTIONS, modeKey: 'alt_helmet_logo_mode', sourceKey: 'alt_helmet_logo_source', hasKey: 'alt_has_logo' },
            { key: 'alt_helmet_number_color', label: 'Helmet number color', type: 'optionalColor' },
            { key: 'alt_has_stripe', label: 'Center stripe', type: 'toggle' },
            { key: 'alt_stripe_type', label: 'Stripe style', type: 'select', options: STRIPE_TYPES },
            { key: 'alt_stripe_color', label: 'Stripe color (inner)', type: 'optionalColor' },
            { key: 'alt_secondary_stripe_color', label: 'Outer stripe color (triple)', type: 'optionalColor' },
            { key: 'alt_logo_url', label: 'Uploaded logo', type: 'logo' },
            { key: 'alt_logo_size', label: 'Logo size', type: 'scale', min: 0.5, max: 1.5, step: 0.05, fallback: 1 },
            { key: 'alt_logo_x', label: 'Logo horizontal', type: 'scale', min: -0.2, max: 0.2, step: 0.01, fallback: 0 },
            { key: 'alt_logo_y', label: 'Logo vertical', type: 'scale', min: -0.2, max: 0.2, step: 0.01, fallback: 0 },
            { key: 'alt_logo_rotation', label: 'Logo rotation', type: 'scale', min: -180, max: 180, step: 5, fallback: 0, unit: '°', decimals: 0 },
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
            { key: 'end_zone_outline_enabled', label: 'Show text outline', type: 'toggle' },
            { key: 'end_zone_outline_color', label: 'End zone text outline', type: 'optionalColor', help: 'Blank picks a readable outline automatically.' },
            { key: 'end_zone_font', label: 'End zone font', type: 'select', options: END_ZONE_FONTS },
            { key: 'midfield_logo_source', label: 'Midfield logo source', type: 'select', options: FIELD_LOGO_SOURCES },
            { key: 'midfield_logo_url', label: 'Midfield logo (custom URL)', type: 'logo' },
            { key: 'quarter_logo_source', label: '25-yard logo source', type: 'select', options: QUARTER_LOGO_SOURCES },
            { key: 'quarter_logo_url', label: '25-yard logo (custom URL)', type: 'logo' },
            { key: 'recolor_conference_logo', label: 'Tint conference logo to team color', type: 'toggle', help: 'Recolors the conference logo on your field to your primary color.' },
        ],
    },
    {
        title: 'End zone text',
        fields: [
            { key: 'end_zone_text_left', label: 'Left end zone text', type: 'text', placeholder: 'Team name', help: 'Blank uses the team name.' },
            { key: 'end_zone_text_right', label: 'Right end zone text', type: 'text', placeholder: 'Team name' },
            { key: 'end_zone_logo_enabled', label: 'Show end zone logo', type: 'toggle', help: 'Draws a logo beside the end zone text.' },
            { key: 'end_zone_logo_source', label: 'End zone logo source', type: 'select', options: FIELD_LOGO_SOURCES },
            { key: 'end_zone_logo_url', label: 'End zone logo (custom URL)', type: 'logo' },
            { key: 'end_zone_logo_size', label: 'End zone logo size', type: 'scale', min: 0.4, max: 1, step: 0.05, fallback: 0.85 },
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
            { key: 'wall_logo_source', label: 'Wall logo', type: 'select', options: WALL_LOGO_SOURCES },
            { key: 'wall_logo_url', label: 'Wall logo (custom URL)', type: 'logo' },
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
    const key = definition.defaultColor;
    if (!key) return '';
    if (key === 'primary') return teamColors?.primary_color || '';
    if (key === 'secondary') return teamColors?.secondary_color || '';
    if (key === 'tertiary') return teamColors?.tertiary_color || '';
    return key;
};

const graphicFrom = (source, definition) => {
    const modeKey = definition.modeKey || 'helmet_logo_mode';
    const sourceKey = definition.sourceKey || 'helmet_logo_source';
    const hasKey = definition.hasKey || 'has_logo';
    if (source[hasKey] === false) return 'NONE';
    const mode = source[modeKey];
    if (mode === 'NUMBERS') return 'NUMBER';
    if (mode === 'UPLOAD') return 'UPLOADED';
    return source[sourceKey] === 'SECONDARY' ? 'SECONDARY' : 'PRIMARY';
};

const emptyValue = (definition, source, teamColors) => {
    const stored = source[definition.key];
    if (definition.type === 'graphic') return graphicFrom(source, definition);
    if (definition.type === 'toggle') return stored !== false;
    if (definition.type === 'scale') return stored ?? definition.fallback ?? 0;
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
        if (definition.type === 'graphic') {
            const modeKey = definition.modeKey || 'helmet_logo_mode';
            const sourceKey = definition.sourceKey || 'helmet_logo_source';
            const hasKey = definition.hasKey || 'has_logo';
            payload[hasKey] = value !== 'NONE';
            if (value === 'NUMBER') payload[modeKey] = 'NUMBERS';
            else if (value === 'UPLOADED') payload[modeKey] = 'UPLOAD';
            else { payload[modeKey] = 'MAIN'; payload[sourceKey] = value === 'SECONDARY' ? 'SECONDARY' : 'PRIMARY'; }
        } else if (definition.type === 'toggle') payload[definition.key] = value;
        else if (definition.type === 'scale') payload[definition.key] = Number(value);
        else payload[definition.key] = value === '' ? null : value;
    }));
    return payload;
};
