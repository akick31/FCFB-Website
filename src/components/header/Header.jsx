import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    Container,
    Menu as MuiMenu
} from "@mui/material";
import {
    Menu as MenuIcon,
    KeyboardArrowDown,
    Person,
    Logout,
    Login,
    PersonAdd
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";
import LogoAndTitle from "../icons/LogoAndTitle";
import PropTypes from 'prop-types';

const Header = ({ isAuthenticated, isAdmin, user, setIsAuthenticated, setUser, setIsAdmin }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const location = useLocation();
    const navigate = useNavigate();
    
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    const handleAdminMenuOpen = (event) => {
        setAdminMenuAnchor(event.currentTarget);
    };

    const handleAdminMenuClose = () => {
        setAdminMenuAnchor(null);
    };

    const handleLogout = () => {
        logout(setIsAuthenticated, setUser, setIsAdmin);
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
        setUserMenuAnchor(null);
        navigate("/");
    };

    const navigationItems = [
        { label: "Home", path: "/" },
        { label: "Scoreboard", path: "/scoreboard" },
        { label: "Standings", path: "/standings" },
        { label: "Rankings", path: "/rankings" },
        { label: "Schedules", path: "/schedules" },
        { label: "Teams", path: "/teams" },
    ];

    const adminMenuItems = [
        { label: "Admin Panel", path: "/admin" },
        { label: "Users", path: "/users" },
        { label: "New Signups", path: "/new-signups" },
        { label: "Game Management", path: "/game-management" },
    ];

    const authItems = !isAuthenticated
        ? [
            { label: "Login", path: "/login", icon: <Login /> },
            { label: "Register", path: "/register", icon: <PersonAdd /> },
        ]
        : [
            { label: "Profile", path: "/profile", icon: <Person /> },
            { label: "Logout", onClick: handleLogout, icon: <Logout /> },
        ];

    const handleNavigation = (path, onClick) => {
        if (onClick) {
            onClick();
        } else {
            navigate(path);
        }
        setMobileOpen(false);
        setAdminMenuAnchor(null);
    };

    const isActiveRoute = (path) => location.pathname === path;

    // Mobile Drawer
    const drawer = (
        <Box sx={{ width: 280 }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <LogoAndTitle />
            </Box>
            
            <List sx={{ pt: 1 }}>
                {navigationItems.map(({ label, path }) => (
                    <ListItem key={path} disablePadding>
                        <ListItemButton
                            onClick={() => handleNavigation(path)}
                            selected={isActiveRoute(path)}
                            sx={{
                                borderRadius: 1,
                                mx: 1,
                                mb: 0.5,
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                },
                            }}
                        >
                            <ListItemText primary={label} />
                        </ListItemButton>
                    </ListItem>
                ))}

                {/* Admin Menu */}
                {isAdmin && (
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={handleAdminMenuOpen}
                            sx={{
                                borderRadius: 1,
                                mx: 1,
                                mb: 0.5,
                            }}
                        >
                            <ListItemText primary="Admin" />
                            <KeyboardArrowDown />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>

            <Divider sx={{ my: 2 }} />
            
            <List>
                {authItems.map(({ label, path, onClick, icon }) => (
                    <ListItem key={label} disablePadding>
                        <ListItemButton
                            onClick={() => handleNavigation(path, onClick)}
                            sx={{
                                borderRadius: 1,
                                mx: 1,
                                mb: 0.5,
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {icon}
                            </ListItemIcon>
                            <ListItemText primary={label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ backgroundColor: 'primary.main' }}>
            {/* Logo Section with Enhanced Rectangle Design */}
            <Container maxWidth="xl">
                <Box sx={{ 
                    py: 0.2, // Even shorter header
                    px: { xs: 2, sm: 3 },
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Enhanced Rectangle with Darker Gray Edges */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        width: '235px',
                        height: '100%',
                        backgroundColor: '#dc2626',
                        transform: 'skew(-8deg)',
                        zIndex: 3,
                    }} />
                    
                    {/* Left Darker Gray Edge */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        width: '27px', // 15% of 220px
                        height: '100%',
                        backgroundColor: '#a0a0a0', // Darker gray
                        transform: 'skew(-8deg)',
                        zIndex: 3
                    }} />
                    
                    {/* Right Darker Gray Edge */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: '235px',
                        width: '28px', // 15% of 240px
                        height: '100%',
                        backgroundColor: '#a0a0a0', // Darker gray
                        transform: 'skew(-8deg)',
                        zIndex: 3
                    }} />
                    
                    {/* Logo positioned above the enhanced background */}
                    <Box sx={{ 
                        position: 'relative', 
                        left: '2.8%',
                        zIndex: 4 }}>
                        <LogoAndTitle />
                    </Box>
                </Box>
            </Container>

            {/* Navigation Section - Red Background with Sticky Positioning and Strong Drop Shadow */}
            <AppBar 
                position="sticky" 
                top={0}
                elevation={0}
                sx={{
                    height: 54,
                    backgroundColor: 'primary.main', // Blue background for contrast
                    borderRadius: 0, // No rounded edges on main background
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.7)', // More prominent drop shadow
                    zIndex: 2, // Lower than skewed rectangle to allow shadow to show
                }}
            >
                <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
                    <Toolbar sx={{ 
                        px: { xs: 1, sm: 2 }, 
                        justifyContent: 'space-between',
                        borderRadius: 0, // No rounded edges on main background
                        fontFamily: 'Exo, sans-serif', // Ensure Exo font is used
                        minHeight: 'auto', // Allow natural height
                    }}>
                        {/* Left Navigation */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            pb: 1.2,
                            overflowX: 'auto', // Enable horizontal scrolling on small screens
                            '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar on webkit browsers
                            msOverflowStyle: 'none', // Hide scrollbar on IE/Edge
                            scrollbarWidth: 'none', // Hide scrollbar on Firefox
                        }}>
                            {navigationItems.map(({ label, path }) => (
                                <Button
                                    key={path}
                                    onClick={() => navigate(path)}
                                    variant={isActiveRoute(path) ? "contained" : "text"}
                                    sx={{
                                        color: 'white',
                                        textTransform: 'none',
                                        px: { xs: 1.5, sm: 2 }, // Responsive padding
                                        py: 0, // No vertical padding
                                        fontWeight: isActiveRoute(path) ? 600 : 400,
                                        fontSize: { xs: '0.9rem', sm: '0.98rem' }, // Responsive font size
                                        borderRadius: 2, // Rounded hover/active states
                                        fontFamily: 'Exo, sans-serif', // Ensure Exo font is used
                                        whiteSpace: 'nowrap', // Prevent text wrapping
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                        '&.MuiButton-contained': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                        },
                                    }}
                                >
                                    {label}
                                </Button>
                            ))}

                            {/* Admin Dropdown */}
                            {isAdmin && (
                                <Button
                                    onClick={handleAdminMenuOpen}
                                    endIcon={<KeyboardArrowDown />}
                                    sx={{
                                        color: 'white',
                                        textTransform: 'none',
                                        px: 2,
                                        py: 0, // No vertical padding
                                        fontWeight: 400,
                                        fontSize: '0.95rem', // Larger font size
                                        borderRadius: 2, // Rounded hover/active states
                                        fontFamily: 'Exo, sans-serif', // Ensure Exo font is used
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                    }}
                                >
                                    Admin
                                </Button>
                            )}
                        </Box>

                        {/* Right Auth Section */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            pb: 1.2,
                            overflowX: 'auto', // Enable horizontal scrolling on small screens
                            '&::-webkit-scrollbar': { display: 'none' }, // Hide scrollbar on webkit browsers
                            msOverflowStyle: 'none', // Hide scrollbar on IE/Edge
                            scrollbarWidth: 'none', // Hide scrollbar on Firefox
                        }}>
                            {!isAuthenticated ? (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/login')}
                                        sx={{
                                            color: 'white',
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                            textTransform: 'none',
                                            px: { xs: 1.5, sm: 2 }, // Responsive padding
                                            py: 0, // No vertical padding
                                            fontSize: { xs: '0.85rem', sm: '0.95rem' }, // Responsive font size
                                            borderRadius: 2, // Rounded hover/active states
                                            fontFamily: 'Exo, sans-serif', // Ensure Exo font is used
                                            whiteSpace: 'nowrap', // Prevent text wrapping
                                            '&:hover': {
                                                borderColor: 'white',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            },
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate('/register')}
                                        sx={{
                                            backgroundColor: 'white',
                                            color: 'primary.main', // Red text to match background
                                            textTransform: 'none',
                                            px: { xs: 1.5, sm: 2 }, // Responsive padding
                                            py: 0, // No vertical padding
                                            fontSize: { xs: '0.85rem', sm: '0.95rem' }, // Responsive font size
                                            fontWeight: 600,
                                            borderRadius: 2, // Rounded hover/active states
                                            fontFamily: 'Exo, sans-serif', // Ensure Exo font is used
                                            whiteSpace: 'nowrap', // Prevent text wrapping
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            },
                                        }}
                                    >
                                        Register
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="body2" sx={{ 
                                        color: 'white', 
                                        opacity: 0.9, 
                                        fontSize: { xs: '0.85rem', sm: '0.95rem' }, // Responsive font size
                                        fontFamily: 'Exo, sans-serif', // Ensure Exo font is used
                                        whiteSpace: 'nowrap', // Prevent text wrapping
                                    }}>
                                        {user.username}
                                    </Typography>
                                    <Avatar
                                        onClick={handleUserMenuOpen}
                                        sx={{
                                            width: 12, // Extremely small for very thin height
                                            height: 12, // Extremely small for very thin height
                                            cursor: 'pointer',
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            borderRadius: 2, // Rounded avatar
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                        }}
                                    >
                                        {user.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </Avatar>
                                </Box>
                            )}

                            {/* Mobile Menu Button */}
                            {isMobile && (
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    edge="start"
                                    onClick={handleDrawerToggle}
                                    sx={{ ml: 1 }}
                                >
                                    <MenuIcon />
                                </IconButton>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>



            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 280,
                    },
                }}
            >
                {drawer}
            </Drawer>

            {/* Admin Dropdown Menu */}
            <MuiMenu
                anchorEl={adminMenuAnchor}
                open={Boolean(adminMenuAnchor)}
                onClose={handleAdminMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 200,
                        boxShadow: theme.shadows[8],
                        borderRadius: 0, // No rounded edges
                    },
                }}
            >
                {adminMenuItems.map(({ label, path }) => (
                    <MenuItem
                        key={label}
                        onClick={() => handleNavigation(path)}
                        sx={{
                            py: 1.5,
                            px: 2,
                            borderRadius: 0, // No rounded edges
                        }}
                    >
                        {label}
                    </MenuItem>
                ))}
            </MuiMenu>

            {/* User Menu */}
            <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 180,
                        boxShadow: theme.shadows[8],
                        borderRadius: 0, // No rounded edges
                    },
                }}
            >
                {authItems.map(({ label, path, onClick, icon }) => (
                    <MenuItem
                        key={label}
                        onClick={() => {
                            if (onClick) {
                                onClick();
                            } else {
                                navigate(path);
                            }
                            handleUserMenuClose();
                        }}
                        sx={{
                            py: 1.5,
                            px: 2,
                            borderRadius: 0, // No rounded edges
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                            {icon}
                        </ListItemIcon>
                        <ListItemText primary={label} />
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

Header.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    setIsAuthenticated: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    setIsAdmin: PropTypes.func.isRequired,
};

export default Header;