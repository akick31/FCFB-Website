import { styled } from "@mui/system";
import { AppBar, Toolbar, Tabs, Tab } from "@mui/material";

// Styled components for Header
export const StyledAppBar = styled(AppBar)`
    position: sticky;
    background-color: #004260; /* Custom blue color */
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

export const StyledToolbar = styled(Toolbar)`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const StyledTabs = styled(Tabs)`
    .MuiTabs-indicator {
        background-color: transparent; /* Make indicator transparent */
    }
`;

export const StyledTab = styled(Tab)`
    color: white; /* Default color for tab text */
    padding: 6px 16px;
    border-radius: 12px;
    font-size: 14px;
    transition: background-color 0.3s ease, transform 0.2s ease;
    margin: 0 4px; /* Horizontal margin between tabs */

    /* Hover effect for tab */
    &:hover {
        background-color: rgba(255, 255, 255, 0.1); /* Slight grey background on hover */
        transform: scale(1.05); /* Slight scale effect on hover */
    }

    /* Selected tab appearance */
    &.Mui-selected {
        background-color: rgba(255, 255, 255, 0.1); /* Match hover background color */
        color: white;
        font-weight: bold;
        border-radius: 12px;
    }
`;

export const Footer = styled('footer')`
    text-align: center;
    padding: 16px;
    background-color: #004260;
    color: white;
`;