/**
 * Creates an onClick handler that uses client-side navigation for normal clicks
 * but allows right-click / Ctrl+Click / Cmd+Click to open in a new tab.
 * Use with component="a" and href={url} on the element.
 *
 * @param {Function} navigate - React Router navigate function
 * @param {string} url - The URL to navigate to
 * @returns {Function} onClick handler
 */
export const linkClickHandler = (navigate, url) => (e) => {
    if (!url) return;
    // Allow modifier keys / middle-click to use native <a> behavior (new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    navigate(url);
};

/**
 * Props to spread on any MUI component to make it a proper right-clickable link.
 * Usage: <Box {...linkProps(navigate, '/some-path')} sx={{...}}>
 *
 * @param {Function} navigate - React Router navigate function
 * @param {string|null} url - The URL to navigate to (null = no link)
 * @returns {Object} Props object with component, href, onClick, sx overrides
 */
export const linkProps = (navigate, url) => {
    if (!url) return {};
    return {
        component: 'a',
        href: url,
        onClick: linkClickHandler(navigate, url),
        sx: { textDecoration: 'none', color: 'inherit' },
    };
};
