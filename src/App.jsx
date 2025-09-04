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
import ProtectedRoute from './components/auth/ProtectedRoute';
import {
    ResetPassword,
    Complete,
    RegistrationSuccess,
    Standings,
    Rankings,
    TeamManagement,
    EditTeam,
    GameManagement,
    UserManagement,
    CoachManagement,
    CoachTransactionLog,
    EditGame,
    Records,
    SeasonStats,
    LeagueStats,
    Leaderboard
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeApp = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (token && userId) {
                setIsAuthenticated(true);
                const adminStatus = checkIfUserIsAdmin();
                console.log('Initial admin check - token:', !!token, 'userId:', !!userId, 'adminStatus:', adminStatus);
                setIsAdmin(adminStatus);

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
            setLoading(false);
        };

        initializeApp();
    }, []);

    // Watch for changes in localStorage role to update admin state
    useEffect(() => {
        const handleStorageChange = () => {
            if (isAuthenticated) {
                const newAdminStatus = checkIfUserIsAdmin();
                console.log('Storage change detected, new admin status:', newAdminStatus);
                setIsAdmin(newAdminStatus);
            }
        };

        // Listen for storage events (when localStorage changes in other tabs)
        window.addEventListener('storage', handleStorageChange);
        
        // Also check when the component re-renders
        if (isAuthenticated) {
            const newAdminStatus = checkIfUserIsAdmin();
            console.log('Checking admin status on re-render:', newAdminStatus, 'current isAdmin:', isAdmin);
            if (newAdminStatus !== isAdmin) {
                console.log('Admin status changed from', isAdmin, 'to', newAdminStatus);
                setIsAdmin(newAdminStatus);
            }
        }

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isAuthenticated, isAdmin]);

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
                            <Route path="/profile" element={
                                <ProtectedRoute requireAuth={true} requireAdmin={false} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                    <Profile user={user} />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin" element={
                                <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                    <Admin user={user} />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/user-management" element={
                                <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                    <UserManagement user={user} />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/coach-management" element={
                                <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                    <CoachManagement user={user} />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/game-management" element={
                                <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                    <GameManagement user={user} />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/team-management" element={
                                <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                    <TeamManagement user={user} />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/coach-transaction-log" element={
                                <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                    <CoachTransactionLog user={user} />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/edit-game/:gameId" element={
                                <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                    <EditGame user={user} />
                                </ProtectedRoute>
                            } />
                            <Route path="/admin/edit-team/:teamId" element={
                                <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                    <EditTeam user={user} />
                                </ProtectedRoute>
                            } />
                            <Route path="/verify" element={<Verify
                                userId={new URLSearchParams(window.location.search).get('id')}/>} />
                            <Route path="/game-details/:gameId" element={<GameDetails />} />
                            <Route path="/team/:teamId" element={<TeamDetails />} />
                            <Route path="/team-details/:teamId" element={<TeamDetails user={user}/>} />
                            <Route path="/modify-team/:teamId" element={
                                <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                    <ModifyTeam user={user} />
                                </ProtectedRoute>
                            } />
                            <Route path="/standings" element={<Standings />} />
                            <Route path="/rankings" element={<Rankings />} />
                            <Route path="/scoreboard" element={<Scoreboard />} />
                            <Route path="/teams" element={<Teams />} />
                            <Route path="/records" element={<Records />} />
                            <Route path="/season-stats" element={<SeasonStats user={user} />} />
                            <Route path="/league-stats" element={<LeagueStats />} />
                            <Route path="/leaderboard" element={<Leaderboard />} />
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