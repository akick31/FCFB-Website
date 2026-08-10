const ACRONYM_FIXES = [
    [/\bId\b/g, 'ID'],
    [/\bElo\b/g, 'ELO'],
    [/\bFcfb\b/g, 'FCFB'],
    [/\bFbs\b/g, 'FBS'],
    [/\bFcs\b/g, 'FCS'],
];

const applyAcronymFixes = (text) => ACRONYM_FIXES.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), text);

export const humanizeParamName = (name) => {
    const spaced = name
        .replace(/_/g, ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .toLowerCase();
    const titled = spaced.replace(/\b\w/g, (char) => char.toUpperCase());
    return applyAcronymFixes(titled);
};

export const humanizeEnumValue = (value) =>
    applyAcronymFixes(
        value
            .toString()
            .split('_')
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' '),
    );

export const humanizeTag = (tag) =>
    applyAcronymFixes(
        tag
            .replace(/-controller$/i, '')
            .split('-')
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
    );
