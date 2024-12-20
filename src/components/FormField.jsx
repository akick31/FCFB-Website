import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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

export default FormField;