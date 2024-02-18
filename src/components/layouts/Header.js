import React from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import '../../styles/header.css';
import trophy from '../../assets/graphics/trophy.png';
import { logout } from "../api/auth";

const Header = ({ isAuthenticated, user, setIsAuthenticated, setUser }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        const response = logout(setIsAuthenticated, setUser); // Call the logout function
        // Redirect the user to the login page or any other desired page
        if (response === true) {
            navigate('/');
        }
    };

    // Function to render the links based on authentication and role
    const renderLinks = () => {
        if (isAuthenticated) {
            // If user is authenticated
            return (
                <>
                    <Link to="/profile" className={location.pathname === '/profile' ? 'header__item active' : 'header__item'}>{user.username}</Link>
                    <span className="header__separator">|</span>
                    {user.role === "admin" && (
                        // Show only if user is admin
                        <Link to="/admin" className={location.pathname === '/admin' ? 'header__item active' : 'header__item'}>Admin</Link>
                    )}
                    <Link to="/" className="header__item" onClick={handleLogout}>Logout</Link> {/* Logout link */}
                </>
            );
        } else {
            // If user is not authenticated
            return (
                <>
                    <Link to="/login" className={location.pathname === '/login' ? 'header__item active' : 'header__item'}>Login</Link>
                    <Link to="/register" className={location.pathname === '/register' ? 'header__item active' : 'header__item'}>Register</Link>
                </>
            );
        }
    };

    return (
        <header className="header">
            <div className="header__left">
                <img src={trophy} className="header__logo"  alt={"image of fcfb trophy"}/>
                <Link to="/" className={location.pathname === '/' ? 'header__item active' : 'header__item'}>Home</Link>
                <Link to="/gamemanagement" className={location.pathname === '/gamemanagement' ? 'header__item active' : 'header__item'}>Start Games</Link>
            </div>
            <div className="header__right">
                {renderLinks()}
            </div>
        </header>
    );
};

export default Header;
