import React from 'react';
import { Box } from '@mui/material';
import TeamMark from '../ui/TeamMark';

const PostseasonTeamOption = ({ optionProps, team, teamMap }) => {
    const { key, ...listItemProps } = optionProps;
    return (
        <Box key={key} component="li" {...listItemProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TeamMark team={teamMap[team.name] || { name: team.name, abbreviation: team.abbreviation }} size={20} />
            <Box component="span" sx={{ fontSize: '0.85rem' }}>
                {team.name}
            </Box>
        </Box>
    );
};

export default PostseasonTeamOption;
