import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#004260', // Your standard blue
            secondary: '#d12a2e', // Your standard red
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                'html, body, #root': {
                    height: '100%',
                    margin: 0,
                    padding: 0,
                    overflowX: 'hidden',
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #c3cfe2 100%)',
                },
                main: {
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 'calc(100vh - 64px)',
                    overflowY: 'auto',
                    background: 'linear-gradient(135deg, #f5f5f5 0%, #c3cfe2 100%)',
                },
            },
        },
    },
    lockIcon: {
        fontSize: 48,
        color: 'primary.main',
        mb: 2,
    },
    header: {
        textAlign: 'center',
        py: 2,
    },
    root: {
        display: "flex",
        justifyContent: "center",
        width: "100%",
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
        p: { xs: 2, sm: 3 },
        mt: -3
    },
    formCard: {
        width: "100%",
        maxWidth: 500,
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    },
    standardCard: {
        width: "100%",
        maxWidth: "80%",
        p: { xs: 8, sm: 8 },
        borderRadius: 4,
        boxShadow: '0 10px 32px rgba(0,0,0,0.3)',
    },
    subCard: {
        mb: 4,
        p: 2,
        border: '2px solid #e0e0e0',
        borderRadius: 4,
        boxShadow: '0 10px 32px rgba(0,0,0,0.1)',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        mt: 4,
        mb: -6
    }
});

export default theme;