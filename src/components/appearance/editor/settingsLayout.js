const isMarker = (field) => field.type === 'subheading' || field.type === 'divider';

const isStable = (field) => !field.showIf || field.stable;

const alwaysShownFirst = (fields) => [...fields.filter(isStable), ...fields.filter((field) => !isStable(field))];

export const groupsOf = (section) => {
    const groups = [];
    let current = { key: '_lead', label: section.firstGroup || null, fields: [] };
    section.fields.forEach((field) => {
        if (field.type === 'subheading') {
            groups.push(current);
            current = { key: field.key, label: field.label, fields: [], showIf: field.showIf };
        } else if (!isMarker(field)) {
            current.fields.push(field);
        }
    });
    groups.push(current);
    const [lead, ...rest] = groups;
    if (!rest.length) {
        return { shared: [], groups: [{ ...lead, label: null }] };
    }
    if (lead.label) {
        return { shared: [], groups: [lead, ...rest] };
    }
    return { shared: lead.fields, groups: rest };
};

export const visibleGroups = (section, form) =>
    groupsOf(section).groups.filter((group) => !group.showIf || group.showIf(form));

export const layoutFields = (section, groupKey, isVisible, form) => {
    const { shared, groups } = groupsOf(section);
    const group = groups.find((candidate) => candidate.key === groupKey) || groups[0];
    return [...alwaysShownFirst(shared), ...alwaysShownFirst(group.fields)].filter((field) => isVisible(field, form));
};
