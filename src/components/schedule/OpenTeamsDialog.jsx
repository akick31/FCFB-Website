import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, IconButton, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import TeamMark from '../ui/TeamMark';
import { ensureTeam } from '../../hooks/useTeamsMap';
import { getTeamCoaches } from '../../utils/teamDataUtils';

const OpenTeamsDialog = ({ open, week, teams, teamsMap, onClose }) => {
    const markFor = (name) => {
        if (!teamsMap[name]) ensureTeam(name);
        return teamsMap[name] || { name };
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--cond)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
                Open teams, Week {week}
                <IconButton size="small" onClick={onClose} aria-label="Close">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ fontSize: '0.76rem', color: 'var(--text-muted)', mb: 1.5 }}>
                    These teams have no game scheduled for Week {week}. This is a read-only view, contact a coach directly to set up a game.
                </Box>
                {!teams.length ? (
                    <Box sx={{ color: 'var(--text-muted)', py: 2, textAlign: 'center' }}>No other open teams this week.</Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {teams.map((team) => {
                            const coaches = getTeamCoaches(team);
                            return (
                                <Box key={team.id || team.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid var(--line-soft)', borderRadius: 'var(--r-sm)', p: 1 }}>
                                    <TeamMark team={markFor(team.name)} size={28} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box component={Link} to={`/team-details/${team.id}`} sx={{ fontWeight: 700, textDecoration: 'none', color: 'inherit' }}>
                                            {team.name}
                                        </Box>
                                        {coaches.length ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', mt: '2px' }}>
                                                {coaches.map((coach) => (
                                                    <Box key={coach.username || coach.name} sx={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                                        {coach.name}
                                                        {coach.discordTag && ` (${coach.discordTag})`}
                                                    </Box>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Box sx={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>No coach assigned</Box>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

OpenTeamsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    week: PropTypes.number,
    teams: PropTypes.array.isRequired,
    teamsMap: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default OpenTeamsDialog;
