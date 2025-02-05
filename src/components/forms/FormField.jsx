import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PropTypes from "prop-types";

const FormField = ({ label, name, type, value, onChange, error, helperText, required, InputProps, showPassword, handleTogglePassword }) => {
    return (
        <TextField
            label={label}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            error={error}
            helperText={helperText}
            required={required}
            fullWidth
            margin="normal"
            InputProps={{
                ...InputProps,
                endAdornment: type === "password" && handleTogglePassword ? (
                    <InputAdornment position="end">
                        <IconButton onClick={handleTogglePassword} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ) : InputProps?.endAdornment,
            }}
        />
    );
};

FormField.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    error: PropTypes.bool,
    helperText: PropTypes.string,
    required: PropTypes.bool,
    InputProps: PropTypes.object,
    showPassword: PropTypes.bool,
    handleTogglePassword: PropTypes.func,
};

export default FormField;