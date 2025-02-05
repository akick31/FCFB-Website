import React from "react";
import { Box, Divider } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../api/authApi";
import LogoAndTitle from "../icons/LogoAndTitle";
import AuthTabs from "../tabs/AuthTabs";
import { StyledAppBar, StyledToolbar, StyledTabs, StyledTab } from "../../styles/HeaderStyles";
import PropTypes from 'prop-types';

const Header = ({ isAuthenticated, isAdmin, user, setIsAuthenticated, setUser, setIsAdmin }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(setIsAuthenticated, setUser, setIsAdmin);
        navigate("/");
    };

    const navigationItems = [
        { label: "Home", path: "/" },
        { label: "Scoreboard", path: "/scoreboard" },
        { label: "Standings", path: "/standings" },
        { label: "Schedules", path: "/schedules" },
        { label: "Teams", path: "/teams" },
        ...(isAdmin ? [{ label: "Admin", path: "/admin" }] : []),
    ];

    const authItems = !isAuthenticated
        ? [
            { label: "Login", path: "/login" },
            { label: "Register", path: "/register" },
        ]
        : [
            { label: user.username, path: "/profile" },
            { label: "Logout", path: "/", onClick: handleLogout },
        ];

    return (
        <StyledAppBar>
            <StyledToolbar>
                <LogoAndTitle />
                <Box display="flex" alignItems="center" flexGrow={1} justifyContent="flex-end">
                    <StyledTabs value={location.pathname} aria-label="navigation tabs">
                        {navigationItems.map(({ label, path }) => (
                            <StyledTab key={path} label={label} value={path} component="a" href={path} />
                        ))}
                    </StyledTabs>
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ mx: 2, my: 1, borderColor: "white" }}
                    />
                    <AuthTabs authItems={authItems} />
                </Box>
            </StyledToolbar>
        </StyledAppBar>
    );
};

Header.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    setIsAuthenticated: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    setIsAdmin: PropTypes.func.isRequired,
}

export default Header;