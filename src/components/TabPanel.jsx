// src/components/TabPanel.js
import React from 'react';

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

export default TabPanel;