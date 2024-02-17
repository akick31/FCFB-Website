import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../../styles/forms.css';
import { registerUser } from '../api/user.js'

const RegistrationForm = () => {
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
        registrationSuccess: false // State to track registration success
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.passwordValid === false) {
            setFormData({ ...formData, errorMessage: 'Password is not strong enough' });
            return;
        }
        if (formData.emailValid === false) {
            setFormData({ ...formData, errorMessage: 'Invalid email address' });
            return;
        }
        if (formData.redditValid === false) {
            setFormData({ ...formData, errorMessage: 'Reddit username cannot contain /u/' });
            return;
        }
        if (formData.email !== formData.confirmEmail) {
            setFormData({ ...formData, errorMessage: 'Emails do not match' });
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setFormData({ ...formData, errorMessage: 'Passwords do not match. Please try again.' });
            return;
        }

        try {
            await registerUser(formData);
            setFormData({ ...formData, registrationSuccess: true });
            // Redirect to login page or handle success
        } catch (error) {
            setFormData({ ...formData, errorMessage: 'Registration failed. Please try again.' });
        }
    };

    // Redirect to login page if registration is successful
    if (formData.registrationSuccess) {
        navigate('/login');
    }

    // Custom validation function for Reddit Username field
    const validateRedditUsername = (value) => {
        // Check if value contains '/u/'
        if (value.includes('/u/')) {
            return false;
        }
        return true;
    };

    // Custom validation function for Email field
    const validateEmail = (value) => {
        // Regular expression for validating email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    // Password strength validation function
    const isStrongPassword = (password) => {
        // Check if the password length is between 8 and 255 characters
        if (password.length < 8 || password.length > 255) {
            return false;
        }
        // Check if the password contains at least one special character
        const specialCharacters = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
        if (!specialCharacters.test(password)) {
            return false;
        }
        // Return true if the password meets all criteria
        return true;
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Registration</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Coach Name</label>
                    <input type="text" name="coachName" value={formData.coachName} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Reddit Username</label>
                    <input type="text" name="redditUsername" value={formData.redditUsername} onChange={handleChange} className="form-input" />
                    {formData.redditUsername && !formData.redditValid && <p className="error">Reddit Username cannot contain '/u/'</p>}
                    {formData.redditUsername && formData.redditValid && <p className="success">Reddit Username is valid</p>}
                </div>
                <div className="form-group">
                    <label className="form-label">Discord Tag</label>
                    <input type="text" name="discordTag" value={formData.discordTag} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Position</label>
                    <select name="position" value={formData.position} onChange={handleChange} className="form-input">
                        <option value="">Select Position</option>
                        <option value="head coach">Head Coach</option>
                        <option value="coordinator">Coordinator</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
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
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="password-input-container">
                        <input type={formData.showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="form-input" />
                        <FontAwesomeIcon icon={formData.showPassword ? faEye : faEyeSlash} onClick={handleTogglePassword} className="toggle-password-icon" />
                    </div>
                    {formData.password && !formData.passwordValid && <p className="error">Password must be at least 8 characters long and contain 1 special character</p>}
                    {formData.password && formData.passwordValid && <p className="success">Password is strong</p>}
                </div>
                <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <div className="password-input-container">
                        <input type={formData.showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-input" />
                        <FontAwesomeIcon icon={formData.showPassword ? faEye : faEyeSlash} onClick={handleTogglePassword} className="toggle-password-icon" />
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && <p className="error">Passwords do not match</p>}
                    {formData.confirmPassword && formData.password === formData.confirmPassword && <p className="success">Passwords match</p>}
                </div>
                <button type="submit" className="form-btn">Register</button>
                {formData.errorMessage && <p className="error-message">{formData.errorMessage}</p>}
            </form>
        </div>
    );
};

export default RegistrationForm;
