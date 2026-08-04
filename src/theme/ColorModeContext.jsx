import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';
import PropTypes from 'prop-types';
import { createAppTheme } from '../styles/Theme';
import { tokenCss } from '../styles/tokens';

const STORAGE_KEY = 'fcfb-theme';

const ColorModeContext = createContext({ mode: 'dark', setMode: () => {}, toggle: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

const readStoredMode = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
        return null;
    }
};

export const ColorModeProvider = ({ children }) => {
    const [mode, setModeState] = useState('dark');

    useEffect(() => {
        const stored = readStoredMode();
        if (stored) setModeState(stored);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
    }, [mode]);

    const setMode = useCallback((next) => {
        setModeState(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            /* storage unavailable */
        }
    }, []);

    const toggle = useCallback(() => setMode(mode === 'dark' ? 'light' : 'dark'), [mode, setMode]);

    const theme = useMemo(() => createAppTheme(mode), [mode]);
    const value = useMemo(() => ({ mode, setMode, toggle }), [mode, setMode, toggle]);

    return (
        <ColorModeContext.Provider value={value}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <GlobalStyles styles={tokenCss} />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

ColorModeProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ColorModeContext;
