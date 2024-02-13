import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/header.css';
import trophy from '../../assets/graphics/trophy.png';

const Header = ({ isAuthenticated, isAdmin }) => {
    const location = useLocation();

    // Function to render the links based on authentication and role
    const renderLinks = () => {
        if (isAuthenticated) {
            // If user is authenticated
            return (
                <>
                    {!isAdmin && (
                        // Show only if user is not admin
                        <Link to="/admin" className={location.pathname === '/admin' ? 'header__item active' : 'header__item'}>Game Management</Link>
                    )}
                    <Link to="/profile" className={location.pathname === '/profile' ? 'header__item active' : 'header__item'}>Profile</Link>
                    <Link to="/logout" className="header__item">Logout</Link> {/* Logout link */}
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
                <img src={trophy} className="header__logo" />
                <Link to="/" className={location.pathname === '/' ? 'header__item active' : 'header__item'}>Home</Link>
            </div>
            <div className="header__right">
                {renderLinks()}
            </div>
        </header>
    );
};

export default Header;
