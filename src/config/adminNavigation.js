import {
    Dashboard,
    People,
    SportsFootball,
    EmojiEvents,
    Settings,
    Headset,
    History,
    Assessment,
    TrendingUp
} from '@mui/icons-material';

export const adminNavigationItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { label: 'User Management', icon: <People />, path: '/admin/user-management' },
    { label: 'Coach Management', icon: <Headset />, path: '/admin/coach-management' },
    { label: 'Team Management', icon: <EmojiEvents />, path: '/admin/team-management' },
    { label: 'Game Management', icon: <SportsFootball />, path: '/admin/game-management' },
    { label: 'Stats Management', icon: <Assessment />, path: '/admin/stats-management' },
    { label: 'Reports', icon: <TrendingUp />, path: '/admin/reports' },
    { label: 'System Settings', icon: <Settings />, path: '/admin/settings' },
];
