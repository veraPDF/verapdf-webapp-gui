import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import MaterialCheckbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

function Checkbox({ checked, label, disabled, onChange }) {
    const handleChange = useCallback(e => onChange(e.target.checked), [onChange]);

    return (
        <FormControlLabel
            className="checkbox-container"
            disabled={disabled}
            label={label}
            control={<MaterialCheckbox checked={checked} color="primary" onChange={handleChange} />}
        />
    );
}

Checkbox.propTypes = {
    checked: PropTypes.bool.isRequired,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
};

Checkbox.defaultProps = {
    label: '',
    disabled: false,
};

export default Checkbox;
