import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../styles/forms.css';
import {
    getUserById,
    updateCoachName,
    updateDiscordTag,
    updateEmail,
    updatePassword,
    updateRedditUsername,
    updateUsername
} from '../api/userApi.js'
import { validateEmail, isStrongPassword, validateRedditUsername } from '../utils/validations';

const ProfileForm = ( { user }) => {
    const [formData, setFormData] = useState({
        username: '',
        coachName: '',
        redditUsername: '',
        discordTag: '',
        email: '',
        confirmEmail: '',
        password: '',
        confirmPassword: '',
        position: 'head coach', // Default position
        showPassword: false, // State to toggle password visibility
        emailValid: true, // State to track email validity
        passwordValid: true, // State to track password validity
        redditValid: true, // State to track reddit username validity
        updateSuccess: false // State to track update success
    });

    const navigate = useNavigate(); // Retrieve the history object

    // Update specific validity state based on the field being changed
    const handleChange = (e) => {
        const { name, value } = e.target;
        let emailValid = formData.emailValid;
        let passwordValid = formData.passwordValid;
        let redditValid = formData.redditValid;

        // Update specific validity state based on the field being changed
        if (name === 'email') {
            emailValid = validateEmail(value);
        } else if (name === 'password') {
            passwordValid = isStrongPassword(value);
        } else if (name === 'redditUsername') {
            redditValid = validateRedditUsername(value);
        }

        setFormData({
            ...formData,
            [name]: value,
            emailValid: emailValid,
            passwordValid: passwordValid,
            redditValid: redditValid
        });
    };

    const handleTogglePassword = () => {
        setFormData({ ...formData, showPassword: !formData.showPassword });
    };

    const handleChangeUsername = async (e) => {
        e.preventDefault();
        try {
            await updateUsername(user.id, formData.username);
            setFormData({ ...formData, successUsernameMessage: 'Username updated successfully' });
            window.location.reload();
        } catch (error) {
            setFormData({ ...formData, errorUsernameMessage: 'Update failed. Please try again.' });
        }
    }

    const handleChangeCoachName = async (e) => {
        e.preventDefault();
        try {
            await updateCoachName(user.id,  formData.coachName);
            setFormData({ ...formData, successCoachMessage: 'Coach name updated successfully' });
            window.location.reload();
        } catch (error) {
            setFormData({ ...formData, errorCoachMessage: 'Update failed. Please try again.' });
        }
    }

    const handleChangeRedditUsername = async (e) => {
        e.preventDefault();
        try {
            if (formData.redditValid === false) {
                setFormData({ ...formData, errorMessage: 'Reddit username cannot contain /u/' });
                window.location.reload();
                return;
            }
            await updateRedditUsername(user.id, formData.redditUsername);
            setFormData({ ...formData, successRedditMessage: 'Reddit username updated successfully'});
        } catch (error) {
            setFormData({ ...formData, errorRedditMessage: 'Update failed. Please try again.' });
        }
    }

    const handleChangeDiscordTag = async (e) => {
        e.preventDefault();
        try {
            await updateDiscordTag(user.id, formData.discordTag);
            setFormData({ ...formData, successDiscordMessage: 'Discord tag updated successfully'});
            window.location.reload();
        } catch (error) {
            setFormData({ ...formData, errorDiscordMessage: 'Update failed. Please try again.' });
        }
    }

    const handleChangeEmail = async (e) => {
        e.preventDefault();
        try {
            if (formData.emailValid === false) {
                setFormData({ ...formData, errorEmailMessage: 'Invalid email address' });
                return;
            }
            if (formData.email !== formData.confirmEmail) {
                setFormData({ ...formData, errorEmailMessage: 'Emails do not match' });
                return;
            }
            await updateEmail(user.id, formData.email);
            setFormData({ ...formData, successEmailMessage: 'Email updated successfully'});
            window.location.reload();
        } catch (error) {
            setFormData({ ...formData, errorEmailMessage: 'Update failed. Please try again.' });
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            if (formData.passwordValid === false) {
                setFormData({ ...formData, errorPasswordMessage: 'Password is not strong enough' });
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setFormData({ ...formData, errorPasswordMessage: 'Passwords do not match. Please try again.' });
                return;
            }
            await updatePassword(user.id, formData.password);
            setFormData({ ...formData, successPasswordMessage: 'Password updated successfully'});
            window.location.reload();
        } catch (error) {
            setFormData({ ...formData, errorPasswordMessage: 'Update failed. Please try again.' });
        }
    }

    return (
        <div className="grid-container">
            <div className="grid-form-container">
                <form onSubmit={handleChangeUsername}>
                    <div className="grid-group">
                        <label className="form-label">Change Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} className="form-input" />
                    </div>
                    <button type="submit" className="grid-btn">Confirm</button>
                    {<p className="success-message">{formData.successUsernameMessage}</p>}
                    {formData.errorMessage && <p className="error-message">{formData.errorUsernameMessage}</p>}
                </form>
            </div>
            <div className="grid-form-container">
                <form onSubmit={handleChangeCoachName}>
                    <div className="grid-group">
                        <label className="form-label">Change Coach Name</label>
                        <input type="text" name="coachName" value={formData.coachName} onChange={handleChange} className="form-input" />
                    </div>
                    <button type="submit" className="grid-btn">Confirm</button>
                    {<p className="success-message">{formData.successCoachMessage}</p>}
                    {formData.errorMessage && <p className="error-message">{formData.errorCoachMessage}</p>}
                </form>
            </div>
            <div className="grid-form-container">
                <form onSubmit={handleChangeRedditUsername}>
                    <div className="grid-group">
                        <label className="form-label">Change Reddit Username</label>
                        <input type="text" name="redditUsername" value={formData.redditUsername} onChange={handleChange} className="form-input" />
                        {formData.redditUsername && !formData.redditValid && <p className="error">Reddit Username cannot contain '/u/'</p>}
                        {formData.redditUsername && formData.redditValid && <p className="success">Reddit Username is valid</p>}
                    </div>
                    <button type="submit" className="grid-btn">Confirm</button>
                    {<p className="success-message">{formData.successRedditMessage}</p>}
                    {formData.errorMessage && <p className="error-message">{formData.errorRedditMessage}</p>}
                </form>
            </div>
            <div className="grid-form-container">
                <form onSubmit={handleChangeDiscordTag}>
                    <div className="grid-group">
                        <label className="form-label">Change Discord Tag</label>
                        <input type="text" name="discordTag" value={formData.discordTag} onChange={handleChange} className="form-input" />
                    </div>
                    <button type="submit" className="grid-btn">Confirm</button>
                    {<p className="success-message">{formData.successDiscordMessage}</p>}
                    {formData.errorMessage && <p className="error-message">{formData.errorDiscordMessage}</p>}
                </form>
            </div>
            <div className="grid-form-container">
                <form onSubmit={handleChangeEmail}>
                    <div className="grid-group">
                        <label className="form-label">Change Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" />
                        {formData.email && !formData.emailValid && <p className="error">Invalid email address</p>}
                        {formData.email && formData.emailValid && <p className="success">Email is valid</p>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm Email</label>
                        <input type="email" name="confirmEmail" value={formData.confirmEmail} onChange={handleChange} className="form-input" />
                        {formData.confirmEmail && formData.email !== formData.confirmEmail && <p className="error">Emails do not match</p>}
                        {formData.confirmEmail && formData.email === formData.confirmEmail && <p className="success">Emails match</p>}
                    </div>
                    <button type="submit" className="grid-btn">Confirm</button>
                    {<p className="success-message">{formData.successEmailMessage}</p>}
                    {formData.errorMessage && <p className="error-message">{formData.errorEmailMessage}</p>}
                </form>
            </div>
            <div className="grid-form-container">
                <form onSubmit={handleChangePassword}>
                    <div className="grid-group">
                        <label className="form-label">Change Password</label>
                        <div className="password-input-container">
                            <input type={formData.showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="form-input" />
                            <FontAwesomeIcon icon={formData.showPassword ? faEye : faEyeSlash} onClick={handleTogglePassword} className="toggle-password-icon" />
                        </div>
                        {formData.password && !formData.passwordValid && <p className="error">Password must be at least 8 characters long and contain 1 special character</p>}
                        {formData.password && formData.passwordValid && <p className="success">Password is strong</p>}
                    </div>
                    <div className="grid-group">
                        <label className="form-label">Confirm Password</label>
                        <div className="password-input-container">
                            <input type={formData.showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-input" />
                            <FontAwesomeIcon icon={formData.showPassword ? faEye : faEyeSlash} onClick={handleTogglePassword} className="toggle-password-icon" />
                        </div>
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && <p className="error">Passwords do not match</p>}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && <p className="success">Passwords match</p>}
                    </div>
                    <button type="submit" className="grid-btn">Confirm</button>
                    {<p className="success-message">{formData.successPasswordMessage}</p>}
                    {formData.errorMessage && <p className="error-message">{formData.errorPasswordMessage}</p>}
                </form>
            </div>
        </div>
    );
};

export default ProfileForm;
