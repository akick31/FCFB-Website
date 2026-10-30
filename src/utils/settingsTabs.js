export const tabOf = (section) => section.tab || section.title;

export const tabNames = (sections) => [...new Set(sections.map(tabOf))];

export const shownTab = (sections, requested) => {
    const names = tabNames(sections);
    return names.includes(requested) ? requested : names[0];
};
