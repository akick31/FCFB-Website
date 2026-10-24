import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { getStadiums } from '../../api/stadiumApi';
import { inputSx } from './stadiumStyles';

export const BUILD_NEW = '__build_new__';

const StadiumPicker = ({
    value,
    onChange,
    allowNone = false,
    noneLabel = 'Standard crowd',
    allowBuild = false,
    disabled = false,
    ariaLabel = 'Stadium',
}) => {
    const [stadiums, setStadiums] = useState([]);

    useEffect(() => {
        let active = true;
        getStadiums()
            .then((loaded) => active && setStadiums(loaded))
            .catch(() => active && setStadiums([]));
        return () => {
            active = false;
        };
    }, []);

    const names = stadiums.map((stadium) => stadium.name);
    const options = value && !names.includes(value) ? [value, ...names] : names;

    return (
        <Box
            component="select"
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            aria-label={ariaLabel}
            sx={inputSx}
        >
            {allowNone && <option value="">{noneLabel}</option>}
            {!allowNone && !value && <option value="">Choose a stadium</option>}
            {allowBuild && <option value={BUILD_NEW}>Build a new stadium…</option>}
            {options.map((name) => (
                <option key={name} value={name}>
                    {name}
                </option>
            ))}
        </Box>
    );
};

StadiumPicker.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    allowNone: PropTypes.bool,
    noneLabel: PropTypes.string,
    allowBuild: PropTypes.bool,
    disabled: PropTypes.bool,
    ariaLabel: PropTypes.string,
};

export default StadiumPicker;
