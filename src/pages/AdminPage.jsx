// AdminPage.jsx
import React from 'react';
import {useNavigate} from "react-router-dom";

const AdminPage = ({user}) => {
    const navigate = useNavigate();

    if (user.role !== "admin") {
        // Redirect to the not found page if the user is not an admin
        navigate('*');
    }

    return (
        <div>
            <h2>Start Games</h2>
            {/* Add entry form for starting games */}
        </div>
    );
}

export default AdminPage;
