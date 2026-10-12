import React from 'react';
import { Box } from '@mui/material';
import Panel from '../ui/Panel';
import { humanizeEnumValue } from '../../utils/humanize';
import {
    DOWN_OPTIONS,
    PLAY_TYPE_OPTIONS,
    SIDE_OPTIONS,
    FIELD_POSITION_OPTIONS,
    TEMPO_OPTIONS,
    CUSTOM_FIELD_CATALOG,
    OPERATORS_BY_TYPE,
} from '../../utils/scoutingReport';
import { inputSx, ghostBtnSx, labelSx } from './scoutingStyles';
import Chip from './ScoutingFilterChip';
import { toggleInArray } from '../../utils/scoutingReport';

const ScoutingScenarioFilters = ({ filters }) => {
    const {
        sides,
        setSides,
        downs,
        setDowns,
        fieldPositions,
        setFieldPositions,
        playTypes,
        setPlayTypes,
        tempo,
        setTempo,
        addCustomFilter,
        customFilters,
        updateCustomFilter,
        removeCustomFilter,
    } = filters;
    return (
        <Panel sx={{ mb: '16px' }}>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Box>
                    <Box sx={{ ...labelSx, mb: '8px' }}>Side</Box>
                    <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {SIDE_OPTIONS.map((option) => (
                            <Chip
                                key={option.value}
                                active={sides.includes(option.value)}
                                onClick={() => setSides((prev) => toggleInArray(prev, option.value))}
                            >
                                {option.label}
                            </Chip>
                        ))}
                    </Box>
                </Box>
                <Box>
                    <Box sx={{ ...labelSx, mb: '8px' }}>Down</Box>
                    <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {DOWN_OPTIONS.map((option) => (
                            <Chip
                                key={option.value}
                                active={downs.includes(option.value)}
                                onClick={() => setDowns((prev) => toggleInArray(prev, option.value))}
                            >
                                {option.label}
                            </Chip>
                        ))}
                    </Box>
                </Box>
                <Box>
                    <Box sx={{ ...labelSx, mb: '8px' }}>Field position</Box>
                    <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {FIELD_POSITION_OPTIONS.map((option) => (
                            <Chip
                                key={option.value}
                                active={fieldPositions.includes(option.value)}
                                onClick={() => setFieldPositions((prev) => toggleInArray(prev, option.value))}
                            >
                                {option.label}
                            </Chip>
                        ))}
                    </Box>
                </Box>
                <Box>
                    <Box sx={{ ...labelSx, mb: '8px' }}>Play type</Box>
                    <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {PLAY_TYPE_OPTIONS.map((option) => (
                            <Chip
                                key={option.value}
                                active={playTypes.includes(option.value)}
                                onClick={() => setPlayTypes((prev) => toggleInArray(prev, option.value))}
                            >
                                {option.label}
                            </Chip>
                        ))}
                    </Box>
                </Box>
                <Box>
                    <Box sx={{ ...labelSx, mb: '8px' }}>Tempo</Box>
                    <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {TEMPO_OPTIONS.map((option) => (
                            <Chip
                                key={option.value}
                                active={tempo.includes(option.value)}
                                onClick={() => setTempo((prev) => toggleInArray(prev, option.value))}
                            >
                                {option.label}
                            </Chip>
                        ))}
                    </Box>
                </Box>
                <Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: '8px',
                        }}
                    >
                        <Box sx={labelSx}>Custom filters</Box>
                        <Box component="button" type="button" onClick={addCustomFilter} sx={ghostBtnSx}>
                            + Add filter
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {customFilters.map((filter) => {
                            const field = CUSTOM_FIELD_CATALOG.find((entry) => entry.key === filter.field);
                            return (
                                <Box
                                    key={filter.id}
                                    sx={{
                                        display: 'flex',
                                        gap: '8px',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box
                                        component="select"
                                        sx={inputSx}
                                        value={filter.field}
                                        onChange={(event) => {
                                            const nextField = CUSTOM_FIELD_CATALOG.find(
                                                (entry) => entry.key === event.target.value
                                            );
                                            updateCustomFilter(filter.id, {
                                                field: nextField.key,
                                                operator: OPERATORS_BY_TYPE[nextField.type][0].value,
                                                value: '',
                                            });
                                        }}
                                    >
                                        {CUSTOM_FIELD_CATALOG.map((entry) => (
                                            <option key={entry.key} value={entry.key}>
                                                {entry.label}
                                            </option>
                                        ))}
                                    </Box>
                                    <Box
                                        component="select"
                                        sx={inputSx}
                                        value={filter.operator}
                                        onChange={(event) =>
                                            updateCustomFilter(filter.id, { operator: event.target.value })
                                        }
                                    >
                                        {OPERATORS_BY_TYPE[field.type].map((op) => (
                                            <option key={op.value} value={op.value}>
                                                {op.label}
                                            </option>
                                        ))}
                                    </Box>
                                    {field.type === 'enum' ? (
                                        <Box
                                            component="select"
                                            sx={inputSx}
                                            value={filter.value}
                                            onChange={(event) =>
                                                updateCustomFilter(filter.id, { value: event.target.value })
                                            }
                                        >
                                            <option value="">Select…</option>
                                            {field.options.map((option) => (
                                                <option key={option} value={option}>
                                                    {humanizeEnumValue(option)}
                                                </option>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box
                                            component="input"
                                            type={field.type === 'number' ? 'number' : 'text'}
                                            sx={inputSx}
                                            value={filter.value}
                                            onChange={(event) =>
                                                updateCustomFilter(filter.id, { value: event.target.value })
                                            }
                                        />
                                    )}
                                    <Box
                                        component="button"
                                        type="button"
                                        onClick={() => removeCustomFilter(filter.id)}
                                        sx={{ ...ghostBtnSx, px: '10px' }}
                                    >
                                        Remove
                                    </Box>
                                </Box>
                            );
                        })}
                        {customFilters.length === 0 && (
                            <Box sx={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>No custom filters added.</Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Panel>
    );
};
export default ScoutingScenarioFilters;
