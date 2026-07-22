import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { logout } from '../../api/authApi';
import { getTeamByName } from '../../api/teamApi';
import CommandBar from './CommandBar';
import LiveTicker from './LiveTicker';
import MobileNavDrawer from './MobileNavDrawer';

const Header = ({ isAuthenticated, isAdmin, user, setIsAuthenticated, setUser, setIsAdmin }) => {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [teamLogo, setTeamLogo] = useState(null);

    useEffect(() => {
        if (!user?.team) {
            setTeamLogo(null);
            return;
        }
        let active = true;
        getTeamByName(user.team)
            .then((team) => { if (active) setTeamLogo(team?.logo || null); })
            .catch(() => { if (active) setTeamLogo(null); });
        return () => { active = false; };
    }, [user?.team]);

    const handleLogout = () => {
        logout(setIsAuthenticated, setUser, setIsAdmin);
        localStorage.removeItem('role');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
        navigate('/');
    };

    return (
        <Box sx={{ position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 3px 10px rgba(0,0,0,0.4)' }}>
            <CommandBar
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
                user={user}
                teamLogo={teamLogo}
                onMobileOpen={() => setMobileOpen(true)}
                onLogout={handleLogout}
            />
            <LiveTicker />
            <MobileNavDrawer
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
                onLogout={handleLogout}
            />
        </Box>
    );
};

Header.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    isAdmin: PropTypes.bool.isRequired,
    user: PropTypes.object,
    setIsAuthenticated: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    setIsAdmin: PropTypes.func.isRequired,
};

export default Header;
