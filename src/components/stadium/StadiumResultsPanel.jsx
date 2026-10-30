import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import SegTabs from '../ui/SegTabs';
import StadiumGamesTab from './StadiumGamesTab';
import StadiumRecordsTab from './StadiumRecordsTab';

const StadiumResultsPanel = ({ games, records }) => {
    const [view, setView] = useState('games');
    const switcher = (
        <SegTabs
            value={view}
            onChange={setView}
            ariaLabel="Stadium results"
            options={[
                { value: 'games', label: `Games (${games.length})` },
                { value: 'records', label: `Team records (${records.length})` },
            ]}
        />
    );
    return (
        <Panel>
            {view === 'games' ? (
                <StadiumGamesTab games={games} lead={switcher} />
            ) : (
                <StadiumRecordsTab records={records} lead={switcher} />
            )}
        </Panel>
    );
};

StadiumResultsPanel.propTypes = {
    games: PropTypes.arrayOf(PropTypes.object).isRequired,
    records: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default StadiumResultsPanel;
