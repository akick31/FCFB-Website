import { shownTab, tabNames, tabOf } from '../../../utils/settingsTabs';
import { visibleGroups } from './settingsLayout';

export const viewsOf = (sections, tab, form) => {
    const tabSections = sections.filter((section) => tabOf(section) === tab);
    const many = tabSections.length > 1;
    return tabSections.flatMap((section) =>
        visibleGroups(section, form).map((group) => ({
            key: `${section.title}|${group.key}`,
            section,
            groupKey: group.key,
            label: group.label ? (many ? `${section.title}: ${group.label}` : group.label) : section.title,
        }))
    );
};

export const resolveView = (sections, requestedTab, requestedView, form) => {
    const tab = shownTab(sections, requestedTab);
    const views = viewsOf(sections, tab, form);
    return { tab, tabs: tabNames(sections), views, view: views.find((view) => view.key === requestedView) || views[0] };
};
