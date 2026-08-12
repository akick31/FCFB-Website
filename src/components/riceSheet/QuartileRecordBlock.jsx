import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const record = (wins, losses) => `${wins ?? 0}-${losses ?? 0}`;

const ENTRIES = [
    { label: 'Q1', winsKey: 'q1Wins', lossesKey: 'q1Losses' },
    { label: 'Q2', winsKey: 'q2Wins', lossesKey: 'q2Losses' },
    { label: 'Q3', winsKey: 'thWins', lossesKey: 'thLosses' },
    { label: 'Q4', winsKey: 'q4Wins', lossesKey: 'q4Losses' },
    { label: 'T25', winsKey: 't25Wins', lossesKey: 't25Losses' },
    { label: 'T50', winsKey: 't50Wins', lossesKey: 't50Losses' },
    { label: 'T100', winsKey: 't100Wins', lossesKey: 't100Losses' },
];

const QuartileRecordBlock = ({ resume }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, py: 1 }}>
        {ENTRIES.map(({ label, winsKey, lossesKey }) => (
            <Box key={label} sx={{ textAlign: 'center' }}>
                <Box sx={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</Box>
                <Box className="num" sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    {resume ? record(resume[winsKey], resume[lossesKey]) : '-'}
                </Box>
            </Box>
        ))}
    </Box>
);

QuartileRecordBlock.propTypes = {
    resume: PropTypes.object,
};

export default QuartileRecordBlock;
