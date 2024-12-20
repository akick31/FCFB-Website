import {Box, Container, Paper, Tab, Tabs, Typography} from "@mui/material"; // Import necessary Material UI components
import { styled } from '@mui/system';

const COLORS = {
    text: {
        primary: '#333333',
        secondary: '#666666',
        light: '#ffffff'
    },
    background: {
        light: '#ffffff',
        white: '#ffffff'
    },
    error: {
        main: '#d32f2f',
        light: '#f3e6e6'
    },
    success: {
        main: '#2e7d32',
        light: '#e6f3e6'
    }
};

// Styled components
export const CenteredContainer = styled(Box)`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
`;

export const ErrorText = styled(Typography)`
    color: red;
    font-size: 18px;
`;

export const InfoText = styled(Typography)`
    color: #004260;
    font-size: 18px;
`;

export const PlayHighlight = {
    touchdown: {
        backgroundColor: COLORS.success.light,
        color: COLORS.success.main
    },
    turnover: {
        backgroundColor: COLORS.error.light,
        color: COLORS.error.main
    },
    defaultPlay: {
        backgroundColor: 'inherit'
    }
};

export const getPlayHighlightStyle = (play) => {
    if (play.result === 'Touchdown') return PlayHighlight.touchdown;
    if (play.result === 'Turnover') return PlayHighlight.turnover;
    return PlayHighlight.defaultPlay;
};

export const StyledContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

export const Header = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    textAlign: 'center',
}));

export const LoadingContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    width: '100%',
});

export const SearchFilterContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
    },
}));

export const StyledTabs = styled(Tabs)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    marginLeft: 'auto',
    '& .MuiTabs-indicator': {
        display: 'none'
    },
}));

export const StyledTab = styled(Tab)(({ theme }) => ({
    color: '#004260',  // Default color for the tabs
    padding: '6px 16px',  // Adjust padding for tabs
    fontWeight: 500,
    margin: '0 8px',
    '&.Mui-selected': {
        color: '#004260',  // Change the text color of the selected tab to the blue (same as header)
        backgroundColor: 'rgba(0, 66, 96, 0.1)',  // Slight transparent white background on active tab
        fontWeight: 'bold',
        borderRadius: '12px',

    },
    '&:hover': {
        backgroundColor: 'rgba(0, 66, 96, 0.1)',  // Slight hover effect
        transform: 'scale(1.05)',  // Slight scaling on hover
        borderRadius: 12,
    },
}));
