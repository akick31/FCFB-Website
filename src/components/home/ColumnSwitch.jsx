import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import SegTabs from '../ui/SegTabs';

const ColumnSwitch = ({ value, onChange, options, ariaLabel, action }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', mb: '8px' }}>
        <SegTabs value={value} onChange={onChange} options={options} ariaLabel={ariaLabel} />
        {action}
    </Box>
);

ColumnSwitch.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.node })).isRequired,
    ariaLabel: PropTypes.string.isRequired,
    action: PropTypes.node,
};

export default ColumnSwitch;
