import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/forms.css';

const LoginForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/arceus/users/login', formData);
            alert('Login successful!');
            // Redirect to user profile or handle success
        } catch (error) {
            alert('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div className="form-container">
            <h2 className="form-title">Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input" />
                </div>
                <button type="submit" className="form-btn">Login</button>
            </form>
        </div>
    );
};

export default LoginForm;
