import React from 'react';
import { Drawer, Box, List, ListItem, ListItemButton, ListItemText, Divider } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import mainLogo from '../../assets/graphics/main_logo.png';
import { NAV_ITEMS, STATS_ITEMS } from './navConfig';

const MobileNavDrawer = ({ open, onClose, isAuthenticated, isAdmin, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const go = (path) => {
        navigate(path);
        onClose();
    };

    const itemSx = (active) => ({
        mx: 1,
        my: 0.25,
        borderRadius: 1,
        color: '#fff',
        backgroundColor: active ? 'rgba(255,255,255,0.18)' : 'transparent',
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
    });

    const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            ModalProps={{ keepMounted: true }}
            PaperProps={{ sx: { width: 280, backgroundColor: 'var(--brand-deep)', color: '#fff' } }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <Box component="img" src={mainLogo} alt="FCFB" sx={{ height: 44 }} />
            </Box>
            <List>
                {NAV_ITEMS.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton onClick={() => go(item.path)} sx={itemSx(isActive(item.path))}>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
                {STATS_ITEMS.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton onClick={() => go(item.path)} sx={itemSx(isActive(item.path))}>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
                {isAdmin && (
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => go('/admin')} sx={itemSx(isActive('/admin'))}>
                            <ListItemText primary="Admin" />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 1 }} />
            <List>
                {isAuthenticated ? (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => go('/profile')} sx={itemSx(false)}>
                                <ListItemText primary="Profile" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => { onClose(); onLogout(); }} sx={itemSx(false)}>
                                <ListItemText primary="Log out" />
                            </ListItemButton>
                        </ListItem>
                    </>
                ) : (
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => go('/login')} sx={itemSx(false)}>
                            <ListItemText primary="Log in" />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Drawer>
    );
};

MobileNavDrawer.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    onLogout: PropTypes.func.isRequired,
};

export default MobileNavDrawer;
