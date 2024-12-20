import React from 'react';
import PropTypes from 'prop-types';

const TabPanel = ({ children, value, index, ...props }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`scoreboard-tabpanel-${index}`}
        aria-labelledby={`scoreboard-tab-${index}`}
        {...props}
    >
        {value === index && children}
    </div>
);

TabPanel.propTypes = {
    children: PropTypes.node,
    value: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
}

export default TabPanel;