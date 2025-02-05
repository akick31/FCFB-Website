import React from "react";
import FormField from "../forms/FormField";
import { Button } from "@mui/material";
import PropTypes from 'prop-types';

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

EmailInput.propTypes = {
    formData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    validationErrors: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
}

export default EmailInput;