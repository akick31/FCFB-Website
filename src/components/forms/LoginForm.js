import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/forms.css';
import { login } from "../api/auth";

const LoginForm = ({ setIsAuthenticated, setUser }) => {
    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        password: '',
        loginSuccess: false // State to track login success
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const loginSuccess = await login(formData.usernameOrEmail, formData.password, setIsAuthenticated, setUser);

        if (loginSuccess) {
            setFormData({ ...formData, loginSuccess: true });
        } else {
            setFormData({ ...formData, errorMessage: 'Login failed. Please try again.' });
        }
    };

    // Redirect to home page if registration is successful
    if (formData.loginSuccess) {
        navigate('/');
    }

    return (
        <div className="form-container">
            <h2 className="form-title">Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Username or Email</label>
                    <input type="text" name="usernameOrEmail" value={formData.usernameOrEmail} onChange={handleChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input" />
                </div>
                <button type="submit" className="form-btn">Login</button>
                {formData.errorMessage && <p className="error-message">{formData.errorMessage}</p>}
            </form>
        </div>
    );
};

export default LoginForm;
