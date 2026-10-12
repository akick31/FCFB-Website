import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import SearchableSelect from '../ui/SearchableSelect';
import { paramConfig, PAGE_SIZE_PRESETS } from '../../utils/apiDocsParamConfig';
import { humanizeParamName } from '../../utils/humanize';
import { inputSx, labelSx } from './apiExplorerStyles';

const ParamInput = ({ param, value, onChange, config }) => {
    const displayLabel = config.label || humanizeParamName(param.name);
    return (
        <Box>
            <Box sx={{ ...labelSx, mb: '4px' }}>
                {displayLabel}
                {param.required && ' *'}
            </Box>
            {config.uiType === 'select' ? (
                <Box component="select" sx={inputSx} value={value} onChange={(e) => onChange(e.target.value)}>
                    <option value="">Select...</option>
                    {config.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Box>
            ) : config.uiType === 'multiselect' ? (
                <Box
                    component="select"
                    multiple
                    sx={{ ...inputSx, height: `${Math.min(config.options.length, 5) * 28 + 16}px` }}
                    value={value}
                    onChange={(e) => onChange(Array.from(e.target.selectedOptions, (option) => option.value))}
                >
                    {config.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Box>
            ) : config.uiType === 'search' ? (
                <SearchableSelect
                    id={`dl-${param.name}`}
                    value={value}
                    onChange={onChange}
                    options={config.options}
                    placeholder={`Search ${displayLabel.toLowerCase()}...`}
                />
            ) : config.uiType === 'pageable' ? (
                <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '0 0 90px' }}>
                        <Box sx={{ ...labelSx, mb: '4px', fontWeight: 400 }}>Page</Box>
                        <Box
                            component="input"
                            type="number"
                            min={0}
                            sx={inputSx}
                            value={value.page}
                            onChange={(e) => onChange({ ...value, page: e.target.value })}
                        />
                    </Box>
                    <Box sx={{ flex: '0 0 110px' }}>
                        <Box sx={{ ...labelSx, mb: '4px', fontWeight: 400 }}>Page size</Box>
                        <Box
                            component="select"
                            sx={inputSx}
                            value={value.size}
                            onChange={(e) => onChange({ ...value, size: e.target.value })}
                        >
                            {PAGE_SIZE_PRESETS.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </Box>
                    </Box>
                    {config.sortFieldOptions && (
                        <>
                            <Box sx={{ flex: '0 0 140px' }}>
                                <Box sx={{ ...labelSx, mb: '4px', fontWeight: 400 }}>Sort by</Box>
                                <Box
                                    component="select"
                                    sx={inputSx}
                                    value={value.sortField}
                                    onChange={(e) => onChange({ ...value, sortField: e.target.value })}
                                >
                                    <option value="">(default order)</option>
                                    {config.sortFieldOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Box>
                            </Box>
                            <Box sx={{ flex: '0 0 130px' }}>
                                <Box sx={{ ...labelSx, mb: '4px', fontWeight: 400 }}>Direction</Box>
                                <Box
                                    component="select"
                                    sx={inputSx}
                                    value={value.sortDirection}
                                    onChange={(e) => onChange({ ...value, sortDirection: e.target.value })}
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </Box>
                            </Box>
                        </>
                    )}
                </Box>
            ) : (
                <Box component="input" sx={inputSx} value={value} onChange={(e) => onChange(e.target.value)} />
            )}
        </Box>
    );
};

ParamInput.propTypes = {
    param: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.object]).isRequired,
    onChange: PropTypes.func.isRequired,
    config: PropTypes.shape({
        uiType: PropTypes.oneOf(['select', 'multiselect', 'search', 'text', 'pageable']).isRequired,
        label: PropTypes.string,
        options: PropTypes.array,
    }).isRequired,
};

const ParamGroup = ({ title, params, paramValues, setParamValues, lookups, operationPath }) => {
    if (params.length === 0) {
        return null;
    }
    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ ...labelSx, mb: '8px' }}>{title}</Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {params.map((p) => {
                    const config = paramConfig(p, lookups, paramValues, operationPath);
                    const fallback =
                        config.uiType === 'multiselect'
                            ? []
                            : config.uiType === 'pageable'
                              ? { page: 0, size: 20, sortField: '', sortDirection: 'asc' }
                              : '';
                    return (
                        <ParamInput
                            key={p.name}
                            param={p}
                            value={paramValues[p.name] || fallback}
                            onChange={(val) => setParamValues((v) => ({ ...v, [p.name]: val }))}
                            config={config}
                        />
                    );
                })}
            </Box>
        </Box>
    );
};

ParamGroup.propTypes = {
    title: PropTypes.string.isRequired,
    params: PropTypes.array.isRequired,
    paramValues: PropTypes.object.isRequired,
    setParamValues: PropTypes.func.isRequired,
    lookups: PropTypes.object.isRequired,
    operationPath: PropTypes.string.isRequired,
};

export default ParamGroup;
