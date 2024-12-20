import React from "react";
import { Box } from "@mui/material";
import { StyledTabs, StyledTab } from "../../styles/HeaderStyles"; // Import the styled components
import PropTypes from 'prop-types';

const AuthTabs = ({ authItems }) => {
    return (
        <Box display="flex" alignItems="center">
            <StyledTabs value={false} aria-label="auth tabs">
                {authItems.map(({ label, path, onClick }) => (
                    <StyledTab
                        key={path}
                        label={label}
                        value={path}
                        component={onClick ? "button" : "a"}
                        href={!onClick ? path : undefined}
                        onClick={onClick}
                    />
                ))}
            </StyledTabs>
        </Box>
    );
};

AuthTabs.propTypes = {
    authItems: PropTypes.array.isRequired,
}

export default AuthTabs;