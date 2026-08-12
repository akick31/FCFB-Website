import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';
import ConferenceMark from '../ui/ConferenceMark';
import RiceSheetMetricRow from './RiceSheetMetricRow';
import QuartileRecordBlock from './QuartileRecordBlock';
import OpponentList from './OpponentList';
import { rankingMetricShortLabel } from '../../constants/rankingMetrics';
import { adjustedMetricShortLabel } from '../../constants/riceSheetAdjustedMetrics';
import { shortTeamName } from '../../utils/shortTeamName';

const LONG_NAME_THRESHOLD = 16;
const CORE_METRIC_TYPES = ['EQUIVALENT_WINS', 'COLLEY_MATRIX', 'ASR'];
const METRIC_ROW_TYPES = [
    ...CORE_METRIC_TYPES,
    'SCORING_OFFENSE', 'SCORING_DEFENSE', 'MARGIN_OF_VICTORY',
    'ADJUSTED_POINTS_FOR', 'ADJUSTED_POINTS_AGAINST', 'ADJUSTED_NET_POINTS',
];

const SHORT_LABEL_OVERRIDES = { SCORING_OFFENSE: 'Offense', SCORING_DEFENSE: 'Defense', MARGIN_OF_VICTORY: 'MoV', COLLEY_MATRIX: 'Colley' };

const metricLabel = (type) => {
    if (SHORT_LABEL_OVERRIDES[type]) return SHORT_LABEL_OVERRIDES[type];
    return type.startsWith('ADJUSTED_') ? adjustedMetricShortLabel(type) : rankingMetricShortLabel(type);
};

const record = (wins, losses) => `${wins ?? 0}-${losses ?? 0}`;

const stopPropagation = (event) => event.stopPropagation();

const chunk3 = (types) => {
    const groups = [];
    for (let i = 0; i < types.length; i += 3) groups.push(types.slice(i, i + 3));
    return groups;
};

const RiceSheetCard = ({
    team, mark, conference, compositeRank, metricsByType, resume, sosRank, opponents, opponentsLoading, onRemove,
    compact, onToggleCompact, onDragHandleStart, onDragHandleEnd,
}) => {
    const displayName = compact
        ? (mark?.abbreviation || team.name)
        : (team.name.length >= LONG_NAME_THRESHOLD ? shortTeamName(team.name) : team.name);

    return (
        <Box sx={{ width: '100%' }}>
            <Panel
                sx={{ cursor: 'pointer' }}
                onClick={onToggleCompact}
                header={(
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: compact ? 0.5 : 1, width: '100%' }}>
                        <Box
                            component="span"
                            draggable
                            onDragStart={onDragHandleStart}
                            onDragEnd={onDragHandleEnd}
                            onClick={stopPropagation}
                            aria-label={`Reorder ${team.name}`}
                            sx={{ display: 'flex', alignItems: 'center', color: 'var(--text-dim)', cursor: 'grab', flexShrink: 0, '&:active': { cursor: 'grabbing' } }}
                        >
                            <DragIndicatorIcon fontSize="small" />
                        </Box>
                        <Box sx={{ color: 'var(--gold)', fontWeight: 800, flexShrink: 0 }}>{compositeRank != null ? `#${compositeRank}` : '-'}</Box>
                        <Box
                            component={Link}
                            to={`/team-details/${team.id}`}
                            onClick={stopPropagation}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}
                        >
                            <TeamMark team={mark} size={22} />
                            <Box
                                title={displayName !== team.name ? team.name : undefined}
                                sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}
                            >
                                {displayName}
                            </Box>
                        </Box>
                        <IconButton size="small" aria-label={`Remove ${team.name}`} onClick={(event) => { stopPropagation(event); onRemove(); }} sx={{ flexShrink: 0 }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}
            >
                <Box sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: compact ? 0 : 1 }}>
                        <Box sx={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {record(resume?.overallWins, resume?.overallLosses)}
                            {' '}
                            ({record(resume?.conferenceWins, resume?.conferenceLosses)})
                        </Box>
                        <ConferenceMark conference={conference} size={26} />
                    </Box>
    
                    {compact ? (
                        <>
                            <Box sx={{ borderTop: '1px solid var(--line-soft)', pt: 0.5 }}>
                                {chunk3(CORE_METRIC_TYPES).map((group) => (
                                    <RiceSheetMetricRow
                                        key={group.join('-')}
                                        metrics={group.map((type) => ({
                                            label: metricLabel(type),
                                            rank: metricsByType[type]?.rankByTeamId[team.id],
                                            value: metricsByType[type]?.valueByTeamId[team.id],
                                        }))}
                                    />
                                ))}
                            </Box>
                            <Box sx={{ borderTop: '1px solid var(--line-soft)', pt: 0.75, mt: 0.5, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                Composite SoS: {resume?.compositeSos != null ? resume.compositeSos.toFixed(1) : '-'}
                                {sosRank != null ? ` (#${sosRank})` : ''}
                            </Box>
                        </>
                    ) : (
                        <>
                            <Box sx={{ borderTop: '1px solid var(--line-soft)', pt: 0.5 }}>
                                {chunk3(METRIC_ROW_TYPES).map((group) => (
                                    <RiceSheetMetricRow
                                        key={group.join('-')}
                                        metrics={group.map((type) => ({
                                            label: metricLabel(type),
                                            rank: metricsByType[type]?.rankByTeamId[team.id],
                                            value: metricsByType[type]?.valueByTeamId[team.id],
                                        }))}
                                    />
                                ))}
                            </Box>
    
                            <Box sx={{ borderTop: '1px solid var(--line-soft)' }}>
                                <QuartileRecordBlock resume={resume} />
                            </Box>
    
                            <Box sx={{ borderTop: '1px solid var(--line-soft)', pt: 0.5 }} onClick={stopPropagation}>
                                <OpponentList loading={opponentsLoading} opponents={opponents} />
                            </Box>
    
                            <Box sx={{ borderTop: '1px solid var(--line-soft)', pt: 0.75, mt: 0.5, display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                <span>Avg played: {resume?.avgOpponentCompositeRank != null ? `#${resume.avgOpponentCompositeRank.toFixed(1)}` : '-'}</span>
                                <span>
                                    Composite SoS: {resume?.compositeSos != null ? resume.compositeSos.toFixed(1) : '-'}
                                    {sosRank != null ? ` (#${sosRank})` : ''}
                                </span>
                            </Box>
                        </>
                    )}
                </Box>
            </Panel>
        </Box>
    );
};

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
    compact: PropTypes.bool,
    onToggleCompact: PropTypes.func,
    onDragHandleStart: PropTypes.func,
    onDragHandleEnd: PropTypes.func,
};

export default RiceSheetCard;
