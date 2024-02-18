// HomePage.js
import React from 'react';
import logo from '../assets/graphics/main_logo.png'; // Import your logo image here

const HomePage = () => {
    return (
        <div className="landing-page">
            <div className="banner">
                <img src={logo} alt="Logo" className="logo" />
            </div>
            <main>
                <h2>Your Journey Begins Here</h2>
                <p>Experience the thrill of college football like never before.</p>
                <button className="cta-button">Get Started</button>
            </main>
        </div>
    );
}

export default HomePage;
