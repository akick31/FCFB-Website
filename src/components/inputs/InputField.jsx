import React from 'react';
import { TextField, Button } from '@mui/material';
import PropTypes from 'prop-types';

const InputField = ({label, value, onChange, validationError, onSubmit, buttonLabel = 'Confirm',}) => {
    return (
        <div>
            <TextField
                label={label}
                value={value}
                onChange={onChange}
                error={!!validationError}
                helperText={validationError}
                fullWidth
                variant="outlined"
                margin="normal"
            />
            <Button
                variant="contained"
                onClick={onSubmit}
                fullWidth
                sx={{
                    marginTop: 2,
                    backgroundColor: '#004260',
                    '&:hover': {
                        backgroundColor: '#00354d',
                    },
            }}
            >
                {buttonLabel}
            </Button>
        </div>
    );
};

InputField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    validationError: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    buttonLabel: PropTypes.string,
}

export default InputField;