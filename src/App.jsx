import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './layouts/Header';
import Home from './pages/Home';
import GameDetails from "./pages/GameDetails";
import Games from './pages/Games';
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
import { CssBaseline } from '@mui/material'; // MUI reset and normalization
import { Box } from '@mui/system';
import NewSignups from "./pages/NewSignups"; // Box component for layout control

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
        <Router>
            <CssBaseline /> {/* Normalize and reset browser styles */}
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    margin: 0, // Remove margin from the entire body
                    padding: 0, // Remove padding
                    backgroundColor: '#f5f5f5', // Set the background color of the whole page to light gray
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
                        paddingTop: 8,
                        paddingX: 2,
                        backgroundColor: '#ffffff',
                    }}
                >
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} setIsAdmin={setIsAdmin} />} />
                        <Route path="/register" element={<Registration />} />
                        <Route path="/profile" element={<Profile user={user} />} />
                        <Route path="/admin" element={<Admin user={user} />} />
                        <Route path="/verify" element={<Verify
                            userId={new URLSearchParams(window.location.search).get('id')}
                            token={new URLSearchParams(window.location.search).get('token')} />} />
                        <Route path="/game-details/:gameId" element={<GameDetails />} />
                        <Route path="/team-details/:teamId" element={<TeamDetails user={user}/>} />
                        <Route path="/modify-team/:teamId" element={<ModifyTeam user={user} />} />
                        <Route path="/new-signups" element={<NewSignups user={user} />} />
                        <Route path="/games" element={<Games />} />
                        <Route path="/teams" element={<Teams />} />
                        <Route path="/users" element={<Users user={user}/>} />
                        <Route path="/error" element={<ErrorPage />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Box>
            </Box>
        </Router>
    );
};

export default App;