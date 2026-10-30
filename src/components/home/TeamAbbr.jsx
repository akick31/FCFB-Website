import React from 'react';
import PropTypes from 'prop-types';
import TeamName from '../ui/TeamName';
import { useTeamsMap } from '../../hooks/useTeamsMap';

const TeamAbbr = ({ name, prefix = '', suffix = '' }) => {
    const teamsMap = useTeamsMap();
    return <TeamName name={name} size={14} label={`${prefix}${teamsMap[name]?.abbreviation || name}${suffix}`} />;
};

TeamAbbr.propTypes = { name: PropTypes.string.isRequired, prefix: PropTypes.string, suffix: PropTypes.string };

export default TeamAbbr;
