import React, { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import {
    updateCoachName,
    updateDiscordTag,
    updateEmail,
    updatePassword,
    updateUsername,
} from '../../api/userApi';
import InputField from '../inputs/InputField';
import EmailInput from '../inputs/EmailInput';
import PasswordInput from '../inputs/PasswordInput';
import PropTypes from 'prop-types';

const ProfileForm = ({ user }) => {
    const [formData, setFormData] = useState({
        username: user.username || '',
        coachName: user.coachName || '',
        discordTag: user.discordTag || '',
        email: user.email || '',
        confirmEmail: '',
        password: '',
        confirmPassword: '',
        showPassword: false,
    });

    const [validationErrors] = useState({});
    const [setUpdateMessages] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Validation logic goes here
    };

    const handleSubmit = async (e, field) => {
        e.preventDefault();

        try {
            switch (field) {
                case 'username':
                    await updateUsername(user.id, formData.username);
                    break;
                case 'coachName':
                    await updateCoachName(user.id, formData.coachName);
                    break;
                case 'discordTag':
                    await updateDiscordTag(user.id, formData.discordTag);
                    break;
                case 'email':
                    await updateEmail(user.id, formData.email);
                    break;
                case 'password':
                    await updatePassword(user.id, formData.password);
                    break;
                default:
                    break;
            }
            setUpdateMessages({ [field]: `${field} updated successfully` });
        } catch (error) {
            setUpdateMessages({ [field]: 'Update failed. Please try again.' });
        }
    };

    const handleTogglePassword = () => {
        setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }));
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Profile Settings
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <InputField
                        label={'Change Username'}
                        formData={formData}
                        handleChange={handleChange}
                        validationErrors={validationErrors}
                        handleSubmit={handleSubmit}
                    />
                </Grid>
                <Grid item xs={12}>
                    <InputField
                        label={'Change Coach Name'}
                        formData={formData}
                        handleChange={handleChange}
                        validationErrors={validationErrors}
                        handleSubmit={handleSubmit}
                    />
                </Grid>
                <Grid item xs={12}>
                    <InputField
                        label={'Change Discord Tag'}
                        formData={formData}
                        handleChange={handleChange}
                        validationErrors={validationErrors}
                        handleSubmit={handleSubmit}
                    />
                </Grid>
                <Grid item xs={12}>
                    <EmailInput
                        formData={formData}
                        handleChange={handleChange}
                        validationErrors={validationErrors}
                        handleSubmit={handleSubmit}
                    />
                </Grid>
                <Grid item xs={12}>
                    <PasswordInput
                        formData={formData}
                        handleChange={handleChange}
                        validationErrors={validationErrors}
                        handleSubmit={handleSubmit}
                        handleTogglePassword={handleTogglePassword}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

ProfileForm.propTypes = {
    user: PropTypes.object.isRequired,
}


export default ProfileForm;