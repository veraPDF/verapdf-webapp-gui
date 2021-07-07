import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Button from '../button/Button';

function LinkButton(props) {
    const { to, disabled, variant, className } = props;

    return (
        <Link to={to} className={classNames('app-link', { 'app-link_disabled': disabled }, className)}>
            <Button variant={variant} color="primary" disabled={disabled}>
                {props.children}
            </Button>
        </Link>
    );
}

LinkButton.propTypes = {
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.func]).isRequired,
    variant: PropTypes.string,
    disabled: PropTypes.bool,
};

export default LinkButton;
