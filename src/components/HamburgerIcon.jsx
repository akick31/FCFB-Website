import React from 'react';
import { IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const HamburgerIcon = ({ onClick }) => {
    return (
        <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onClick}
            sx={{
                display: { xs: 'block', sm: 'none' },  // Show on mobile only
                padding: 0,
            }}
        >
            <MenuIcon />
        </IconButton>
    );
};

export default HamburgerIcon;