import React, { useState, useEffect } from "react";
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
    Container,
} from "@mui/material";
import {
    Menu as MenuIcon,
    ArrowDropDown,
    Person,
    Logout,
    Login,
    PersonAdd,
    SportsFootball
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";
import { getTeamByName } from "../../api/teamApi";
import LogoAndTitle from "../icons/LogoAndTitle";
import PropTypes from 'prop-types';

const Header = ({ isAuthenticated, isAdmin, user, setIsAuthenticated, setUser, setIsAdmin }) => {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState(null);
    const [statsMenuAnchor, setStatsMenuAnchor] = useState(null);

    const [teamData, setTeamData] = useState(null);
    const [isLoadingTeam, setIsLoadingTeam] = useState(false);

    // Fetch team data when user changes
    useEffect(() => {
        const fetchTeamData = async () => {
            if (user?.team) {
                setIsLoadingTeam(true);
                try {
                    const team = await getTeamByName(user.team);
                    setTeamData(team);
                } catch (error) {
                    console.error('Error fetching team data:', error);
                } finally {
                    setIsLoadingTeam(false);
                }
            }
        };

        fetchTeamData();
    }, [user?.team]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleUserMenuOpen = (event) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    const handleStatsMenuOpen = (event) => {
        setStatsMenuAnchor(event.currentTarget);
    };

    const handleStatsMenuClose = () => {
        setStatsMenuAnchor(null);
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

    };

    const isActiveRoute = (path) => location.pathname === path;
    const isStatsActive = () => location.pathname === '/records' || location.pathname === '/season-stats' || location.pathname === '/league-stats' || location.pathname === '/leaderboard';

    // Mobile Drawer
    const drawer = (
        <Box sx={{ 
            width: 280, 
            backgroundColor: 'primary.main',
            color: 'white',
            height: '100%'
        }}>
            <Box sx={{ 
                p: 2, 
                borderBottom: `1px solid rgba(255, 255, 255, 0.2)`,
                backgroundColor: 'primary.main',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <Box sx={{ transform: 'scale(1.2)' }}>
                    <LogoAndTitle />
                </Box>
            </Box>
            
            <List sx={{ pt: 1, backgroundColor: 'primary.main' }}>
                {navigationItems.map(({ label, path }) => (
                    <ListItem key={path} disablePadding>
                        <ListItemButton
                            onClick={() => handleNavigation(path)}
                            selected={isActiveRoute(path)}
                            sx={{
                                borderRadius: 1,
                                mx: 1,
                                mb: 0.5,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                },
                            }}
                        >
                            <ListItemText primary={label} />
                        </ListItemButton>
                    </ListItem>
                ))}

                {/* Stats Menu Items */}
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => handleNavigation('/records')}
                        selected={isActiveRoute('/records')}
                        sx={{
                            borderRadius: 1,
                            mx: 1,
                            mb: 0.5,
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&.Mui-selected': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                },
                            },
                        }}
                    >
                        <ListItemText primary="Records" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => handleNavigation('/season-stats')}
                        selected={isActiveRoute('/season-stats')}
                        sx={{
                            borderRadius: 1,
                            mx: 1,
                            mb: 0.5,
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&.Mui-selected': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                },
                            },
                        }}
                    >
                        <ListItemText primary="Season Stats" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => handleNavigation('/league-stats')}
                        selected={isActiveRoute('/league-stats')}
                        sx={{
                            borderRadius: 1,
                            mx: 1,
                            mb: 0.5,
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&.Mui-selected': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                },
                            },
                        }}
                    >
                        <ListItemText primary="League Stats" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => handleNavigation('/leaderboard')}
                        selected={isActiveRoute('/leaderboard')}
                        sx={{
                            borderRadius: 1,
                            mx: 1,
                            mb: 0.5,
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&.Mui-selected': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                },
                            },
                        }}
                    >
                        <ListItemText primary="Leaderboard" />
                    </ListItemButton>
                </ListItem>

                {/* Admin Menu */}
                {isAdmin && (
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => handleNavigation('/admin')}
                            sx={{
                                borderRadius: 1,
                                mx: 1,
                                mb: 0.5,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                            }}
                        >
                            <ListItemText primary="Admin" />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>

            <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
            
            <List sx={{ backgroundColor: 'primary.main' }}>
                {authItems.map(({ label, path, onClick, icon }) => (
                    <ListItem key={path} disablePadding>
                        <ListItemButton
                            onClick={() => handleNavigation(path, onClick)}
                            sx={{
                                borderRadius: 1,
                                mx: 1,
                                mb: 0.5,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: 'white' }}>
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
        <Box sx={{ backgroundColor: 'primary.main', overflow: 'hidden' }}>
            {/* Logo Section with Enhanced Rectangle Design */}
            <Container maxWidth="xl">
                <Box sx={{ 
                    py: 0.2,
                    px: { xs: 2, sm: 3 },
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Enhanced Rectangle with Darker Gray Edges */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        width: { xs: '180px', sm: '200px', md: '235px' },
                        height: '100%',
                        backgroundColor: '#dc2626',
                        transform: 'skew(-8deg)',
                        zIndex: 3,
                    }} />
                    
                    {/* Left Darker Gray Edge */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        width: { xs: '20px', sm: '22px', md: '27px' },
                        height: '100%',
                        backgroundColor: '#a0a0a0',
                        transform: 'skew(-8deg)',
                        zIndex: 3
                    }} />
                    
                    {/* Right Darker Gray Edge */}
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: { xs: '180px', sm: '200px', md: '235px' },
                        width: { xs: '20px', sm: '22px', md: '28px' },
                        height: '100%',
                        backgroundColor: '#a0a0a0',
                        transform: 'skew(-8deg)',
                        zIndex: 3
                    }} />
                    
                    {/* Logo positioned above the enhanced background - Always same relative position */}
                    <Box sx={{ 
                        position: 'relative', 
                        left: '2.8%', // Fixed percentage for consistent positioning
                        zIndex: 4 
                    }}>
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
                    height: { xs: 48, sm: 54 },
                    backgroundColor: 'primary.main',
                    borderRadius: 0,
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.7)',
                    zIndex: 2,
                    overflow: 'hidden',
                }}
            >
                <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 } }}>
                    <Toolbar sx={{ 
                        px: { xs: 1, sm: 2 }, 
                        justifyContent: { xs: 'space-between', md: 'space-between' },
                        borderRadius: 0,
                        fontFamily: 'Exo, sans-serif',
                        minHeight: 'auto',
                        width: '100%',
                        overflow: 'visible',
                        flexWrap: 'nowrap',
                    }}>
                        {/* Left Navigation - Hidden on small screens, only show on medium and up */}
                        <Box sx={{ 
                            display: { xs: 'none', md: 'flex' }, 
                            alignItems: 'center', 
                            gap: 1, 
                            pb: 1.2,
                            flex: 1,
                        }}>
                            {navigationItems.map(({ label, path }) => (
                                <Button
                                    key={path}
                                    onClick={() => navigate(path)}
                                    variant={isActiveRoute(path) ? "contained" : "text"}
                                    sx={{
                                        color: 'white',
                                        textTransform: 'none',
                                        px: 2,
                                        py: 0.75, // Reduced padding for smaller highlights
                                        fontWeight: isActiveRoute(path) ? 600 : 400,
                                        fontSize: '0.95rem',
                                        borderRadius: 2,
                                        fontFamily: 'Exo, sans-serif',
                                        whiteSpace: 'nowrap',
                                        minHeight: 32, // Reduced height for smaller highlights
                                        minWidth: 'auto',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                        '&.MuiButton-contained': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.35)',
                                            },
                                        },
                                    }}
                                >
                                    {label}
                                </Button>
                            ))}

                            {/* Stats Dropdown */}
                            <Button
                                onClick={handleStatsMenuOpen}
                                variant={isStatsActive() ? "contained" : "text"}
                                endIcon={<ArrowDropDown />}
                                sx={{
                                    color: 'white',
                                    textTransform: 'none',
                                    px: 2,
                                    py: 0.75,
                                    fontWeight: isStatsActive() ? 600 : 400,
                                    fontSize: '0.95rem',
                                    borderRadius: 2,
                                    fontFamily: 'Exo, sans-serif',
                                    whiteSpace: 'nowrap',
                                    minHeight: 32,
                                    minWidth: 'auto',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    },
                                    '&.MuiButton-contained': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.35)',
                                        },
                                    },
                                }}
                            >
                                Stats
                            </Button>

                            {/* Admin Button */}
                            {isAdmin && (
                                <Button
                                    onClick={() => navigate('/admin')}
                                    sx={{
                                        color: 'white',
                                        textTransform: 'none',
                                        px: 2,
                                        py: 0.75, // Reduced padding for smaller highlights
                                        fontWeight: 400,
                                        fontSize: '0.95rem',
                                        borderRadius: 2,
                                        fontFamily: 'Exo, sans-serif',
                                        minHeight: 32, // Reduced height for smaller highlights
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                    }}
                                >
                                    Admin
                                </Button>
                            )}
                        </Box>

                        {/* Mobile Menu Button - Moved more to the right */}
                        <Box sx={{ 
                            display: { xs: 'flex', md: 'none' },
                            position: 'relative',
                            zIndex: 10,
                            flexShrink: 0,
                            mt: 0.5,
                            ml: 3,
                        }}>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ 
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    }
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Box>

                        {/* Right Auth Section - Hidden on small screens, only show on medium and up */}
                        <Box sx={{ 
                            display: { xs: 'none', md: 'flex' }, 
                            alignItems: 'center', 
                            gap: 1, 
                            pb: 1.2,
                            flexShrink: 0,
                            minWidth: 'fit-content',
                            ml: 'auto',
                        }}>
                            {!isAuthenticated ? (
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/login')}
                                        sx={{
                                            color: 'white',
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                            textTransform: 'none',
                                            px: { xs: 1.5, sm: 2 },
                                            py: 1,
                                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                            borderRadius: 2,
                                            fontFamily: 'Exo, sans-serif',
                                            whiteSpace: 'nowrap',
                                            minHeight: 36,
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
                                            color: 'primary.main',
                                            textTransform: 'none',
                                            px: { xs: 1.5, sm: 2 },
                                            py: 1,
                                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            fontFamily: 'Exo, sans-serif',
                                            whiteSpace: 'nowrap',
                                            minHeight: 36,
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
                                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                        fontFamily: 'Exo, sans-serif',
                                        whiteSpace: 'nowrap',
                                        display: { xs: 'none', sm: 'block' }
                                    }}>
                                        {user.username}
                                    </Typography>
                                    <Avatar
                                        onClick={handleUserMenuOpen}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            cursor: 'pointer',
                                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                            borderRadius: 2,
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                        }}
                                    >
                                        {user?.team && isLoadingTeam ? (
                                            <SportsFootball sx={{ fontSize: '1rem' }} />
                                        ) : user?.team && teamData ? (
                                            <img 
                                                src={teamData.logo} 
                                                alt={`${user.team} Logo`}
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    borderRadius: '4px'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                        ) : (
                                            user?.username?.charAt(0)?.toUpperCase() || 'U'
                                        )}
                                        {user?.team && teamData && (
                                            <Avatar
                                                sx={{
                                                    width: '100%',
                                                    height: '100%',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                    fontSize: '0.8rem',
                                                    display: 'none'
                                                }}
                                            >
                                                {user.team.charAt(0).toUpperCase()}
                                            </Avatar>
                                        )}
                                    </Avatar>
                                </Box>
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
                        backgroundColor: 'primary.main',
                        color: 'white',
                    },
                }}
            >
                {drawer}
            </Drawer>



            {/* Stats Menu */}
            <Menu
                anchorEl={statsMenuAnchor}
                open={Boolean(statsMenuAnchor)}
                onClose={handleStatsMenuClose}
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
                        minWidth: 150,
                        boxShadow: theme.shadows[8],
                        borderRadius: 0,
                    },
                }}
            >
                <MenuItem
                    onClick={() => {
                        navigate('/records');
                        handleStatsMenuClose();
                    }}
                    sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 0,
                        backgroundColor: isActiveRoute('/records') ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                    }}
                >
                    <ListItemText primary="Records" />
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        navigate('/season-stats');
                        handleStatsMenuClose();
                    }}
                    sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 0,
                        backgroundColor: isActiveRoute('/season-stats') ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                    }}
                >
                    <ListItemText primary="Season Stats" />
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        navigate('/league-stats');
                        handleStatsMenuClose();
                    }}
                    sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 0,
                        backgroundColor: isActiveRoute('/league-stats') ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                    }}
                >
                    <ListItemText primary="League Stats" />
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        navigate('/leaderboard');
                        handleStatsMenuClose();
                    }}
                    sx={{
                        py: 1.5,
                        px: 2,
                        borderRadius: 0,
                        backgroundColor: isActiveRoute('/leaderboard') ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                    }}
                >
                    <ListItemText primary="Leaderboard" />
                </MenuItem>
            </Menu>

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
                        borderRadius: 0,
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
                            borderRadius: 0,
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