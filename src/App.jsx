import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
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

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState({}); // User object to store user data [username, role, etc.]

    useEffect(() => {
        const fetchData = async () => {
            // Check if authentication token exists in local storage
            if (localStorage.getItem('token') === null) {
                setIsAuthenticated(false);
                setUser({});
                return;
            }

            const authToken = localStorage.getItem('token');
            const storedUserId = localStorage.getItem('userId');

            const user = await getUserById(storedUserId);

            if (authToken) {
                // User is authenticated
                setIsAuthenticated(true);
                setUser(user);
            } else {
                // User is not authenticated
                setIsAuthenticated(false);
                setUser({});
            }
        }

        fetchData();
    }, []);

    return (
        <Router>
            <div>
                <Header
                    isAuthenticated={isAuthenticated}
                    user={user}
                    setIsAuthenticated={setIsAuthenticated}
                    setUser={setUser}
                />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
                    <Route path="/register" element={<Registration />} />
                    <Route path="/profile" element={<Profile user={user}/>} />
                    <Route path="/admin" element={<AdminPage user={user}/>} />
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
}

export default App;
