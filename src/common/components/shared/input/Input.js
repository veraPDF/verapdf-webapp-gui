import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import MaterialInput from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';

function Input({ id, className, value, type, disabled, inputProps, onChange, onBlur, onEnter }) {
    const handleChange = useCallback(e => onChange(e.target.value), [onChange]);
    const handleBlur = useCallback(e => onBlur(e.target.value), [onBlur]);
    const handleKeyUp = useCallback(
        e => {
            if (e.key === 'Enter') {
                onEnter();
            }
        },
        [onEnter]
    );

    return (
        <FormControl className={className} disabled={disabled}>
            <MaterialInput
                className="select-form-controller__select"
                id={id}
                value={value}
                type={type}
                inputProps={inputProps}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyUp={handleKeyUp}
            ></MaterialInput>
        </FormControl>
    );
}

Input.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string,
    type: PropTypes.string,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
    onEnter: PropTypes.func.isRequired,
};

Input.defaultProps = {
    disabled: false,
};

export default Input;
