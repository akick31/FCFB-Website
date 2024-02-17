import React, {useEffect} from 'react';
import '../../styles/profileContainer.css';
import { getTeamByName } from '../api/team';
import {getUserById} from "../api/user";

const ProfileContainer = ({ user }) => {
    console.log(user);
    const [team, setTeam] = React.useState({});

    useEffect(() => {
        const fetchData = async () => {
            const team = await getTeamByName(user.team);
            setTeam(team);
            console.log(team);
        }

        fetchData();
    }, []);

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
                        <span className="profile-label">Overall Record:</span>
                        <span className="profile-value">{user.wins}-{user.losses} | {user.winPercentage.toFixed(3)}</span>
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
