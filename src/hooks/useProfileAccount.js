import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    getUserById,
    updateUser,
    updateUsername,
    updateEmail,
    updatePassword,
    updateDelayOfGameWarningOptOut,
} from '../api/userApi';
import { logout } from '../api/authApi';

const useProfileAccount = ({ user, setUser, setIsAuthenticated, setIsAdmin }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const scopeRef = useRef(null);
    const mountRef = useRef(null);
    const userRef = useRef(user);
    userRef.current = user;

    useEffect(() => {
        const mount = { active: true };
        mountRef.current = mount;
        return () => {
            mount.active = false;
        };
    }, []);

    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        return () => {
            scope.active = false;
        };
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) {
            return;
        }
        const linked = searchParams.get('discordLinked');
        const discordError = searchParams.get('discordError');
        if (!linked && !discordError) {
            return;
        }
        let active = true;
        const token = localStorage.getItem('token');
        if (linked) {
            getUserById(user.id)
                .then((fresh) => {
                    if (active && localStorage.getItem('token') === token) {
                        setUser?.((prev) =>
                            active && prev?.id === user.id && localStorage.getItem('token') === token
                                ? { ...prev, discord_id: fresh.discord_id, discord_tag: fresh.discord_tag }
                                : prev
                        );
                    }
                })
                .catch(() => {});
        }
        const next = new URLSearchParams(searchParams);
        next.delete('discordLinked');
        next.delete('discordError');
        setSearchParams(next, { replace: true });
        return () => {
            active = false;
        };
    }, [user?.id]);

    const saveProfileChange = async (write, updates) => {
        const scope = scopeRef.current;
        const token = localStorage.getItem('token');
        await write();
        if (scope.active && localStorage.getItem('token') === token) {
            setUser?.((prev) =>
                scope.active && prev?.id === user.id && localStorage.getItem('token') === token
                    ? { ...prev, ...updates }
                    : prev
            );
        }
    };

    const handleLogout = async () => {
        const mount = mountRef.current;
        const token = localStorage.getItem('token');
        await logout(setIsAuthenticated || (() => {}), setUser, setIsAdmin || (() => {})).catch(() => {
            console.error('Logout request failed.');
        });
        const currentToken = localStorage.getItem('token');
        if (
            mount.active &&
            (!userRef.current || userRef.current.id === user.id) &&
            (!currentToken || currentToken === token)
        ) {
            navigate('/');
        }
    };

    const saveCoachName = (coachName) =>
        saveProfileChange(() => updateUser({ ...user, coach_name: coachName }), { coach_name: coachName });
    const saveUsername = (username) => saveProfileChange(() => updateUsername(user.id, username), { username });
    const saveEmail = (email) => updateEmail(user.id, email);
    const savePassword = (currentPassword, newPassword) => updatePassword(user.id, currentPassword, newPassword);
    const saveDelayOfGameWarningOptOut = (optOut) =>
        saveProfileChange(() => updateDelayOfGameWarningOptOut(user.id, optOut), {
            delay_of_game_warning_opt_out: optOut,
        });

    return {
        saveCoachName,
        saveUsername,
        saveEmail,
        savePassword,
        saveDelayOfGameWarningOptOut,
        handleLogout,
    };
};

export default useProfileAccount;
