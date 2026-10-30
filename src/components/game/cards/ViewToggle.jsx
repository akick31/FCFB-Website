import React from 'react';
import PropTypes from 'prop-types';
import SegTabs from '../../ui/SegTabs';

const OPTIONS = [
    { value: 'cards', label: 'Cards' },
    { value: 'compact', label: 'Compact' },
];

const ViewToggle = ({ value, onChange }) => (
    <SegTabs value={value} onChange={onChange} options={OPTIONS} ariaLabel="Game view" />
);

ViewToggle.propTypes = {
    value: PropTypes.oneOf(['cards', 'compact']).isRequired,
    onChange: PropTypes.func.isRequired,
};

export default ViewToggle;
