import { styled } from "@mui/system";
import { AppBar, Toolbar, Tabs, Tab } from "@mui/material";

// Styled components for Header
export const StyledAppBar = styled(AppBar)`
    position: sticky;
    background: linear-gradient(135deg, #004260 0%, #1e5a7a 100%);
    box-shadow: 0 4px 20px rgba(0, 66, 96, 0.3);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 0;
`;

export const StyledToolbar = styled(Toolbar)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 80px;
    padding: 0 24px;
    
    @media (max-width: 768px) {
        padding: 0 16px;
        min-height: 70px;
    }
`;

export const StyledTabs = styled(Tabs)`
    .MuiTabs-indicator {
        background-color: #ffffff;
        height: 3px;
        border-radius: 2px;
    }
    
    @media (max-width: 768px) {
        display: none;
    }
`;

export const StyledTab = styled(Tab)`
    color: rgba(255, 255, 255, 0.9);
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    margin: 0 4px;
    text-transform: none;
    min-height: 48px;

    /* Hover effect for tab */
    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        transform: translateY(-1px);
    }

    /* Selected tab appearance */
    &.Mui-selected {
        background-color: rgba(255, 255, 255, 0.15);
        color: #ffffff;
        font-weight: 600;
        border-radius: 8px;
    }
`;

export const Footer = styled('footer')`
    text-align: center;
    padding: 24px;
    background: linear-gradient(135deg, #004260 0%, #1e5a7a 100%);
    color: white;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
`;