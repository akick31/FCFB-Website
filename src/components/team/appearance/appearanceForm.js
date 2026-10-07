export const isVisible = (definition, form) => !definition.showIf || definition.showIf(form);

/** Reads a stored value into form state for the generic field types; special types are handled by each section file. */
export const readGeneric = (definition, stored, fallback) => {
    if (definition.type === 'toggle') return stored !== false;
    if (definition.type === 'scale') return stored ?? definition.fallback ?? 0;
    return (stored === null || stored === undefined || stored === '') ? fallback : stored;
};

/** Writes a form value into the save payload; hidden fields are cleared, so opting out of a control unsets it. */
export const writeGeneric = (payload, definition, form) => {
    if (!isVisible(definition, form)) { payload[definition.key] = null; return; }
    const value = form[definition.key];
    if (definition.type === 'toggle') payload[definition.key] = value;
    else if (definition.type === 'scale') payload[definition.key] = Number(value);
    else payload[definition.key] = value === '' ? null : value;
};
