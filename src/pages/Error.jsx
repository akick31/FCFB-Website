import React from 'react';
import flagIcon from '../assets/images/flag.png';

const NotFoundPage = () => {
    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>Oops! We have hit a snag! Please refresh the page and try again.</h1>
            <img src={flagIcon} alt="Flag Icon" style={{ width: '100px', height: 'auto', marginTop: '20px', marginBottom: '20px' }} />
            <p>Oops! The page you are looking for does not exist.</p>
        </div>
    );
};

export default NotFoundPage;
