import React, { useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { clientId, redirectUri } from '../../config/discord';
import { rowSx, lblSx, descSx, ctrlSx } from './profileStyles';

const DiscordRow = ({ user }) => {
    const [notice, setNotice] = useState('');

    const handleLink = () => {
        const token = localStorage.getItem('token');
        if (!clientId || !token) {
            setNotice('Discord sign-in is not configured yet.');
            return;
        }
        const discordOAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify&state=${encodeURIComponent(token)}`;
        window.location.href = discordOAuthUrl;
    };

    return (
        <Box sx={rowSx}>
            <Box>
                <Box sx={lblSx}>Discord</Box>
                <Box sx={descSx}>
                    {user.discord_id ? `Linked${user.discord_tag ? ` as ${user.discord_tag}` : ''}` : 'Not linked'}
                </Box>
                {notice && <Box sx={{ ...descSx, color: 'var(--gold)', mt: 0.5 }}>{notice}</Box>}
            </Box>
            <Box component="button" sx={ctrlSx} onClick={handleLink}>
                {user.discord_id ? 'Relink' : 'Link Discord account'}
            </Box>
        </Box>
    );
};

DiscordRow.propTypes = { user: PropTypes.object.isRequired };

export default DiscordRow;
