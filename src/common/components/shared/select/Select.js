import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import MaterialSelect from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import { scaleAdvancedValues } from '../../layouts/pages/inspect/constants';

import './Select.scss';

function Select({ id, options, scale, mode, labelId, disabled, onScale, onMode }) {
    const [selectValue, setSelectValue] = useState(scale);

    const handleChange = useCallback(
        ({ target: { value } }) => {
            if (scaleAdvancedValues.includes(value)) {
                onMode(value);
                setSelectValue(value);
            } else {
                onMode('');
                onScale(value);
            }
        },
        [onMode, onScale]
    );

    useEffect(() => {
        if (!scaleAdvancedValues.includes(mode)) {
            setSelectValue(scale);
        }
    }, [mode, scale]);

    return (
        <FormControl className="select-form-controller" disabled={disabled}>
            <MaterialSelect
                className="select-form-controller__select"
                id={id}
                value={selectValue}
                labelId={labelId}
                onChange={handleChange}
                MenuProps={{
                    variant: 'menu',
                }}
            >
                {options.map(option => (
                    <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                    </MenuItem>
                ))}
            </MaterialSelect>
        </FormControl>
    );
}

export const OptionShape = PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
});

Select.propTypes = {
    id: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(OptionShape).isRequired,
    scale: PropTypes.string,
    mode: PropTypes.string,
    labelId: PropTypes.string,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    onScale: PropTypes.func.isRequired,
    onMode: PropTypes.func.isRequired,
};

Select.defaultProps = {
    disabled: false,
};

export default Select;
