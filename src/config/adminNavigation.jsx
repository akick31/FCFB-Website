import {
    Dashboard,
    People,
    SportsFootball,
    EmojiEvents,
    Assessment,
    TrendingUp,
    CalendarMonth,
    FormatListNumbered,
    AccountTree,
} from '@mui/icons-material';

export const adminNavigationItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { label: 'User Management', icon: <People />, path: '/admin/user-management' },
    { label: 'Team Management', icon: <EmojiEvents />, path: '/admin/team-management' },
    { label: 'Conference Management', icon: <AccountTree />, path: '/admin/conferences' },
    { label: 'Game Management', icon: <SportsFootball />, path: '/admin/game-management' },
    { label: 'Scheduling', icon: <CalendarMonth />, path: '/admin/scheduling' },
    { label: 'Rankings', icon: <FormatListNumbered />, path: '/admin/rankings' },
    { label: 'Stats Management', icon: <Assessment />, path: '/admin/stats-management' },
    { label: 'Reports', icon: <TrendingUp />, path: '/admin/reports' },
];
