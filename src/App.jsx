import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles/styles.css';
import Header from './layouts/Header';
import Home from './pages/Home';
import GameDetails from "./pages/GameDetails";
import Games from './pages/Games';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Profile from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import Verify from "./pages/Verify";
import NotFound from './pages/NotFound';
import ErrorPage from "./pages/ErrorPage";
import { getUserById } from './api/userApi';
import { checkIfUserIsAdmin } from "./utils/utils";

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
            <div>
                <Header
                    isAuthenticated={isAuthenticated}
                    isAdmin={isAdmin}
                    user={user}
                    setIsAuthenticated={setIsAuthenticated}
                    setUser={setUser}
                    setIsAdmin={setIsAdmin}
                />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} setIsAdmin={setIsAdmin} />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/profile" element={<Profile user={user} />} />
                    <Route path="/admin" element={<AdminPage user={user} />} />
                    <Route path="/verify" element={<Verify
                        userId={new URLSearchParams(window.location.search).get('id')}
                        token={new URLSearchParams(window.location.search).get('token')} />} />
                    <Route path="/game-details/:gameId" element={<GameDetails />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/error" element={<ErrorPage />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
