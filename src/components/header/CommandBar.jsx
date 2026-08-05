import React, { useState } from 'react';
import { Box, Button, IconButton, Avatar, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Menu as MenuIcon, Person, Logout, SportsFootball } from '@mui/icons-material';
import { useLocation, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import mainLogo from '../../assets/graphics/main_logo.png';
import { NAV_ITEMS } from './navConfig';
import { clickableProps } from '../../utils/a11y';

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

const CommandBar = ({ isAuthenticated, isAdmin, user, teamLogo, onMobileOpen, onLogout }) => {
    const location = useLocation();
    const [userAnchor, setUserAnchor] = useState(null);

    const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

    const closeUserMenu = () => setUserAnchor(null);

    return (
        <Box sx={{ backgroundColor: 'var(--brand-deep)', display: 'flex', alignItems: 'stretch', height: 54 }}>
            <Box
                component={Link}
                to="/"
                aria-label="Home"
                sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    pl: '14px',
                    pr: '30px',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    '&::after': { content: '""', position: 'absolute', right: '-11px', top: 0, bottom: 0, width: '22px', backgroundColor: 'var(--live)', transform: 'skewX(-11deg)' },
                    '&::before': { content: '""', position: 'absolute', right: '-20px', top: 0, bottom: 0, width: '6px', backgroundColor: '#b9c2c8', transform: 'skewX(-11deg)' },
                    '&:focus-visible': { outline: '2px solid #fff', outlineOffset: '2px' },
                }}
            >
                <Box component="img" src={mainLogo} alt="FCFB" sx={{ height: 46, width: 'auto', zIndex: 1, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'stretch', pl: '30px', flex: 1, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
                {NAV_ITEMS.map((item) => (
                    <Button key={item.path} component={Link} to={item.path} onClick={closeUserMenu} disableRipple sx={navButtonSx(isActive(item.path))}>
                        {item.label}
                    </Button>
                ))}
                {isAdmin && (
                    <Button component={Link} to="/admin" onClick={closeUserMenu} disableRipple sx={navButtonSx(isActive('/admin'))}>
                        Admin
                    </Button>
                )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, ml: { xs: 'auto', md: 0 } }}>
                {isAuthenticated ? (
                    <Box
                        {...clickableProps((e) => setUserAnchor(e.currentTarget))}
                        aria-haspopup="true"
                        aria-label={`Account menu for ${user?.username || 'user'}`}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', px: 1, py: 0.5, borderRadius: 1, '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' }, '&:focus-visible': { outline: '2px solid #fff', outlineOffset: '2px' } }}
                    >
                        <Avatar src={teamLogo || undefined} sx={{ width: 30, height: 30, borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.15)' }}>
                            {teamLogo ? null : <SportsFootball sx={{ fontSize: '1rem' }} />}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' }, color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>{user?.username}</Box>
                    </Box>
                ) : (
                    <>
                        <Button
                            component={Link}
                            to="/login"
                            onClick={closeUserMenu}
                            variant="outlined"
                            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)', textTransform: 'none', fontWeight: 700, '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' } }}
                        >
                            Log in
                        </Button>
                        <Button
                            component={Link}
                            to="/register"
                            onClick={closeUserMenu}
                            variant="contained"
                            sx={{ backgroundColor: 'var(--brand)', color: '#fff', textTransform: 'none', fontWeight: 700, boxShadow: 'none', '&:hover': { backgroundColor: 'var(--brand)', opacity: 0.9, boxShadow: 'none' } }}
                        >
                            Register
                        </Button>
                    </>
                )}

                <IconButton onClick={onMobileOpen} aria-label="Open menu" sx={{ display: { xs: 'inline-flex', md: 'none' }, color: '#fff' }}>
                    <MenuIcon />
                </IconButton>
            </Box>

            <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}>
                <MenuItem component={Link} to="/profile" onClick={closeUserMenu}>
                    <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { setUserAnchor(null); onLogout(); }}>
                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                    <ListItemText>Log out</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
};

CommandBar.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    user: PropTypes.object,
    teamLogo: PropTypes.string,
    onMobileOpen: PropTypes.func.isRequired,
    onLogout: PropTypes.func.isRequired,
};

export default CommandBar;
