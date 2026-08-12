import React, { useEffect, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/layout/Footer';
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
    Error,
    UserDetails,
    Coaches,
    ApiDocs
} from './pages';
import { getUserById } from './api/userApi';
import { checkIfUserIsAdmin } from "./utils/utils";
import { Box } from '@mui/system';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ColorModeProvider } from './theme/ColorModeContext';
import {
    ResetPassword,
    Complete,
    RegistrationSuccess,
    Standings,
    Rankings,
    RiceSheet,
    Schedule,
    TeamManagement,
    EditTeam,
    EditCoach,
    AdminConferences,
    AdminConferenceDetail,
    GameManagement,
    UserManagement,
    CoachTransactionLog,
    EditGame,
    StatsManagement,
    Reports,
    Scheduling,
    SeasonManagement,
    GameWeek,
    RankingsManagement,
    Stats,
    RecordsBoard,
    Graphs,
    AdminApiDocs
} from './pages';

const AppRoutes = () => {
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

    useEffect(() => {
        const handleStorageChange = () => {
            if (isAuthenticated) {
                const newAdminStatus = checkIfUserIsAdmin();
                setIsAdmin(newAdminStatus);
            }
        };

        window.addEventListener('storage', handleStorageChange);

        if (isAuthenticated) {
            const newAdminStatus = checkIfUserIsAdmin();
            if (newAdminStatus !== isAdmin) {
                setIsAdmin(newAdminStatus);
            }
        }

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isAuthenticated, isAdmin]);

    return (
        <ColorModeProvider>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    backgroundColor: 'background.default',
                }}
            >
                <Box
                    component="a"
                    href="#main-content"
                    sx={{
                        position: 'absolute',
                        left: '-9999px',
                        top: 0,
                        zIndex: 100,
                        background: 'var(--brand-deep)',
                        color: '#fff',
                        px: 2,
                        py: 1,
                        borderRadius: 'var(--r-sm)',
                        '&:focus': { left: '10px', top: '10px' },
                    }}
                >
                    Skip to main content
                </Box>
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
                    id="main-content"
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
                                <Profile user={user} setUser={setUser} />
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
                        <Route path="/admin/coach-management" element={<Navigate to="/admin/team-management" replace />} />
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
                        <Route path="/admin/stats-management" element={
                            <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                <StatsManagement user={user} />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/reports" element={
                            <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                <Reports user={user} />
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
                        <Route path="/admin/edit-coach/:username" element={
                            <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                <EditCoach user={user} />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/conferences" element={
                            <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                <AdminConferences />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/conferences/:code" element={
                            <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                <AdminConferenceDetail />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/scheduling" element={
                            <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                <Scheduling user={user} />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/season-management" element={
                            <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                <SeasonManagement />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/game-week" element={
                            <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                <GameWeek user={user} />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/rankings" element={
                            <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                <RankingsManagement user={user} />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/api-docs" element={
                            <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                <AdminApiDocs />
                            </ProtectedRoute>
                        } />
                        <Route path="/developers" element={<ApiDocs />} />
                        <Route path="/verify" element={<Verify />} />
                        <Route path="/game-details/:gameId" element={<GameDetails isAdmin={isAdmin} />} />
                        <Route path="/team/:teamId" element={<TeamDetails />} />
                        <Route path="/team-details/:teamId" element={<TeamDetails user={user}/>} />
                        <Route path="/user-details/:coachName" element={<UserDetails />} />
                        <Route path="/modify-team/:teamId" element={
                            <ProtectedRoute requireAuth={true} requireAdmin={true} isAuthenticated={isAuthenticated} isAdmin={isAdmin} loading={loading}>
                                <ModifyTeam />
                            </ProtectedRoute>
                        } />
                        <Route path="/schedules" element={<Schedule />} />
                        <Route path="/schedules/:tab" element={<Schedule />} />
                        <Route path="/schedules/:tab/:selection" element={<Schedule />} />
                        <Route path="/schedules/:tab/:selection/:seasonParam" element={<Schedule />} />
                        <Route path="/standings" element={<Standings />} />
                        <Route path="/standings/:conference" element={<Standings />} />
                        <Route path="/standings/:conference/:seasonParam" element={<Standings />} />
                        <Route path="/rankings" element={<Rankings />} />
                        <Route path="/rankings/:type" element={<Rankings />} />
                        <Route path="/rice-sheet" element={<RiceSheet />} />
                        <Route path="/scoreboard" element={<Scoreboard />} />
                        <Route path="/scoreboard/:tab" element={<Scoreboard />} />
                        <Route path="/scoreboard/:tab/:season/:week" element={<Scoreboard />} />
                        <Route path="/teams" element={<Teams />} />
                        <Route path="/teams/:conference/:availability" element={<Teams />} />
                        <Route path="/coaches" element={<Coaches />} />
                        <Route path="/stats" element={<Stats />} />
                        <Route path="/stats/:sub" element={<Stats />} />
                        <Route path="/stats/:sub/:statKey" element={<Stats />} />
                        <Route path="/records" element={<RecordsBoard user={user} />} />
                        <Route path="/records/:tab" element={<RecordsBoard user={user} />} />
                        <Route path="/season-stats" element={<Navigate to="/stats" replace />} />
                        <Route path="/season-stats/:team/:season" element={<Navigate to="/stats" replace />} />
                        <Route path="/league-stats" element={<Navigate to="/stats/league" replace />} />
                        <Route path="/league-stats/:tab/:season" element={<Navigate to="/stats/league" replace />} />
                        <Route path="/league-stats/:tab/:season/:p1" element={<Navigate to="/stats/league" replace />} />
                        <Route path="/league-stats/:tab/:season/:p1/:p2" element={<Navigate to="/stats/league" replace />} />
                        <Route path="/leaderboard" element={<Navigate to="/stats/leaderboard" replace />} />
                        <Route path="/elo-history" element={<Navigate to="/graphs/rankings/elo" replace />} />
                        <Route path="/graphs" element={<Graphs />} />
                        <Route path="/graphs/:tab" element={<Graphs />} />
                        <Route path="/graphs/:tab/:sub" element={<Graphs />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        <Route path="/error" element={<Error />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Box>
                <Footer />
            </Box>
        </ColorModeProvider>
    );
};

export default AppRoutes;
