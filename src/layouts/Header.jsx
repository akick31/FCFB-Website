import React from "react";
import { Box, Divider } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../api/authApi";
import LogoAndTitle from "../components/LogoAndTitle";
import AuthTabs from "../components/tabs/AuthTabs";
import { StyledAppBar, StyledToolbar, StyledTabs, StyledTab } from "../styles/HeaderStyles";

const Header = ({ isAuthenticated, isAdmin, user, setIsAuthenticated, setUser, setIsAdmin }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(setIsAuthenticated, setUser, setIsAdmin);
        navigate("/");
    };

    const navigationItems = [
        { label: "Home", path: "/" },
        { label: "Games", path: "/games" },
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

export default Header;