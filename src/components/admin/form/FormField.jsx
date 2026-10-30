import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { slugId } from '../../../utils/a11y';
import { labelSx } from '../../../styles/controls';

const FormField = ({ label, children }) => {
    const id = slugId(label);
    return (
        <Box sx={{ mb: '14px', minWidth: 0 }}>
            <Box component="label" htmlFor={id} sx={labelSx}>
                {label}
            </Box>
            {React.cloneElement(children, { id })}
        </Box>
    );
};

FormField.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

export default FormField;
