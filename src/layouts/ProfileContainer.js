import React, {useEffect} from 'react';
import {useNavigate} from "react-router-dom";
import '../styles/profileContainer.css';
import { getTeamByName } from '../api/teamApi';
import {resendVerificationEmail} from "../api/authApi";

const ProfileContainer = ({ user }) => {
    const [team, setTeam] = React.useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const team = await getTeamByName(user.team);
            setTeam(team);
        }

        fetchData();
    }, []);

    const handleResendVerification = async () => {
        try {
            // Logic to resend verification email
            await resendVerificationEmail(user.id);
            // If successful, inform the user and let them know to check their email
            alert('Verification email has been resent. Please check your email.');
            navigate('/')
        } catch (error) {
            // Handle any errors that occur during resending verification email
            console.error('Error resending verification email:', error);
            // Inform the user about the error
            alert('Error resending verification email. Please try again later.');
        }
    };

    return (
        <div className="profile-container">
            {!user.approved && (
                <div className="profile-auth">
                    <h1 className="profile-auth-message">Your email is not verified! Please check your email for the verification link or click the button below to resend the email</h1>
                    <button className="profile-btn" onClick={handleResendVerification}>Resend Verification Email</button> {/* Use the verify button class */}
                </div>
            )}
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
                        <span className="profile-label">Overall Record:</span>
                        <span className="profile-value">
                            {user.wins}-{user.losses}
                            {user.winPercentage !== undefined && ` | ${user.winPercentage.toFixed(3)}`}
                        </span>
                    </div>
                    {user.team && ( // Conditionally render if user has a team
                        <>
                        <div className="profile-item">
                            <div className="line"></div>
                            <h1 className="team-info-title">Team Information</h1>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">College:</span>
                            <span className="profile-value">{user.team}</span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">Conference:</span>
                            <span className="profile-value">{team.subdivision} | {team.conference}</span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">Offensive Playbook:</span>
                            <span className="profile-value">{team.offensivePlaybook}</span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">Defensive Playbook:</span>
                            <span className="profile-value">{team.defensivePlaybook}</span>
                        </div>
                        <div className="profile-item">
                            <span className="profile-label">Team Record:</span>
                            <span className="profile-value">{team.currentWins}-{team.currentLosses} ({team.currentConferenceWins}-{team.currentConferenceLosses})</span>
                        </div>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileContainer;
