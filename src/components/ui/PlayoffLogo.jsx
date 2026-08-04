import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { useColorMode } from '../../theme/ColorModeContext';
import playoffLight from '../../assets/images/playoff.png';
import playoffDark from '../../assets/images/playoff_dark.png';

const PlayoffLogo = ({ size = 16 }) => {
    const { mode } = useColorMode();
    return <Box component="img" src={mode === 'dark' ? playoffDark : playoffLight} alt="" sx={{ height: size, width: 'auto', flexShrink: 0, display: 'block' }} />;
};

PlayoffLogo.propTypes = { size: PropTypes.number };

export default PlayoffLogo;
