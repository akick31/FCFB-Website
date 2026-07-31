import React from 'react';
import { Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminNavigationItems } from '../../config/adminNavigation.jsx';

const AdminNav = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => (path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path));

    return (
        <Box sx={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden', height: 'max-content' }}>
            {adminNavigationItems.map((item) => {
                const active = isActive(item.path);
                return (
                    <Box
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        role="link"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '9px',
                            px: '14px',
                            py: '11px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: active ? 'var(--text)' : 'var(--text-muted)',
                            background: active ? 'color-mix(in srgb, var(--brand) 10%, var(--surface))' : 'transparent',
                            boxShadow: active ? 'inset 3px 0 0 var(--live)' : 'none',
                            borderBottom: '1px solid var(--line-soft)',
                            cursor: 'pointer',
                            '&:last-of-type': { borderBottom: 0 },
                            '&:hover': { background: active ? undefined : 'var(--surface-2)' },
                        }}
                    >
                        <Box sx={{ display: 'flex', '& svg': { fontSize: '1.05rem' } }}>{item.icon}</Box>
                        {item.label}
                    </Box>
                );
            })}
        </Box>
    );
};

export default AdminNav;
