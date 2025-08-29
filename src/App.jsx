import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/header/Header';
import {
    Home,
    GameDetails,
    Scoreboard,
    Teams,
    TeamDetails,
    Login,
    ModifyTeam,
    Registration,
    Profile,
    Admin,
    Verify,
    NotFound,
    Error
} from './pages';
import { getUserById } from './api/userApi';
import { checkIfUserIsAdmin } from "./utils/utils";
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/system';
import {
    ResetPassword,
    Complete,
    RegistrationSuccess,
    Standings,
    Rankings,
    TeamManagement,
    TeamEdit,
    GameManagement,
    UserManagement,
    CoachManagement
} from './pages';
import Theme from "./styles/Theme";

// Component to conditionally render header
const ConditionalHeader = ({ isAuthenticated, isAdmin, user, setIsAuthenticated, setUser, setIsAdmin }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');
    
    if (isAdminRoute) {
        return null; // Don't render header for admin routes
    }
    
    return (
        <Header
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            user={user}
            setIsAuthenticated={setIsAuthenticated}
            setUser={setUser}
            setIsAdmin={setIsAdmin}
        />
    );
};

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState({});

    useEffect(() => {
        const initializeApp = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (token && userId) {
                setIsAuthenticated(true);
                if (checkIfUserIsAdmin()) setIsAdmin(true);

                try {
                    const userData = await getUserById(userId);
                    setUser(userData);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setIsAuthenticated(false);
                    setUser({});
                }
            } else {
                setIsAuthenticated(false);
                setUser({});
            }
        };

        initializeApp();
    }, []);

    return (
        <ThemeProvider theme={Theme}>
            <Router>
                <CssBaseline />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '100vh',
                        background: 'background.default',
                    }}
                >
                    <ConditionalHeader
                        isAuthenticated={isAuthenticated}
                        isAdmin={isAdmin}
                        user={user}
                        setIsAuthenticated={setIsAuthenticated}
                        setUser={setUser}
                        setIsAdmin={setIsAdmin}
                    />
                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} setIsAdmin={setIsAdmin} />} />
                            <Route path="/register" element={<Registration />} />
                            <Route path="/register/complete" element={<Complete />} />
                            <Route path="/register/success" element={<RegistrationSuccess />} />
                            <Route path="/profile" element={<Profile user={user} />} />
                            <Route path="/admin" element={<Admin user={user} />} />
                            <Route path="/admin/user-management" element={<UserManagement user={user} />} />
                            <Route path="/admin/coach-management" element={<CoachManagement user={user} />} />
                            <Route path="/admin/game-management" element={<GameManagement user={user} />} />
                            <Route path="/admin/team-management" element={<TeamManagement user={user} />} />
                            <Route path="/admin/teams/:teamId" element={<TeamEdit user={user} />} />
                            <Route path="/verify" element={<Verify
                                userId={new URLSearchParams(window.location.search).get('id')}/>} />
                            <Route path="/game-details/:gameId" element={<GameDetails />} />
                            <Route path="/team/:teamId" element={<TeamDetails />} />
                            <Route path="/team-details/:teamId" element={<TeamDetails user={user}/>} />
                            <Route path="/modify-team/:teamId" element={<ModifyTeam user={user} />} />
                            <Route path="/standings" element={<Standings />} />
                            <Route path="/rankings" element={<Rankings />} />
                            <Route path="/scoreboard" element={<Scoreboard />} />
                            <Route path="/teams" element={<Teams />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/error" element={<Error />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Box>
                </Box>
            </Router>
        </ThemeProvider>
    );
};

export default App;