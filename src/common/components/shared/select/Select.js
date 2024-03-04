import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import MaterialSelect from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import { scaleAdvancedValues } from '../../layouts/pages/inspect/constants';

import './Select.scss';

function Select({ id, options, value, mode, labelId, disabled, onChange, onMode }) {
    const [selectValue, setSelectValue] = useState(value);

    const handleChange = useCallback(
        ({ target: { value: newValue } }) => {
            if (scaleAdvancedValues.includes(newValue)) {
                onMode?.(newValue);
                setSelectValue(newValue);
            } else {
                onMode?.('');
                onChange(newValue);
            }
        },
        [onMode, onChange]
    );

    useEffect(() => {
        if (!scaleAdvancedValues.includes(mode)) {
            setSelectValue(value);
        }
    }, [mode, value]);

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
    value: PropTypes.string,
    mode: PropTypes.string,
    labelId: PropTypes.string,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onMode: PropTypes.func,
};

Select.defaultProps = {
    disabled: false,
};

export default Select;
