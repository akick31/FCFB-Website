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
const WALL_LOGO_SOURCES = [{ value: 'NONE', label: 'Use midfield logo' }, ...FIELD_LOGO_SOURCES];
const WALL_LOGO_SOURCES_RIGHT = [{ value: '', label: 'Match left' }, ...WALL_LOGO_SOURCES];

export const UNIFORM_SECTIONS = [
    {
        title: 'Helmet',
        fields: [
            { key: 'helmet_color', label: 'Shell color', type: 'color', defaultColor: 'primary' },
            { key: 'facemask_color', label: 'Facemask', type: 'color', defaultColor: '#FFFFFF' },
            { key: 'helmet_graphic', label: 'Graphic', type: 'graphic', options: GRAPHIC_OPTIONS },
            { key: 'helmet_number_color', label: 'Helmet number color', type: 'color', defaultColor: '#FFFFFF', showIf: (f) => f.helmet_graphic === 'NUMBER' },
            { key: 'helmet_number_font', label: 'Helmet number font', type: 'font', allowDefault: true, showIf: (f) => f.helmet_graphic === 'NUMBER' },
            { key: 'stripe_style', label: 'Center stripe', type: 'stripe', options: STRIPE_STYLES },
            { key: 'stripe_color', label: 'Stripe color', type: 'optionalColor', defaultColor: 'secondary', showIf: (f) => f.stripe_style !== 'NONE' },
            { key: 'secondary_stripe_color', label: 'Outer stripe color', type: 'optionalColor', defaultColor: 'tertiary', showIf: (f) => TRIPLE_STYLES.includes(f.stripe_style) },
            { key: 'logo_url', label: 'Custom logo URL', type: 'logo', showIf: (f) => f.helmet_graphic === 'UPLOADED' },
            { key: 'logo_size', label: 'Logo size', type: 'scale', min: 0.5, max: 2, step: 0.05, fallback: 1 },
            { key: 'logo_x', label: 'Logo horizontal', type: 'scale', min: -0.2, max: 0.2, step: 0.01, fallback: 0 },
            { key: 'logo_y', label: 'Logo vertical', type: 'scale', min: -0.2, max: 0.2, step: 0.01, fallback: 0 },
            { key: 'logo_rotation', label: 'Logo rotation', type: 'scale', min: -180, max: 180, step: 1, fallback: 0, unit: '°', decimals: 0 },
        ],
    },
    {
        title: 'Jersey',
        fields: [
            { key: 'jersey_number_font', label: 'Number font', type: 'font', allowDefault: true },
            { key: '_home_jersey_heading', label: 'Home', type: 'subheading' },
            { key: 'jersey_color', label: 'Jersey color', type: 'color', defaultColor: 'primary' },
            { key: 'number_color', label: 'Number color', type: 'color', defaultColor: '#FFFFFF' },
            { key: 'number_outline_enabled', label: 'Number outline', type: 'toggle', transient: true, derivedFrom: 'number_outline_color' },
            { key: 'number_outline_color', label: 'Outline color', type: 'color', defaultColor: 'secondary', showIf: (f) => f.number_outline_enabled },
            { key: 'number_top_text', label: 'Text above number', type: 'text', placeholder: 'Optional', maxLength: 32 },
            { key: 'pants_color', label: 'Pants color', type: 'color', defaultColor: 'primary' },
            { key: '_away_jersey_heading', label: 'Away', type: 'subheading' },
            { key: 'away_number_color', label: 'Number color', type: 'optionalColor', defaultColor: 'primary', help: 'On the white road jersey.' },
            { key: 'away_number_outline_enabled', label: 'Number outline', type: 'toggle', transient: true, derivedFrom: 'away_number_outline_color' },
            { key: 'away_number_outline_color', label: 'Outline color', type: 'color', defaultColor: 'primary', showIf: (f) => f.away_number_outline_enabled },
            { key: 'away_number_top_text', label: 'Text above number', type: 'text', placeholder: 'Optional', maxLength: 32, fallbackKey: 'number_top_text', preserveEmpty: true, help: 'Blank hides text on the away jersey.' },
            { key: 'away_pants_color', label: 'Pants color', type: 'optionalColor', defaultColor: 'primary', help: 'Blank matches home.' },
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
            { key: 'alt_helmet_graphic', label: 'Graphic', type: 'graphic', options: GRAPHIC_OPTIONS, modeKey: 'alt_helmet_logo_mode', sourceKey: 'alt_helmet_logo_source', hasKey: 'alt_has_logo' },
            { key: 'alt_helmet_number_color', label: 'Helmet number color', type: 'color', defaultColor: '#FFFFFF', showIf: (f) => f.alt_helmet_graphic === 'NUMBER' },
            { key: 'alt_stripe_style', label: 'Center stripe', type: 'stripe', options: STRIPE_STYLES, hasKey: 'alt_has_stripe', typeKey: 'alt_stripe_type' },
            { key: 'alt_stripe_color', label: 'Stripe color', type: 'optionalColor', defaultColor: 'secondary', showIf: (f) => f.alt_stripe_style !== 'NONE' },
            { key: 'alt_secondary_stripe_color', label: 'Outer stripe color', type: 'optionalColor', defaultColor: 'tertiary', showIf: (f) => TRIPLE_STYLES.includes(f.alt_stripe_style) },
            { key: 'alt_logo_url', label: 'Custom logo URL', type: 'logo', showIf: (f) => f.alt_helmet_graphic === 'UPLOADED' },
            { key: 'alt_logo_size', label: 'Logo size', type: 'scale', min: 0.5, max: 2, step: 0.05, fallback: 1 },
            { key: 'alt_logo_x', label: 'Logo horizontal', type: 'scale', min: -0.2, max: 0.2, step: 0.01, fallback: 0 },
            { key: 'alt_logo_y', label: 'Logo vertical', type: 'scale', min: -0.2, max: 0.2, step: 0.01, fallback: 0 },
            { key: 'alt_logo_rotation', label: 'Logo rotation', type: 'scale', min: -180, max: 180, step: 1, fallback: 0, unit: '°', decimals: 0 },
        ],
    },
];

export const TEAM_FIELD_SECTIONS = [
    {
        title: 'Field',
        fields: [
            { key: 'turf_color', label: 'Turf color', type: 'color' },
            { key: 'midfield_logo_source', label: 'Midfield logo source', type: 'select', options: FIELD_LOGO_SOURCES },
            { key: 'midfield_logo_url', label: 'Custom logo URL', type: 'logo', showIf: (f) => f.midfield_logo_source === 'CUSTOM' },
            { key: 'midfield_logo_size', label: 'Midfield logo size', type: 'scale', min: 0.4, max: 2, step: 0.05, fallback: 1 },
            { key: 'quarter_logo_source', label: '25-yard logo source', type: 'select', options: QUARTER_LOGO_SOURCES },
            { key: 'quarter_logo_url', label: 'Custom logo URL', type: 'logo', showIf: (f) => f.quarter_logo_source === 'CUSTOM' },
            { key: 'conference_logo_size', label: 'Conference logo size (25)', type: 'scale', min: 0.4, max: 2, step: 0.05, fallback: 1 },
            { key: 'conference_logo_color_map', label: 'Conference logo colors', type: 'conferenceColors', help: 'Recolor parts of your conference logo to your team colors. Unmapped parts keep their original color.' },
        ],
    },
    {
        title: 'End zones',
        fields: [
            { key: 'end_zone_color', label: 'End zone fill', type: 'optionalColor', fullWidth: true, help: 'Blank leaves the end zone as bare turf (no fill).' },
            { key: 'end_zone_font', label: 'End zone font', type: 'font', fullWidth: true, help: 'Used on both end zones.' },
            { key: 'end_zone_text_color', label: 'End zone text color', type: 'optionalColor', defaultColor: '#FFFFFF' },
            { key: 'end_zone_outline_enabled', label: 'Show text outline', type: 'toggle' },
            { key: 'end_zone_outline_color', label: 'Text outline color', type: 'optionalColor', help: 'Blank picks a readable outline automatically.', showIf: (f) => f.end_zone_outline_enabled },
            { key: 'end_zone_outline_width', label: 'Text outline width', type: 'scale', min: 0.5, max: 3, step: 0.25, fallback: 1, showIf: (f) => f.end_zone_outline_enabled },
            { key: '_ez_logo_heading', label: 'Logo', type: 'subheading' },
            { key: 'end_zone_logo_enabled', label: 'Show end zone logo', type: 'toggle', help: 'Draws a logo beside the end zone text.' },
            { key: 'end_zone_logo_source', label: 'Logo source', type: 'select', options: FIELD_LOGO_SOURCES, showIf: (f) => f.end_zone_logo_enabled },
            { key: 'end_zone_logo_url', label: 'Custom logo URL', type: 'logo', showIf: (f) => f.end_zone_logo_enabled && f.end_zone_logo_source === 'CUSTOM' },
            { key: 'end_zone_logo_size', label: 'Logo size', type: 'scale', min: 0.4, max: 1, step: 0.05, fallback: 0.85, showIf: (f) => f.end_zone_logo_enabled },
            { key: '_left_ez_heading', label: 'Left end zone', type: 'subheading' },
            { key: 'end_zone_text_left', label: 'Text', type: 'text', placeholder: 'Team name', help: 'Blank uses the team name.' },
            { key: '_right_ez_heading', label: 'Right end zone', type: 'subheading' },
            { key: 'end_zone_text_right', label: 'Text', type: 'text', placeholder: 'Team name' },
        ],
    },
    {
        title: 'Markings',
        fields: [
            { key: 'field_number_outline_enabled', label: 'Yard number outline', type: 'toggle', transient: true, derivedFrom: 'field_number_outline_color' },
            { key: 'field_number_outline_color', label: 'Yard number outline color', type: 'color', defaultColor: 'secondary', showIf: (f) => f.field_number_outline_enabled, rowSpan: 2 },
            { key: 'yard_number_font', label: 'Yard number font', type: 'font', rowSpan: 2 },
            { key: 'yard_number_arrow_align', label: 'Direction arrow', type: 'select', options: ARROW_ALIGNS, default: 'TOP' },
            { key: 'yard_number_outline_width', label: 'Yard number outline width', type: 'scale', min: 0.5, max: 3, step: 0.25, fallback: 1, showIf: (f) => f.field_number_outline_enabled },
            { key: '_red_zone_divider', type: 'divider' },
            { key: 'red_zone_border_enabled', label: 'Red zone border', type: 'toggle', transient: true, derivedFrom: 'red_zone_border_color' },
            { key: 'red_zone_border_color', label: 'Red zone border color', type: 'color', defaultColor: 'secondary', showIf: (f) => f.red_zone_border_enabled },
            { key: '_midfield_divider', type: 'divider' },
            { key: 'midfield_border_enabled', label: 'Midfield (50) border', type: 'toggle', transient: true, derivedFrom: 'midfield_border_color' },
            { key: 'midfield_border_color', label: 'Midfield border color', type: 'color', defaultColor: 'secondary', showIf: (f) => f.midfield_border_enabled },
            { key: '_sideline_divider', type: 'divider' },
            { key: 'sideline_accent_enabled', label: 'Sideline accent', type: 'toggle', transient: true, derivedFrom: 'oob_line_color' },
            { key: 'oob_line_color', label: 'Sideline accent color', type: 'color', defaultColor: 'secondary', showIf: (f) => f.sideline_accent_enabled },
        ],
    },
    {
        title: 'Wall',
        help: 'Each end can be styled independently; blank right-wall fields match the left.',
        fields: [
            { key: 'wall_text_font', label: 'Wall text font', type: 'font', fullWidth: true },
            { key: '_left_wall_heading', label: 'Left wall', type: 'subheading' },
            { key: 'wall_color', label: 'Color', type: 'optionalColor', help: 'White is not allowed. Blank uses the built-in look.' },
            { key: 'wall_design', label: 'Design', type: 'select', options: WALL_DESIGNS },
            { key: 'wall_text', label: 'Text', type: 'text', placeholder: 'Blank uses the built-in text' },
            { key: 'wall_text_outline_enabled', label: 'Text outline', type: 'toggle', transient: true, derivedFrom: 'wall_text_outline_color' },
            { key: 'wall_text_outline_color', label: 'Outline color', type: 'color', defaultColor: 'secondary', showIf: (f) => f.wall_text_outline_enabled },
            { key: 'wall_text_outline_width', label: 'Outline width', type: 'scale', min: 0.5, max: 3, step: 0.25, fallback: 1, showIf: (f) => f.wall_text_outline_enabled },
            { key: 'wall_logo_source', label: 'Logo', type: 'select', options: WALL_LOGO_SOURCES },
            { key: 'wall_logo_url', label: 'Custom logo URL', type: 'logo', showIf: (f) => f.wall_logo_source === 'CUSTOM' },
            { key: '_right_wall_heading', label: 'Right wall', type: 'subheading' },
            { key: 'right_wall_color', label: 'Color', type: 'optionalColor', help: 'Blank matches the left wall.' },
            { key: 'right_wall_design', label: 'Design', type: 'select', options: WALL_DESIGNS },
            { key: 'right_wall_text', label: 'Text', type: 'text', placeholder: 'Same as left' },
            { key: 'right_wall_text_outline_enabled', label: 'Text outline', type: 'toggle', transient: true, derivedFrom: 'right_wall_text_outline_color' },
            { key: 'right_wall_text_outline_color', label: 'Outline color', type: 'color', defaultColor: 'secondary', showIf: (f) => f.right_wall_text_outline_enabled },
            { key: 'right_wall_logo_source', label: 'Logo', type: 'select', options: WALL_LOGO_SOURCES_RIGHT },
            { key: 'right_wall_logo_url', label: 'Custom logo URL', type: 'logo', showIf: (f) => f.right_wall_logo_source === 'CUSTOM' },
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
    if (definition.default !== undefined) return definition.default;
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

const stripeFrom = (source, definition) => {
    const hasKey = definition.hasKey || 'has_stripe';
    const typeKey = definition.typeKey || 'stripe_type';
    if (source[hasKey] === false) return 'NONE';
    return TRIPLE_STYLES.includes(source[typeKey]) ? source[typeKey] : 'SINGLE';
};

const emptyValue = (definition, source, teamColors) => {
    const stored = source[definition.key];
    if (definition.transient && definition.derivedFrom) {
        const derived = source[definition.derivedFrom];
        return derived !== null && derived !== undefined && derived !== '';
    }
    if (definition.type === 'graphic') return graphicFrom(source, definition);
    if (definition.type === 'stripe') return stripeFrom(source, definition);
    if (definition.type === 'font') return stored ?? (definition.allowDefault ? '' : 'CLASSIC');
    return readGeneric(definition, stored ?? source[definition.fallbackKey], resolveDefault(definition, teamColors));
};

export const formFrom = (sections, source, teamColors) => {
    const form = {};
    sections.forEach((section) => section.fields.forEach((definition) => {
        if (definition.type === 'subheading' || definition.type === 'divider') return;
        form[definition.key] = emptyValue(definition, source, teamColors);
    }));
    return form;
};

export const payloadFrom = (sections, form) => {
    const payload = {};
    sections.forEach((section) => section.fields.forEach((definition) => {
        if (definition.transient || definition.type === 'subheading' || definition.type === 'divider') return;
        const value = form[definition.key];
        if (definition.type === 'graphic') {
            const modeKey = definition.modeKey || 'helmet_logo_mode';
            const sourceKey = definition.sourceKey || 'helmet_logo_source';
            const hasKey = definition.hasKey || 'has_logo';
            payload[hasKey] = value !== 'NONE';
            if (value === 'NUMBER') payload[modeKey] = 'NUMBERS';
            else if (value === 'UPLOADED') payload[modeKey] = 'UPLOAD';
            else { payload[modeKey] = 'MAIN'; payload[sourceKey] = value === 'SECONDARY' ? 'SECONDARY' : 'PRIMARY'; }
            return;
        }
        if (definition.type === 'stripe') {
            const hasKey = definition.hasKey || 'has_stripe';
            const typeKey = definition.typeKey || 'stripe_type';
            payload[hasKey] = value !== 'NONE';
            if (value !== 'NONE') payload[typeKey] = value;
            return;
        }
        writeGeneric(payload, definition, form);
    }));
    return payload;
};
