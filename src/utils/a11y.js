export const clickableProps = (onClick) => ({
    onClick,
    onKeyDown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick(event);
        }
    },
    tabIndex: 0,
    role: 'button',
});

export const slugId = (label) => String(label).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const clickableRowProps = (onClick) => ({
    onClick,
    onKeyDown: (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick(event);
        }
    },
    tabIndex: 0,
});
