// Client-side navigation for normal clicks; modifier keys/middle-click fall through to native <a> behavior.
// Use with component="a" and href={url} on the element.
export const linkClickHandler = (navigate, url) => (e) => {
    if (!url) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(url);
};

// Props to spread on any MUI component to make it a proper right-clickable link.
// Usage: <Box {...linkProps(navigate, '/some-path')} sx={{...}}>
export const linkProps = (navigate, url) => {
    if (!url) return {};
    return {
        component: 'a',
        href: url,
        onClick: linkClickHandler(navigate, url),
        sx: { textDecoration: 'none', color: 'inherit' },
    };
};
