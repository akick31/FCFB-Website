import {
    Dashboard,
    People,
    SportsFootball,
    EmojiEvents,
    Settings,
    Headset
} from '@mui/icons-material';

export const adminNavigationItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { label: 'User Management', icon: <People />, path: '/admin/user-management' },
    { label: 'Coach Management', icon: <Headset />, path: '/admin/coach-management' },
    { label: 'Team Management', icon: <EmojiEvents />, path: '/admin/team-management' },
    { label: 'Game Management', icon: <SportsFootball />, path: '/admin/game-management' },
    { label: 'System Settings', icon: <Settings />, path: '/admin/settings' },
];
