import React from 'react';
import PropTypes from 'prop-types';
import ErrorIcon from '@material-ui/icons/Error';

import './FatalErrorMessage.scss';

function FatalErrorMessage({ message }) {
    return (
        <p className="fatal-error">
            <ErrorIcon />
            <span>{message}</span>
        </p>
    );
}

FatalErrorMessage.propTypes = {
    message: PropTypes.string.isRequired,
};

export default FatalErrorMessage;
