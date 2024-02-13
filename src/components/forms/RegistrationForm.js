import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/forms.css';

const RegistrationForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        coachName: '',
        discordTag: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/arceus/users', formData);
            alert('Registration successful!');
            // Redirect to login page or handle success
        } catch (error) {
            alert('Registration failed. Please try again.');
        }
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
                    <label className="form-label">Discord Tag</label>
                    <input type="text" name="discordTag" value={formData.discordTag} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input" />
                </div>
                <button type="submit" className="form-btn">Register</button>
            </form>
        </div>
    );
};

export default RegistrationForm;
