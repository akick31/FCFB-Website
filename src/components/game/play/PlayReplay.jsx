import React from 'react';
import PropTypes from 'prop-types';
import Panel from '../../ui/Panel';
import PlayAnimation from './PlayAnimation';

const PlayReplay = ({ playId, description }) => (
    <Panel header="Replay">
        <PlayAnimation playId={playId} description={description} />
    </Panel>
);

PlayReplay.propTypes = {
    playId: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
};

export default PlayReplay;
