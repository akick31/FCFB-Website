import React from 'react';
import '../../styles/profileContainer.css';

const ProfileContainer = ({ user }) => {

    return (
        <div className="profile-container">
            <div className="profile-details-container">
                <div className="profile-details">
                    <div className="profile-item">
                        <h1 className="user-info-title">User Information</h1>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Username:</span>
                        <span className="profile-value">{user.username}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Role:</span>
                        <span className="profile-value">{user.role}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Coach Name:</span>
                        <span className="profile-value">{user.coachName}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Discord Tag:</span>
                        <span className="profile-value">{user.discordTag}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Reddit Username:</span>
                        <span className="profile-value">/u/{user.redditUsername}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Email:</span>
                        <span className="profile-value">{user.email}</span>
                    </div>
                    <div className="profile-item">
                        <div className="line"></div>
                        <h1 className="team-info-title">Team Information</h1>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">College:</span>
                        <span className="profile-value">{user.team}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Record:</span>
                        <span className="profile-value">{user.wins}-{user.losses} | {user.winPercentage.toFixed(3)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileContainer;
