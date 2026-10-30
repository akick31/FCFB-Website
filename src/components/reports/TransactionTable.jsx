import React from 'react';
import PropTypes from 'prop-types';
import DataTable from '../ui/DataTable';
import TransactionChip from './TransactionChip';
import CoachLinks from './CoachLinks';
import TeamButton from './TeamButton';
import { formatDateTime } from './transactionFormat';
import { formatPosition } from '../../utils/formatText';

const TransactionTable = ({ transactions, onTeamClick }) => (
    <DataTable minWidth={760} tableLayout="fixed" dense>
        <thead>
            <tr>
                <th className="lft" style={{ width: '22%' }}>
                    Team
                </th>
                <th className="lft" style={{ width: '13%' }}>
                    Type
                </th>
                <th className="lft" style={{ width: '22%' }}>
                    Coach
                </th>
                <th className="lft" style={{ width: '15%' }}>
                    Position
                </th>
                <th className="lft" style={{ width: '15%' }}>
                    Date
                </th>
                <th className="lft">Processed by</th>
            </tr>
        </thead>
        <tbody>
            {transactions.map((transaction, index) => (
                <tr key={`${transaction.team}-${transaction.transaction_date}-${index}`}>
                    <td className="lft">
                        <TeamButton team={transaction.team} onClick={onTeamClick} />
                    </td>
                    <td className="lft">
                        <TransactionChip type={transaction.transaction} />
                    </td>
                    <td className="lft">
                        <CoachLinks transaction={transaction} />
                    </td>
                    <td className="lft">{formatPosition(transaction.position)}</td>
                    <td className="lft">{formatDateTime(transaction.transaction_date)}</td>
                    <td className="lft">{transaction.processed_by || '-'}</td>
                </tr>
            ))}
        </tbody>
    </DataTable>
);

TransactionTable.propTypes = {
    transactions: PropTypes.array.isRequired,
    onTeamClick: PropTypes.func.isRequired,
};

export default TransactionTable;
