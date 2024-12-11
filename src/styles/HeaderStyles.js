import { styled } from '@mui/system';
import { AppBar, Toolbar, Button, Typography, Box, Tab, Tabs } from '@mui/material';

// Styled components for Header
export const StyledAppBar = styled(AppBar)`
    position: sticky;
    background-color: #004260; /* Material UI primary color */
`;

export const StyledToolbar = styled(Toolbar)`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const Logo = styled('img')`
    height: 40px;
    margin-right: 16px;
`;

export const HeaderTitle = styled(Typography)`
    font-weight: bold;
    color: white;
`;

export const NavButtons = styled(Box)`
    display: flex;
    align-items: center;
`;

export const NavButton = styled(Button)`
    color: white;
    margin-left: 16px;
    &:hover {
        background-color: rgba(255, 255, 255, 0.1); /* Slight grey on hover */
        transform: scale(1.05); /* Slight scaling effect on hover */
    }
`;

export const NavButtonActive = styled(NavButton)`
    font-weight: bold;
    color: rgba(255, 255, 255, 0.1);
`;

export const StyledTabs = styled(Tabs)`
  .MuiTabs-indicator {
    background-color: transparent; /* Transparent for indicator */
  }
`;

export const StyledTab = styled(Tab)`
    color: white; /* Default color for tab text */
    padding: 6px 16px; /* Adjusted padding to match button size */
    border-radius: 12px; /* Slightly round the edges */
    font-size: 14px; /* Adjust font size to make it consistent with buttons */
    transition: background-color 0.3s; /* Smooth transition for hover effects */
    margin: 0 4px; /* Add horizontal margin between tabs */

    &.Mui-selected {
        color: white; /* Active tab color */
        font-weight: bold;
        background-color: rgba(255, 255, 255, 0.1); /* Slight grey on active tab */
        border-radius: 12px; /* Keep the rounded corners on active tab */
    }

    &:hover {
        color: white; /* Hover color */
        background-color: rgba(255, 255, 255, 0.1); /* Slight grey on hover */
        transform: scale(1.05); /* Slight scaling effect on hover */
    }
`;

export const Footer = styled('footer')`
    text-align: center;
    padding: 16px;
    background-color: #004260;
    color: white;
`;
