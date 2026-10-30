import React from 'react';
import { Box } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faPatreon } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';
import { compact, secondaryButtonSx } from '../../styles/controls';
import logo from '../../assets/graphics/main_logo.png';

const linkSx = { ...compact(secondaryButtonSx), gap: '6px', textDecoration: 'none' };

const HomeHeader = ({ season, week }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap',
            p: '8px 14px',
            background: 'linear-gradient(110deg, var(--brand-deep), #01293b)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-lg)',
        }}
    >
        <Box component="img" src={logo} alt="FCFB" sx={{ height: 34, width: 'auto' }} />
        <Box>
            <Box sx={{ fontFamily: 'var(--cond)', fontWeight: 800, textTransform: 'uppercase', color: '#fff' }}>
                Fake College Football
            </Box>
            <Box sx={{ fontSize: '0.72rem', color: '#9fd6ec', fontWeight: 700 }}>
                {season ? `Season ${season}${week ? `, Week ${week}` : ''}` : 'Between seasons'}
            </Box>
        </Box>
        <Box sx={{ flex: 1 }} />
        <Box component="a" href="https://discord.gg/fcfb" target="_blank" rel="noopener noreferrer" sx={linkSx}>
            <FontAwesomeIcon icon={faDiscord} /> Discord
        </Box>
        <Box component="a" href="https://www.patreon.com/fakecfb" target="_blank" rel="noopener noreferrer" sx={linkSx}>
            <FontAwesomeIcon icon={faPatreon} /> Patreon
        </Box>
    </Box>
);

HomeHeader.propTypes = {
    season: PropTypes.number,
    week: PropTypes.number,
};

export default HomeHeader;
