import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resendVerificationEmail, verifyEmail } from "../components/api/auth";
import { FaSpinner } from 'react-icons/fa';
import '../styles/verifyPage.css'; // Import the verifyPage.css file

const VerifyPage = ({ userId, token }) => {
    const [loading, setLoading] = useState(true);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await verifyEmail(token);
                if (response.status !== 200) {
                    setVerificationSuccess(false);
                } else {
                    setVerificationSuccess(true);
                }
            } catch (error) {
                setVerificationSuccess(false);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleResendVerification = async () => {
        try {
            // Logic to resend verification email
            await resendVerificationEmail(userId);
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
        <div className="verify-container"> {/* Use the verify container class */}
            <h2 className="verify-title">Verifying Email...</h2> {/* Use the verify title class */}
            {loading && <FaSpinner className="loading-spinner" />} {/* Use the loading spinner class */}
            {!loading && verificationSuccess && (
                <div>
                    <p className="verify-message">Email verified successfully!</p> {/* Use the verify message class */}
                    <button className="verify-btn" onClick={() => navigate('/login')}>Login</button> {/* Use the verify button class */}
                </div>
            )}
            {!loading && !verificationSuccess && (
                <div>
                    <p className="verify-message">Failed to verify email.</p> {/* Use the verify message class */}
                    <button className="verify-btn" onClick={handleResendVerification}>Resend Verification Email</button> {/* Use the verify button class */}
                </div>
            )}
        </div>
    );
};

export default VerifyPage;
