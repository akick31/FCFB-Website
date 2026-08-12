import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';
import ConferenceMark from '../ui/ConferenceMark';
import RiceSheetMetricRow from './RiceSheetMetricRow';
import QuartileRecordBlock from './QuartileRecordBlock';
import OpponentList from './OpponentList';
import { rankingMetricShortLabel } from '../../constants/rankingMetrics';
import { adjustedMetricShortLabel } from '../../constants/riceSheetAdjustedMetrics';

const METRIC_ROW_TYPES = [
    'EQUIVALENT_WINS', 'COLLEY_MATRIX', 'ASR',
    'SCORING_OFFENSE', 'SCORING_DEFENSE', 'MARGIN_OF_VICTORY',
    'ADJUSTED_POINTS_FOR', 'ADJUSTED_POINTS_AGAINST', 'ADJUSTED_NET_POINTS',
];

const RAW_METRIC_SHORT_LABELS = { SCORING_OFFENSE: 'Off', SCORING_DEFENSE: 'Def', MARGIN_OF_VICTORY: 'MoV' };

const metricLabel = (type) => {
    if (RAW_METRIC_SHORT_LABELS[type]) return RAW_METRIC_SHORT_LABELS[type];
    return type.startsWith('ADJUSTED_') ? adjustedMetricShortLabel(type) : rankingMetricShortLabel(type);
};

const record = (wins, losses) => `${wins ?? 0}-${losses ?? 0}`;

const RiceSheetCard = ({ team, mark, conference, compositeRank, metricsByType, resume, sosRank, opponents, opponentsLoading, onRemove }) => (
    <Box sx={{ width: '100%', minWidth: 300, maxWidth: 360 }}>
        <Panel
            header={(
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Box sx={{ color: 'var(--gold)', fontWeight: 800 }}>{compositeRank != null ? `#${compositeRank}` : '-'}</Box>
                    <Box component={Link} to={`/team-details/${team.id}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}>
                        <TeamMark team={mark} size={22} />
                        <Box sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</Box>
                    </Box>
                    <IconButton size="small" aria-label={`Remove ${team.name}`} onClick={onRemove}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}
        >
            <Box sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {record(resume?.overallWins, resume?.overallLosses)}
                        {' '}
                        ({record(resume?.conferenceWins, resume?.conferenceLosses)})
                    </Box>
                    <ConferenceMark conference={conference} size={18} />
                </Box>

                <Box sx={{ borderTop: '1px solid var(--line-soft)', pt: 0.5 }}>
                    {METRIC_ROW_TYPES.map((type) => (
                        <RiceSheetMetricRow
                            key={type}
                            label={metricLabel(type)}
                            rank={metricsByType[type]?.rankByTeamId[team.id]}
                            value={metricsByType[type]?.valueByTeamId[team.id]}
                        />
                    ))}
                </Box>

                <Box sx={{ borderTop: '1px solid var(--line-soft)' }}>
                    <QuartileRecordBlock resume={resume} />
                </Box>

                <Box sx={{ borderTop: '1px solid var(--line-soft)', pt: 0.5 }}>
                    <OpponentList loading={opponentsLoading} opponents={opponents} />
                </Box>

                <Box sx={{ borderTop: '1px solid var(--line-soft)', pt: 0.75, mt: 0.5, display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>Avg played: {resume?.avgOpponentCompositeRank != null ? `#${resume.avgOpponentCompositeRank.toFixed(1)}` : '-'}</span>
                    <span>
                        Composite SoS: {resume?.compositeSos != null ? resume.compositeSos.toFixed(1) : '-'}
                        {sosRank != null ? ` (#${sosRank})` : ''}
                    </span>
                </Box>
            </Box>
        </Panel>
    </Box>
);

RiceSheetCard.propTypes = {
    team: PropTypes.object.isRequired,
    mark: PropTypes.object,
    conference: PropTypes.string,
    compositeRank: PropTypes.number,
    metricsByType: PropTypes.object.isRequired,
    resume: PropTypes.object,
    sosRank: PropTypes.number,
    opponents: PropTypes.array.isRequired,
    opponentsLoading: PropTypes.bool.isRequired,
    onRemove: PropTypes.func.isRequired,
};

export default RiceSheetCard;
