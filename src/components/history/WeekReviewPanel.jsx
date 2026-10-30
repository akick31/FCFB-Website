import React from 'react';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import DetailRows from '../ui/DetailRows';
import useWeekReview from '../../hooks/useWeekReview';

const WeekReviewPanel = ({ week }) => {
    const { rows, dialog } = useWeekReview(week);
    return (
        <Panel header="Week in review">
            <DetailRows rows={rows.map((row) => [row.label, row.value])} dense />
            {dialog}
        </Panel>
    );
};

WeekReviewPanel.propTypes = {
    week: PropTypes.shape({ games: PropTypes.array.isRequired, highlights: PropTypes.object.isRequired }).isRequired,
};

export default WeekReviewPanel;
