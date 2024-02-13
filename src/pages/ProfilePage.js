// ProfilePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProfilePage = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Fetch user data from backend
        axios.get('/arceus/users/current')
            .then(response => {
                setUser(response.data); // Assuming the response contains user data
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }, []);

    return (
        <div>
            <h2>User Profile</h2>
            {user && (
                <div>
                    <p>Username: {user.username}</p>
                    <p>Coach Name: {user.coachName}</p>
                    <p>Email: {user.email}</p>
                    {/* Add more user information fields as needed */}
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
