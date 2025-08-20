import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#004260',
            light: '#1e5a7a',
            dark: '#002d42',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#d12a2e', 
            light: '#e85a5e',
            dark: '#b91c1c',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            dark: '#0f172a',
        },
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
        success: {
            main: '#059669',
        },
        warning: {
            main: '#d97706',
        },
        error: {
            main: '#dc2626',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h4: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h5: {
            fontSize: '1.125rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
            letterSpacing: '0.025em',
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0px 1px 2px rgba(0, 0, 0, 0.05)',
        '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                'html, body, #root': {
                    height: '100%',
                    margin: 0,
                    padding: 0,
                    overflowX: 'hidden',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                },
                main: {
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 'calc(100vh - 80px)',
                    overflowY: 'auto',
                    background: '#f8fafc',
                },
                '::-webkit-scrollbar': {
                    width: '8px',
                },
                '::-webkit-scrollbar-track': {
                    background: '#f1f5f9',
                },
                '::-webkit-scrollbar-thumb': {
                    background: '#cbd5e1',
                    borderRadius: '4px',
                },
                '::-webkit-scrollbar-thumb:hover': {
                    background: '#94a3b8',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '10px 24px',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
                    },
                },
                contained: {
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                },
            },
        },
    },
    // Custom theme extensions
    custom: {
        gradients: {
            primary: 'linear-gradient(135deg, #004260 0%, #1e5a7a 100%)',
            secondary: 'linear-gradient(135deg, #d12a2e 0%, #e85a5e 100%)',
            sports: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            dark: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        },
        spacing: {
            section: '80px',
            container: '1200px',
        },
    },
});

export default theme;