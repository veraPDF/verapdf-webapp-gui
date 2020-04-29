import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import MaterialSelect from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import './Select.scss';

function Select({ id, options, value, labelId, disabled, onChange }) {
    const handleChange = useCallback(e => onChange(e.target.value), [onChange]);

    return (
        <FormControl className="select-form-controller" disabled={disabled}>
            <MaterialSelect
                className="select-form-controller__select"
                id={id}
                value={value}
                labelId={labelId}
                onChange={handleChange}
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
    labelId: PropTypes.string,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

Select.defaultProps = {
    disabled: false,
};

export default Select;
