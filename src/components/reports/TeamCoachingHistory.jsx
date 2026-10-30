import React from 'react';
import { Box, Drawer } from '@mui/material';
import PropTypes from 'prop-types';
import TeamName from '../ui/TeamName';
import TransactionChip from './TransactionChip';
import CoachLinks from './CoachLinks';
import { formatDateTime, newestFirst } from './transactionFormat';
import { formatPosition } from '../../utils/formatText';
import { secondaryButtonSx } from '../../styles/controls';

const TeamCoachingHistory = ({ team, transactions, onClose }) => {
    const history = team ? newestFirst(transactions.filter((transaction) => transaction.team === team)) : [];
    return (
        <Drawer
            anchor="right"
            open={Boolean(team)}
            onClose={onClose}
            PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, background: 'var(--ground)' } }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    p: '16px',
                    borderBottom: '1px solid var(--line)',
                }}
            >
                <Box component="h2" sx={{ m: 0, flex: 1, fontSize: '1rem', fontWeight: 800 }}>
                    {team && <TeamName name={team} size={26} label={`${team} coaching history`} />}
                </Box>
                <Box component="button" type="button" onClick={onClose} sx={secondaryButtonSx}>
                    Close
                </Box>
            </Box>
            <Box component="ol" sx={{ listStyle: 'none', m: 0, p: '8px 16px 24px' }}>
                {history.length === 0 && (
                    <Box sx={{ color: 'var(--text-muted)', py: 3 }}>No coaching moves recorded.</Box>
                )}
                {history.map((transaction, index) => (
                    <Box
                        component="li"
                        key={`${transaction.transaction_date}-${index}`}
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            py: '10px',
                            borderBottom: '1px solid var(--line-soft)',
                        }}
                    >
                        <TransactionChip type={transaction.transaction} />
                        <Box sx={{ minWidth: 0, fontSize: '0.84rem' }}>
                            <CoachLinks transaction={transaction} />
                            <Box sx={{ color: 'var(--text-dim)', fontSize: '0.74rem', mt: '2px' }}>
                                {formatPosition(transaction.position)}, {formatDateTime(transaction.transaction_date)}
                                {transaction.processed_by && `, by ${transaction.processed_by}`}
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Drawer>
    );
};

TeamCoachingHistory.propTypes = {
    team: PropTypes.string,
    transactions: PropTypes.array.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default TeamCoachingHistory;
