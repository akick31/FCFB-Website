export const linkClickHandler = (navigate, url) => (e) => {
    if (!url) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(url);
};

export const linkProps = (navigate, url) => {
    if (!url) return {};
    return {
        component: 'a',
        href: url,
        onClick: linkClickHandler(navigate, url),
        sx: { textDecoration: 'none', color: 'inherit' },
    };
};
