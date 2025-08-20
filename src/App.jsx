import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header/Header';
import Home from './pages/Home';
import GameDetails from "./pages/GameDetails";
import Scoreboard from './pages/Scoreboard';
import Teams from './pages/Teams';
import TeamDetails from './pages/TeamDetails';
import Login from './pages/Login';
import ModifyTeam from './pages/ModifyTeam';
import Registration from './pages/Registration';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Verify from "./pages/Verify";
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import ErrorPage from "./pages/Error";
import { getUserById } from './api/userApi';
import { checkIfUserIsAdmin } from "./utils/utils";
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/system';
import NewSignups from "./pages/NewSignups";
import Theme from "./styles/Theme";
import ResetPassword from "./pages/ResetPassword";
import FinishRegistration from "./pages/FinishRegistration";
import OpenTeams from "./pages/OpenTeams";

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
                    <Header
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
                            <Route path="/finish-registration" element={<FinishRegistration />} />
                            <Route path="/profile" element={<Profile user={user} />} />
                            <Route path="/admin" element={<Admin user={user} />} />
                            <Route path="/verify" element={<Verify
                                userId={new URLSearchParams(window.location.search).get('id')}/>} />
                            <Route path="/game-details/:gameId" element={<GameDetails />} />
                            <Route path="/team/:teamId" element={<TeamDetails />} />
                            <Route path="/team-details/:teamId" element={<TeamDetails user={user}/>} />
                            <Route path="/modify-team/:teamId" element={<ModifyTeam user={user} />} />
                            <Route path="/new-signups" element={<NewSignups user={user} />} />
                            <Route path="/open-teams" element={<OpenTeams user={user} />} />
                            <Route path="/scoreboard" element={<Scoreboard />} />
                            <Route path="/teams" element={<Teams />} />
                            <Route path="/users" element={<Users user={user}/>} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                            <Route path="/error" element={<ErrorPage />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Box>
                </Box>
            </Router>
        </ThemeProvider>
    );
};

export default App;