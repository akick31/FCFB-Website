import React, { useState } from 'react';
import { 
    Box, 
    Drawer, 
    AppBar, 
    Toolbar, 
    List, 
    Typography, 
    Divider, 
    IconButton, 
    ListItem, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { 
    Dashboard, 
    People, 
    SportsFootball,
    EmojiEvents, 
    Settings, 
    Menu as MenuIcon,
    ChevronLeft,
    Home,
    Group,
    Person
} from '@mui/icons-material';
import PropTypes from 'prop-types';

const drawerWidth = 280;

const DashboardLayout = ({ 
    children, 
    title = 'Dashboard',
    navigationItems = [],
    onNavigationChange,
    sx = {}
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const defaultNavigationItems = [
        { label: 'Home', icon: <Home />, path: '/' },
        { label: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { label: 'Games', icon: <SportsFootball />, path: '/scoreboard' },
        { label: 'Teams', icon: <EmojiEvents />, path: '/teams' },
        { label: 'Users', icon: <Group />, path: '/users' },
        { label: 'Profile', icon: <Person />, path: '/profile' },
        { label: 'Settings', icon: <Settings />, path: '/settings' },
    ];

    const items = navigationItems.length > 0 ? navigationItems : defaultNavigationItems;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleNavigationClick = (item) => {
        if (onNavigationChange) {
            onNavigationChange(item);
        }
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const drawer = (
        <Box>
            <Toolbar sx={{ 
                minHeight: 80, 
                display: 'flex', 
                alignItems: 'center',
                background: theme.custom?.gradients?.primary,
                color: 'white'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    FCFB Admin
                </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ pt: 2 }}>
                {items.map((item) => (
                    <ListItem key={item.label} disablePadding>
                        <ListItemButton
                            onClick={() => handleNavigationClick(item)}
                            sx={{
                                mx: 2,
                                mb: 1,
                                borderRadius: 2,
                                '&:hover': {
                                    backgroundColor: `${theme.palette.primary.main}15`,
                                },
                                '&.Mui-selected': {
                                    backgroundColor: `${theme.palette.primary.main}20`,
                                    '&:hover': {
                                        backgroundColor: `${theme.palette.primary.main}25`,
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ 
                                color: 'primary.main',
                                minWidth: 40 
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.label} 
                                sx={{ 
                                    '& .MuiTypography-root': {
                                        fontWeight: 500,
                                    }
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', ...sx }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    background: 'background.paper',
                    color: 'text.primary',
                    boxShadow: theme.shadows[1],
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: drawerWidth,
                            background: 'background.paper',
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                
                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: drawerWidth,
                            background: 'background.paper',
                            borderRight: `1px solid ${theme.palette.divider}`,
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: 10,
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

DashboardLayout.propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    navigationItems: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            icon: PropTypes.node.isRequired,
            path: PropTypes.string.isRequired,
        })
    ),
    onNavigationChange: PropTypes.func,
    sx: PropTypes.object,
};

export default DashboardLayout; 