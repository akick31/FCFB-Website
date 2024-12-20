import React from "react";
import FormField from "../FormField";
import { Button } from "@mui/material";

const EmailInput = ({ formData, handleChange, validationErrors, handleSubmit }) => {
    return (
        <form onSubmit={(e) => handleSubmit(e, 'email')}>
            <FormField
                label="Change Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!validationErrors.email}
                helperText={validationErrors.email || ""}
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

export default EmailInput;