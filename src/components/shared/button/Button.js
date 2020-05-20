import React from 'react';
import MaterialButton from '@material-ui/core/Button';
import PropTypes from 'prop-types';

function Button(props) {
    return (
        <MaterialButton {...props} disableElevation>
            {props.children}
        </MaterialButton>
    );
}

Button.propTypes = {
    variant: PropTypes.string,
    color: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
};

export default Button;
