import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, ListItemText } from '@mui/material';
import { useLocation, Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const navButtonSx = (active) => ({
    color: '#cfe3ee',
    textTransform: 'none',
    px: 1.6,
    height: '100%',
    minWidth: 'auto',
    borderRadius: 0,
    fontSize: '0.8rem',
    fontWeight: active ? 700 : 600,
    borderBottom: active ? '3px solid var(--live)' : '3px solid transparent',
    '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.06)' },
    ...(active && { color: '#fff' }),
});

const NavDropdown = ({ label, items, onNavigate }) => {
    const location = useLocation();
    const [anchor, setAnchor] = useState(null);
    const close = () => {
        setAnchor(null);
        if (onNavigate) onNavigate();
    };

    const isItemActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));
    const isActive = items.some((item) => isItemActive(item.path));

    return (
        <>
            <Button onClick={(e) => setAnchor(e.currentTarget)} aria-haspopup="true" disableRipple sx={navButtonSx(isActive)}>
                {label}
                <Box component="span" sx={{ ml: '4px', fontSize: '0.6rem' }}>▾</Box>
            </Button>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
                {items.map((item) => (
                    <MenuItem key={item.path} component={Link} to={item.path} onClick={close}>
                        <ListItemText>{item.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

NavDropdown.propTypes = {
    label: PropTypes.node.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string.isRequired, path: PropTypes.string.isRequired })).isRequired,
    onNavigate: PropTypes.func,
};

export default NavDropdown;
