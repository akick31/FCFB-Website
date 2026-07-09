import {Box, Container, Tab, Tabs} from "@mui/material";
import { styled } from '@mui/system';

export const StyledContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
}));

export const Header = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    textAlign: 'center',
}));

export const StyledTabs = styled(Tabs)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    marginLeft: 'auto',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    '& .MuiTabs-indicator': {
        display: 'none'
    },
    '& .MuiTab-root': {
        backgroundColor: 'transparent',
        color: theme.palette.text.primary,
        '&:hover': {
            backgroundColor: 'rgba(0, 66, 96, 0.1)'
        },
        '&.Mui-selected': {
            backgroundColor: 'rgba(0, 66, 96, 0.1)',
            color: theme.palette.primary.main
        },
    }
}));

export const StyledTab = styled(Tab)(() => ({
    color: '#004260',
    padding: '6px 16px',
    fontWeight: 500,
    margin: '0 8px',
    '&.Mui-selected': {
        color: '#004260',
        backgroundColor: 'rgba(0, 66, 96, 0.1)',
        fontWeight: 'bold',
        borderRadius: '12px',

    },
    '&:hover': {
        backgroundColor: 'rgba(0, 66, 96, 0.1)',
        transform: 'scale(1.05)',
        borderRadius: 12,
    },
}));
