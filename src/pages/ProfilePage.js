// ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileContainer from "../components/layouts/ProfileContainer";
import ProfileForm from "../components/forms/ProfileForm";
import '../styles/profileContainer.css';

const ProfilePage = ({ user }) => {
    const navigate = useNavigate();

    if (user === undefined) {
        // Redirect to the login page if the user is not authenticated
        navigate('/login');
    }

    return (
        <div>
            <ProfileContainer user={user}/>
            <ProfileForm user={user}/>
        </div>
    );

};

export default ProfilePage;
