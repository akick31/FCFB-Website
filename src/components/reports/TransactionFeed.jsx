import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import TransactionChip from './TransactionChip';
import CoachLinks from './CoachLinks';
import TeamButton from './TeamButton';
import { formatTime, groupByDay } from './transactionFormat';
import { formatPosition } from '../../utils/formatText';

const TransactionFeed = ({ transactions, onTeamClick }) => (
    <Box>
        {groupByDay(transactions).map((group) => (
            <Box key={group.label}>
                <Box
                    sx={{
                        px: '16px',
                        py: '6px',
                        background: 'var(--surface-2)',
                        color: 'var(--text-dim)',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid var(--line-soft)',
                    }}
                >
                    {group.label}
                </Box>
                {group.items.map((transaction, index) => (
                    <Box
                        data-feed-item
                        key={`${transaction.team}-${transaction.transaction_date}-${index}`}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr auto', md: 'minmax(0, 220px) 110px minmax(0, 1fr) auto' },
                            alignItems: 'center',
                            gap: '6px 14px',
                            px: '16px',
                            py: '9px',
                            borderBottom: '1px solid var(--line-soft)',
                            fontSize: '0.84rem',
                        }}
                    >
                        <TeamButton team={transaction.team} onClick={onTeamClick} />
                        <Box sx={{ justifySelf: { xs: 'end', md: 'start' } }}>
                            <TransactionChip type={transaction.transaction} />
                        </Box>
                        <Box sx={{ minWidth: 0, color: 'var(--text-muted)' }}>
                            <CoachLinks transaction={transaction} />, {formatPosition(transaction.position)}
                        </Box>
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.74rem', justifySelf: 'end' }}>
                            {formatTime(transaction.transaction_date)}
                            {transaction.processed_by && `, by ${transaction.processed_by}`}
                        </Box>
                    </Box>
                ))}
            </Box>
        ))}
    </Box>
);

TransactionFeed.propTypes = {
    transactions: PropTypes.array.isRequired,
    onTeamClick: PropTypes.func.isRequired,
};

export default TransactionFeed;
