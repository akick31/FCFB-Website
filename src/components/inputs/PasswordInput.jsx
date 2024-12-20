import React from "react";
import FormField from "../FormField";
import { Button } from "@mui/material";
import PropTypes from 'prop-types';

const PasswordInput = ({ formData, handleChange, validationErrors, handleSubmit, handleTogglePassword }) => {
    return (
        <form onSubmit={(e) => handleSubmit(e, 'password')}>
            <FormField
                label="Change Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                showPassword={formData.showPassword}
                handleTogglePassword={handleTogglePassword}
                error={!!validationErrors.password}
                helperText={validationErrors.password || ""}
            />
            <Button
                variant="contained"
                type="submit"
                fullWidth
                sx={{
                    backgroundColor: '#004260',
                    '&:hover': {
                        backgroundColor: '#00354d',
                    },
                }}
            >
                Confirm
            </Button>
        </form>
    );
};

PasswordInput.propTypes = {
    formData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    validationErrors: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    handleTogglePassword: PropTypes.func.isRequired,
}

export default PasswordInput;