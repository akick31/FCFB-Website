import React from 'react';
import { Box } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { adminNavigationItems } from '../../config/adminNavigation.jsx';

const AdminNav = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) =>
        path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

    const current = adminNavigationItems.find((item) => isActive(item.path)) || adminNavigationItems[0];

    return (
        <>
            <Box
                component="select"
                aria-label="Admin section"
                value={current.path}
                onChange={(event) => navigate(event.target.value)}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    width: '100%',
                    height: '40px',
                    px: '10px',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    font: 'inherit',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                }}
            >
                {adminNavigationItems.map((item) => (
                    <option key={item.path} value={item.path}>
                        {item.label}
                    </option>
                ))}
            </Box>
            <Box
                sx={{
                    display: { xs: 'none', md: 'block' },
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-lg)',
                    overflow: 'hidden',
                    height: 'max-content',
                }}
            >
                {adminNavigationItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Box
                            key={item.path}
                            component={Link}
                            to={item.path}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '9px',
                                px: '12px',
                                py: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: active ? 'var(--text)' : 'var(--text-muted)',
                                background: active
                                    ? 'color-mix(in srgb, var(--brand) 10%, var(--surface))'
                                    : 'transparent',
                                boxShadow: active ? 'inset 3px 0 0 var(--live)' : 'none',
                                borderBottom: '1px solid var(--line-soft)',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                '&:last-of-type': { borderBottom: 0 },
                                '&:hover': { background: active ? undefined : 'var(--surface-2)' },
                                '&:focus-visible': { outline: '2px solid var(--brand)', outlineOffset: '-2px' },
                            }}
                        >
                            <Box sx={{ display: 'flex', flexShrink: 0, '& svg': { fontSize: '1.05rem' } }}>
                                {item.icon}
                            </Box>
                            <Box
                                component="span"
                                sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                                {item.label}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </>
    );
};

export default AdminNav;
