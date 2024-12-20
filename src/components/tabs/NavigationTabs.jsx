import React from "react";
import { Tabs, Tab } from "@mui/material";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

const NavigationTabs = ({ location, navigationItems }) => (
    <Tabs
        value={location.pathname}
        aria-label="navigation tabs"
        sx={{
            "& .MuiTab-root": {
                minWidth: "auto",
                px: 2,
                color: "white", // Text color white
                "&.Mui-selected": {
                    color: "white", // Text color white for selected tab
                    backgroundColor: "grey.500", // Grey background for selected tab
                },
            },
        }}
    >
        {navigationItems.map(({ label, path }) => (
            <Tab
                key={path}
                label={label}
                value={path}
                component={Link}
                to={path}
                sx={{
                    textTransform: "none",
                }}
            />
        ))}
    </Tabs>
);

NavigationTabs.propTypes = {
    location: PropTypes.object.isRequired,
    navigationItems: PropTypes.array.isRequired,
}

export default NavigationTabs;