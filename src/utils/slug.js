export const toSlug = (value) => String(value).toLowerCase().replace(/_/g, '-');

export const fromSlug = (slug) => (slug ? String(slug).toUpperCase().replace(/-/g, '_') : null);
