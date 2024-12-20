import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PropTypes from 'prop-types';

const FormField = ({ label, name, type = "text", value, error, helperText, onChange, showPassword, handleTogglePassword }) => {
    return (
        <TextField
            fullWidth
            label={label}
            name={name}
            type={type === "password" ? (showPassword ? "text" : "password") : type}
            value={value}
            onChange={onChange}
            error={error}
            helperText={helperText}
            variant="outlined"
            margin="normal"
            InputProps={
                type === "password"
                    ? {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleTogglePassword} edge="end">
                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }
                    : undefined
            }
        />
    );
};

FormField.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    value: PropTypes.string.isRequired,
    error: PropTypes.bool,
    helperText: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    showPassword: PropTypes.bool,
    handleTogglePassword: PropTypes.func,
}

export default FormField;