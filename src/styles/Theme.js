import { createTheme } from '@mui/material/styles';
import { TOKENS, SANS, COND } from './tokens';

export const createAppTheme = (mode = 'dark') => {
    const t = TOKENS[mode] || TOKENS.dark;

    return createTheme({
        palette: {
            mode,
            primary: { main: t.brand, dark: t.brandDeep, light: t.brand, contrastText: '#ffffff' },
            secondary: { main: t.live, contrastText: '#ffffff' },
            background: { default: t.ground, paper: t.surface },
            text: { primary: t.text, secondary: t.textMuted, disabled: t.textDim },
            success: { main: t.field },
            warning: { main: t.gold },
            error: { main: t.live },
            divider: t.line,
        },
        typography: {
            fontFamily: SANS,
            h1: { fontFamily: COND, fontWeight: 800, fontSize: '2.4rem', lineHeight: 1, letterSpacing: '-0.01em', textTransform: 'uppercase' },
            h2: { fontFamily: COND, fontWeight: 800, fontSize: '1.7rem', lineHeight: 1.05, textTransform: 'uppercase' },
            h3: { fontFamily: COND, fontWeight: 800, fontSize: '1.2rem', textTransform: 'uppercase' },
            h4: { fontWeight: 700, fontSize: '1.1rem' },
            h5: { fontWeight: 700, fontSize: '1rem' },
            h6: { fontWeight: 700, fontSize: '0.95rem' },
            body1: { fontSize: '0.9375rem', lineHeight: 1.5 },
            body2: { fontSize: '0.82rem', lineHeight: 1.5 },
            button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0 },
        },
        shape: { borderRadius: 7 },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    'html, body, #root': {
                        height: '100%',
                        margin: 0,
                        padding: 0,
                        overflowX: 'hidden',
                        backgroundColor: t.ground,
                        color: t.text,
                        fontFamily: SANS,
                    },
                    '::-webkit-scrollbar': { width: '8px', height: '8px' },
                    '::-webkit-scrollbar-track': { background: t.lineSoft },
                    '::-webkit-scrollbar-thumb': { background: t.line, borderRadius: '4px' },
                    '::-webkit-scrollbar-thumb:hover': { background: t.textDim },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: { borderRadius: 4, textTransform: 'none', fontWeight: 700 },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: { backgroundImage: 'none', border: `1px solid ${t.line}` },
                },
            },
        },
        tokens: t,
        fonts: { sans: SANS, cond: COND },
    });
};

export default createAppTheme('dark');
