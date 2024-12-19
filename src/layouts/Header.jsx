import React from "react";
import { Divider, Box } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api/authApi";
import logo from "../assets/graphics/trophy.png";
import {
    StyledAppBar,
    StyledToolbar,
    Logo,
    HeaderTitle,
    StyledTabs,
    StyledTab
} from '../styles/HeaderStyles';

const Header = ({ isAuthenticated, isAdmin, user, setIsAuthenticated, setUser, setIsAdmin }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(setIsAuthenticated, setUser, setIsAdmin);
        navigate('/');
    };

    return (
        <StyledAppBar>
            <StyledToolbar>
                <Box display="flex" alignItems="center" flexGrow={1}>
                    <Logo src={logo} alt="FCFB Logo" />
                    <HeaderTitle variant="h6">Fake College Football</HeaderTitle>
                </Box>
                <StyledTabs value={location.pathname} aria-label="navigation tabs">
                    <StyledTab label="Home" value="/" component={Link} to="/" />
                    <StyledTab label="Games" value="/games" component={Link} to="/games" />
                    <StyledTab label="Standings" value="/standings" component={Link} to="/standings" />
                    <StyledTab label="Schedules" value="/schedules" component={Link} to="/schedules" />
                    <StyledTab label="Teams" value="/teams" component={Link} to="/teams" />
                    {isAdmin && <StyledTab label="Admin" value="/admin" component={Link} to="/admin" />}
                    <Divider orientation="vertical" flexItem sx={{ borderColor: 'white', height: 50, margin: '0 10px' }} />
                    {!isAuthenticated ? (
                        <>
                            <StyledTab label="Login" value="/login" component={Link} to="/login" />
                            <StyledTab label="Register" value="/register" component={Link} to="/register" />
                        </>
                    ) : (
                        <>
                            <StyledTab label={user.username} value="/profile" component={Link} to="/profile" />
                            <StyledTab label="Logout" value="/" onClick={handleLogout} />
                        </>
                    )}
                </StyledTabs>
            </StyledToolbar>
        </StyledAppBar>
    );
};

export default Header;
